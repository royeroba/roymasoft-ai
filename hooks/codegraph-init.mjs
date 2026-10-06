#!/usr/bin/env node
// Inicialización segura de CodeGraph (equivalente a `gentle-ai codegraph init --cwd <raíz>`).
// Uso: node codegraph-init.mjs --cwd <raíz-del-proyecto>
// Solo acepta la raíz exacta de un repo git; rechaza HOME, temporales y la raíz del disco.
import { spawnSync } from 'node:child_process';
import { run } from './run.mjs';
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import { homedir, tmpdir, platform } from 'node:os';
import { isAbsolute, join, parse, relative, resolve } from 'node:path';

const WIN = platform() === 'win32';
const fail = msg => { console.error(`codegraph-init: ${msg}`); process.exit(1); };
const canon = p => { try { return realpathSync(resolve(p)); } catch { return resolve(p); } };
const same = (a, b) => (WIN ? a.toLowerCase() === b.toLowerCase() : a === b);
const within = (parent, child) => {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

const i = process.argv.indexOf('--cwd');
const arg = i > 0 ? process.argv[i + 1] : '';
if (process.argv.length !== 4 || !arg?.trim()) fail('uso: node codegraph-init.mjs --cwd <raíz-del-proyecto>');

const candidate = canon(arg);
const unsafe = p => {
  if (same(p, parse(p).root)) return true;                      // raíz del disco
  if (same(p, canon(homedir()))) return true;                   // HOME
  return within(canon(tmpdir()), p);                            // temporales
};
if (!existsSync(candidate)) fail(`la ruta no existe: ${candidate}`);
if (unsafe(candidate)) fail(`raíz insegura: ${candidate}`);

const top = spawnSync('git', ['-C', candidate, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
if (top.status !== 0) fail(`${candidate} no es un proyecto git reconocido`);
const root = canon(top.stdout.trim());
if (!same(root, candidate) || unsafe(root)) fail(`raíz insegura: debe ser exactamente la raíz del repo (${root})`);

const init = run('codegraph', ['init', '-y', root], { shell: WIN, stdio: ['ignore', 'inherit', 'inherit'], timeout: 600_000 });
if (init.status !== 0) fail(`falló la inicialización en ${root}`);

// El índice es estado de la máquina: se oculta localmente sin tocar el .gitignore del repo.
const ig = spawnSync('git', ['-C', root, 'check-ignore', '-q', '.codegraph'], { encoding: 'utf8' });
if (ig.status !== 0) {
  const gitDir = spawnSync('git', ['-C', root, 'rev-parse', '--git-dir'], { encoding: 'utf8' }).stdout.trim();
  const infoDir = join(resolve(root, gitDir), 'info');
  mkdirSync(infoDir, { recursive: true });
  const exclude = join(infoDir, 'exclude');
  const cur = existsSync(exclude) ? readFileSync(exclude, 'utf8') : '';
  if (!cur.split(/\r?\n/).includes('.codegraph/')) appendFileSync(exclude, `${cur && !cur.endsWith('\n') ? '\n' : ''}.codegraph/\n`);
}
console.log(`CodeGraph initialized: ${root}`);
