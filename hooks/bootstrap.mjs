#!/usr/bin/env node
// SessionStart: deja Engram y CodeGraph instalados y cableados como lo hace gentle-ai,
// e inyecta sus reglas como contexto. Idempotente y fail-open (siempre exit 0).
// Todo en un solo proceso y en orden: dos hooks en paralelo se pisarían al editar ~/.claude.json.
//   Engram:    binario (descarga verificada o go install) -> MCP de usuario -> plugin engram@engram,
//              y una vez al día sube el binario y el plugin si hay versión nueva
//   CodeGraph: CLI (npm) -> `codegraph install` (MCP + hook + permiso) -> ver ./codegraph.mjs
//   stdout =   avisos + rules/behavior.md + rules/engram-protocol.md + rules/codegraph-guidance.md, por prioridad
//              y sin pasar el límite de 10.000 caracteres del hook (ver ./lib/context.mjs)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync, copyFileSync, renameSync, statSync } from 'node:fs';
import { homedir, tmpdir, platform, arch } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { codegraphGuidance, ensureCodegraph } from './codegraph.mjs';
import { composeContext, readRule } from './lib/context.mjs';
import { versionLess } from './lib/version.mjs';
import { run as spawn } from './run.mjs';

const ROOT = process.env.CLAUDE_PLUGIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const WIN = platform() === 'win32';
const BIN_NAME = WIN ? 'engram.exe' : 'engram';
const INSTALL_DIR = process.env.RAI_ENGRAM_DIR
  || (WIN ? join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'engram', 'bin')
          : join(homedir(), '.local', 'bin'));
const REPO = 'Gentleman-Programming/engram';
const UPDATE_STAMP = join(INSTALL_DIR, '.rai-update-check');
const UPDATE_EVERY_MS = 24 * 60 * 60 * 1000;
const notes = [];

const run = (cmd, args, opts = {}) => spawn(cmd, args, opts);

function findEngram() {
  const onPath = run('engram', ['version'], { timeout: 5_000 });
  if (onPath.status === 0) return 'engram';
  const local = join(INSTALL_DIR, BIN_NAME);
  if (existsSync(local) && run(local, ['version'], { timeout: 5_000 }).status === 0) return local;
  return null;
}

async function gh(path) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'roymasoft-ai' };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json();
}

// Solo releases del binario core (vX.Y.Z); el repo también publica paquetes npm/pi con otros tags.
async function latestCoreVersion() {
  const releases = await gh(`/repos/${REPO}/releases?per_page=20`);
  const hit = releases.find(r => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+$/.test(r.tag_name)
    && r.assets?.some(a => a.name.startsWith('engram_')));
  if (!hit) throw new Error('no hay release core de engram');
  return hit.tag_name.slice(1);
}

