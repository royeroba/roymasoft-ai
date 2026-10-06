// CodeGraph como lo maneja gentle-ai: CLI vía npm, cableado con el instalador oficial
// (MCP + hook UserPromptSubmit + permiso), y reglas propias en lugar del bloque de CLAUDE.md.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { run as spawn } from './run.mjs';

const WIN = platform() === 'win32';
const MIN_VERSION = '1.4.1'; // contrato de targets de `codegraph install` que usa gentle-ai
const PACKAGE = '@colbymchenry/codegraph@latest';
const LEGACY_BLOCK = /<!-- CODEGRAPH_START -->[\s\S]*?<!-- CODEGRAPH_END -->\n?/;

const run = (cmd, args, timeout = 60_000) => spawn(cmd, args, { timeout, shell: WIN });
const readJson = path => { try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; } };
const versionLess = (a, b) => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0);
  }
  return false;
};

function installedVersion() {
  const r = run('codegraph', ['--version'], 10_000);
  return r.status === 0 ? r.stdout.match(/\d+(?:\.\d+)+/)?.[0] ?? null : null;
}

function isWired() {
  const mcp = readJson(join(homedir(), '.claude.json'))?.mcpServers?.codegraph;
  const settings = readJson(join(homedir(), '.claude', 'settings.json'));
  const hasHook = JSON.stringify(settings?.hooks?.UserPromptSubmit ?? '').includes('codegraph');
  const allowed = settings?.permissions?.allow?.includes('mcp__codegraph__*');
  return mcp?.command === 'codegraph' && hasHook && !!allowed;
}

// El instalador de CodeGraph escribe su propio bloque en CLAUDE.md ("sin .codegraph/, omite CodeGraph"),
// que contradice la regla de inicialización perezosa. gentle-ai lo reemplaza; aquí se retira.
function removeLegacyBlock() {
  const path = join(homedir(), '.claude', 'CLAUDE.md');
  let text;
  try { text = readFileSync(path, 'utf8'); } catch { return false; }
  if (!LEGACY_BLOCK.test(text)) return false;
  writeFileSync(path, text.replace(LEGACY_BLOCK, '').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, ''));
  return true;
}

/** Deja CodeGraph instalado y cableado. Devuelve true si el CLI queda usable. */
export function ensureCodegraph(notes) {
  let version = installedVersion();
  if (!version) {
    const r = run('npm', ['install', '-g', PACKAGE], 120_000);
    version = r.status === 0 ? installedVersion() : null;
    if (!version) {
      notes.push(`No pude instalar CodeGraph: ejecuta \`npm install -g ${PACKAGE}\`.`);
      return false;
    }
    notes.push(`CodeGraph ${version} instalado con npm.`);
  }
  if (versionLess(version, MIN_VERSION)) {
    notes.push(`CodeGraph ${version} es anterior a ${MIN_VERSION}: ejecuta \`npm install -g ${PACKAGE}\`.`);
    return false;
  }
  if (!isWired()) {
    const r = run('codegraph', ['install', '--yes', '--target', 'claude', '--location', 'global'], 60_000);
    notes.push(r.status === 0
      ? 'CodeGraph cableado (MCP, hook de prompt y permiso). Reinicia Claude Code para cargarlo.'
      : 'No pude cablear CodeGraph: ejecuta `codegraph install --yes --target claude --location global`.');
  }
  if (removeLegacyBlock()) notes.push('Retirado el bloque de CodeGraph de ~/.claude/CLAUDE.md (lo reemplazan las reglas de roymasoft-ai).');
  return true;
}

/** Reglas de CodeGraph con el comando de init del plugin ya resuelto. */
export function codegraphGuidance(root) {
  const initCmd = `node "${join(root, 'hooks', 'codegraph-init.mjs')}" --cwd <project-root>`;
  return readFileSync(join(root, 'rules', 'codegraph-guidance.md'), 'utf8').replaceAll('{{INIT_CMD}}', initCmd);
}
