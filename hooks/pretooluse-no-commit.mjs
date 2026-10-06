#!/usr/bin/env node
/**
 * PreToolUse — bloquea commit y stage: los hace siempre el usuario.
 *
 * Cubre Bash/PowerShell (git add|commit|stage|commit-tree, también tras `&&`, `;`, `|`, con opciones
 * globales como `-C`/`-c`, o dentro de `bash -c "..."`) y las herramientas MCP de git (GitKraken
 * git_add / git_commit / git_commit_composer). Solo mira el primer token de cada comando, así que
 * mencionar "git commit" en un echo/grep/mensaje no dispara el bloqueo.
 * Escape para el caso raro: lanzar Claude Code con RAI_ALLOW_GIT_WRITE=1.
 * Fail-open: cualquier payload raro o error = permitir.
 */
import { readStdin, parsePayload } from './lib/transcript.mjs';

const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const MCP_GIT_WRITE = /^mcp__.*git_(add|commit|commit_composer)$/;
const BLOCKED_SUBCOMMANDS = new Set(['add', 'commit', 'stage', 'commit-tree']);
const WRAPPERS = new Set(['sudo', 'env', 'command', 'time', 'exec', 'nohup', 'builtin']);
const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash', 'pwsh', 'powershell', 'cmd']);
const GIT_OPTS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path']);

const tokens = (s) => s.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
const unquote = (s) => s.replace(/^(["'])([\s\S]*)\1$/, '$2');
const baseName = (t) => unquote(t).split(/[\/]/).pop().toLowerCase().replace(/\.(exe|cmd|bat)$/, '');

/** Subcomando de git bloqueado que ejecuta este comando simple, o null. */
function blockedInSegment(segment, depth) {
  const toks = tokens(segment);
  let i = 0;
  while (i < toks.length && (/^\w+=/.test(toks[i]) || WRAPPERS.has(baseName(toks[i])))) i++;
  if (i >= toks.length) return null;
  const head = baseName(toks[i]);

  if (head === 'git') {
    for (let j = i + 1; j < toks.length; j++) {
      const t = unquote(toks[j]);
      if (GIT_OPTS_WITH_VALUE.has(t)) { j++; continue; }
      if (t.startsWith('-')) continue;
      return BLOCKED_SUBCOMMANDS.has(t) ? t : null;
    }
    return null;
  }

  if (SHELLS.has(head) && depth < 3) {
    const flag = toks.findIndex((t, k) => k > i && /^-(c|lc|command)$/i.test(t) || /^\/c$/i.test(t));
    if (flag > i) return blockedInCommand(unquote(toks.slice(flag + 1).join(' ')), depth + 1);
  }
  return null;
}

function blockedInCommand(command, depth = 0) {
  for (const segment of String(command ?? '').split(/&&|\|\||[;|&\n]/)) {
    const hit = blockedInSegment(segment, depth);
    if (hit) return hit;
  }
  return null;
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
}

function main() {
  if (process.env.RAI_ALLOW_GIT_WRITE === '1') return;
  const payload = parsePayload(readStdin());
  if (payload.hook_event_name !== 'PreToolUse') return;
  const { tool_name: name, tool_input: input } = payload;

  let what = null;
  if (MCP_GIT_WRITE.test(name ?? '')) what = name.replace(/^mcp__.*__/, '');
  else if (SHELL_TOOLS.has(name)) {
    const sub = blockedInCommand(input?.command);
    if (sub) what = `git ${sub}`;
  }
  if (!what) return;

  deny(`Bloqueado (${what}): los commits y el stage los hace el usuario. Deja los cambios sin stage y dile qué archivos tocaste.`);
}

try {
  main();
} catch {
  // fail-open
}
process.exit(0);