async function download(url, dest) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`descarga ${url}: ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// En Windows un exe en uso (MCP de otra sesión) no se sobrescribe ni se borra, pero sí se renombra;
// las copias viejas se limpian cuando ya nadie las usa.
function replaceBinary(src, dest) {
  for (const f of readdirSync(INSTALL_DIR).filter(n => n.startsWith(`${BIN_NAME}.`) && n.endsWith('.old'))) {
    try { rmSync(join(INSTALL_DIR, f)); } catch { /* aún en uso */ }
  }
  const old = existsSync(dest) ? `${dest}.${Date.now()}.old` : null;
  if (old) renameSync(dest, old);
  try { copyFileSync(src, dest); }
  catch (e) { if (old) renameSync(old, dest); throw e; }
  return old;
}

async function installBinary(version) {
  const goos = WIN ? 'windows' : platform() === 'darwin' ? 'darwin' : 'linux';
  const goarch = arch() === 'arm64' ? 'arm64' : 'amd64';
  const archive = `engram_${version}_${goos}_${goarch}${WIN ? '.zip' : '.tar.gz'}`;
  const base = `https://github.com/${REPO}/releases/download/v${version}`;
  const tmp = mkdtempSync(join(tmpdir(), 'rai-engram-'));
  try {
    const file = join(tmp, archive);
    await download(`${base}/${archive}`, file);
    const sums = await (await fetch(`${base}/checksums.txt`, { signal: AbortSignal.timeout(20_000) })).text();
    const expected = sums.split(/\r?\n/).map(l => l.trim().split(/\s+/)).find(p => p[1] === archive)?.[0];
    if (!expected) throw new Error(`${archive} no figura en checksums.txt`);
    const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (actual !== expected) throw new Error(`checksum no coincide para ${archive}`);
    const out = join(tmp, 'out');
    mkdirSync(out);
    // En Windows se usa el bsdtar del sistema: el GNU tar de Git Bash toma "C:" como host remoto.
    const tar = WIN ? join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
    const x = run(tar, [WIN ? '-xf' : '-xzf', file, '-C', out]);
    if (x.status !== 0) throw new Error(`extracción falló: ${x.stderr}`);
    mkdirSync(INSTALL_DIR, { recursive: true });
    const dest = join(INSTALL_DIR, BIN_NAME);
    const previous = replaceBinary(join(out, BIN_NAME), dest);
    // Una política de control de aplicaciones (Windows) puede bloquear el exe descargado: se verifica que ejecute.
    if (run(dest, ['version'], { timeout: 10_000 }).status !== 0) {
      rmSync(dest, { force: true });
      if (previous) renameSync(previous, dest);
      throw new Error('el binario descargado no ejecuta (¿bloqueado por una política del sistema?)');
    }
    notes.push(`engram ${version} instalado en ${INSTALL_DIR}${WIN ? ' (agrégalo al PATH si no está)' : ''}.`);
    return dest;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

function ensureMcp(engramCmd) {
  const cfg = readJson(join(homedir(), '.claude.json'));
  if (cfg?.mcpServers?.engram) return; // ya registrado
  const bin = engramCmd === 'engram' ? 'engram' : engramCmd;
  const r = run('claude', ['mcp', 'add', '--scope', 'user', 'engram', '--', bin, 'mcp', '--tools=agent'], { shell: WIN });
  notes.push(r.status === 0
    ? 'MCP engram registrado (ámbito usuario). Reinicia Claude Code para cargarlo.'
    : `No pude registrar el MCP engram: ejecuta \`claude mcp add --scope user engram -- ${bin} mcp --tools=agent\`.`);
}

function ensureEngramPlugin() {
  const settings = readJson(join(homedir(), '.claude', 'settings.json'));
  if (settings?.enabledPlugins?.['engram@engram']) return;
  const a = run('claude', ['plugin', 'marketplace', 'add', REPO], { shell: WIN });
  const b = a.status === 0 ? run('claude', ['plugin', 'install', 'engram@engram'], { shell: WIN }) : a;
  notes.push(b.status === 0
    ? 'Plugin engram@engram instalado. Reinicia Claude Code (o /reload-plugins) para activar sus hooks.'
    : 'No pude instalar engram@engram: ejecuta `claude plugin marketplace add Gentleman-Programming/engram` y `claude plugin install engram@engram`.');
}

// Alternativa si la descarga falla: compilar localmente con Go (mismo módulo que usa gentle-ai).
function installWithGo() {
  if (run('go', ['version'], { timeout: 5_000 }).status !== 0) throw new Error('sin Go para compilar engram');
  mkdirSync(INSTALL_DIR, { recursive: true });
  const r = run('go', ['install', `github.com/${REPO}/cmd/engram@latest`],
    { env: { ...process.env, GOBIN: INSTALL_DIR }, timeout: 80_000 });
  if (r.status !== 0) throw new Error(`go install falló: ${(r.stderr || '').trim().split('\n').pop()}`);
  notes.push(`engram compilado con Go en ${INSTALL_DIR}${WIN ? ' (agrégalo al PATH si no está)' : ''}.`);
  return join(INSTALL_DIR, BIN_NAME);
}

function engramVersion(cmd) {
  return run(cmd, ['version'], { timeout: 5_000 }).stdout?.match(/\d+\.\d+\.\d+/)?.[0] ?? null;
}

function updateDue() {
  try { return Date.now() - statSync(UPDATE_STAMP).mtimeMs > UPDATE_EVERY_MS; } catch { return true; }
}

// Solo se sube el binario que instala este plugin; uno de otro gestor (brew, go, scoop) se avisa.
async function updateEngram(engram) {
  mkdirSync(INSTALL_DIR, { recursive: true });
  writeFileSync(UPDATE_STAMP, new Date().toISOString());
  const managed = join(INSTALL_DIR, BIN_NAME);
  const current = engramVersion(engram);
  const latest = await latestCoreVersion();
  if (current && versionLess(current, latest)) {
    if (existsSync(managed)) {
      if (versionLess(engramVersion(managed) ?? '0.0.0', latest)) await installBinary(latest);
      const active = engramVersion(engram);
      if (active && versionLess(active, latest)) notes.push(`El engram del PATH sigue en ${active}: quita la otra instalación o actualízala.`);
    } else {
      notes.push(`engram ${current} está desactualizado (última ${latest}): actualízalo con el gestor con que lo instalaste.`);
    }
  }
  const m = run('claude', ['plugin', 'marketplace', 'update', 'engram'], { shell: WIN, timeout: 120_000 });
  const p = m.status === 0 ? run('claude', ['plugin', 'update', 'engram@engram'], { shell: WIN, timeout: 120_000 }) : m;
  const bump = p.stdout?.match(/updated from (\S+) to (\S+)/);
  if (bump) notes.push(`Plugin engram@engram actualizado de ${bump[1]} a ${bump[2]}. Reinicia Claude Code para activarlo.`);
}

try {
  let engram = findEngram();
  if (!engram) {
    try { engram = await installBinary(await latestCoreVersion()); }
    catch (e) { engram = installWithGo(); notes.push(`Descarga descartada: ${e.message}.`); }
  }
  ensureMcp(engram);
  ensureEngramPlugin();
  if (updateDue()) {
    try { await updateEngram(engram); }
    catch (e) { notes.push(`No pude comprobar actualizaciones de Engram: ${e.message}`); }
  }
} catch (err) {
  notes.push(`Bootstrap de Engram incompleto: ${err.message}`);
}

let codegraphReady = false;
try { codegraphReady = ensureCodegraph(notes); }
catch (err) { notes.push(`Bootstrap de CodeGraph incompleto: ${err.message}`); }

const sections = [];
if (notes.length) sections.push({ name: 'avisos', text: `## roymasoft-ai: configuración de Engram y CodeGraph\n${notes.map(n => `- ${n}`).join('\n')}` });
for (const [name, file] of [['reglas de trabajo', 'behavior.md'], ['protocolo de Engram', 'engram-protocol.md']]) {
  try { sections.push({ name, text: readRule(ROOT, file) }); } catch { /* sin reglas: no bloquear */ }
}
// Sin CLI no se inyectan las reglas de CodeGraph: mandarían al agente a una herramienta inexistente.
if (codegraphReady) { try { sections.push({ name: 'reglas de CodeGraph', text: codegraphGuidance(ROOT) }); } catch { /* idem */ } }
console.log(composeContext(sections));
process.exit(0);
