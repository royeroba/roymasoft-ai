#!/usr/bin/env node
/**
 * PreToolUse (Edit|Write|MultiEdit) — antes del PRIMER edit de código de la sesión, pide
 * confirmación si no hubo búsqueda en memoria Y en CodeGraph (orden: memoria, grafo, grep).
 *
 * Adaptado del gate del harness anterior. Solo pregunta (`ask`), no deniega: abre el prompt de
 * permisos real, que el modelo no puede esquivar, sin bloquear una edición legítima. Dispara una
 * sola vez por sesión y es fail-open: payload raro, transcript ilegible o error = permitir.
 * Límite conocido: no ve lo que ocurre en transcripts de subagentes.
 */
import { readStdin, parsePayload, readTranscriptLines, parseEntry, entryToolUses } from './lib/transcript.mjs';

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.go', '.py', '.rb', '.java', '.kt', '.swift',
  '.rs', '.vue', '.svelte', '.c', '.cc', '.cpp', '.h', '.hpp', '.cs', '.php', '.scala', '.dart',
]);

// mcp__engram__mem_search, mcp__plugin_engram_engram__mem_context, ...
const MEMORY_TOOL = /^mcp__.*engram.*__mem_(search|context|get_observation)$/;
// mcp__codegraph__codegraph_explore, ... (o el CLI por shell cuando el MCP no está)
const GRAPH_TOOL = /^mcp__codegraph__/;
const GRAPH_CLI = /(^|[\s;&|])codegraph(\.cmd)?\s+(explore|query|node|context|callers|callees|impact|files|affected)\b/;

const extensionOf = (p) => /\.[a-zA-Z0-9]+$/.exec(p ?? '')?.[0].toLowerCase() ?? '';
const isCodeEdit = (name, input) => EDIT_TOOLS.has(name) && CODE_EXTENSIONS.has(extensionOf(input?.file_path));

function ask(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason },
  }));
}

function main() {
  const payload = parsePayload(readStdin());
  if (payload.hook_event_name !== 'PreToolUse') return;
  if (!isCodeEdit(payload.tool_name, payload.tool_input)) return;

  const lines = readTranscriptLines(payload.transcript_path);
  if (!lines.length) return;

  let priorCodeEdit = false;
  let sawMemory = false;
  let sawGraph = false;

  for (const line of lines) {
    const entry = parseEntry(line);
    if (!entry) continue;
    for (const use of entryToolUses(entry)) {
      if (payload.tool_use_id && use.id === payload.tool_use_id) continue; // el propio edit, si ya está en el transcript
      if (MEMORY_TOOL.test(use.name)) sawMemory = true;
      if (GRAPH_TOOL.test(use.name)) sawGraph = true;
      if (SHELL_TOOLS.has(use.name) && GRAPH_CLI.test(use.input?.command ?? '')) sawGraph = true;
      if (isCodeEdit(use.name, use.input)) priorCodeEdit = true;
    }
  }

  if (priorCodeEdit) return; // el gate ya tuvo su única oportunidad en esta sesión
  const missing = [!sawMemory && 'memoria (mem_search / mem_context)', !sawGraph && 'CodeGraph (codegraph_explore)'].filter(Boolean);
  if (!missing.length) return;

  ask(
    `Primer edit de código de la sesión y no se ve búsqueda en: ${missing.join(' ni en ')}. ` +
      'Orden de roymasoft-ai: memoria, grafo, grep. Si ya se investigó por otro medio (p. ej. un subagente), se puede continuar.',
  );
}

try {
  main();
} catch {
  // fail-open
}
process.exit(0);
