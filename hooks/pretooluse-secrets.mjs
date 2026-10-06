#!/usr/bin/env node
/**
 * PreToolUse — pide confirmación (`ask`) antes de que Write/Edit/MultiEdit escriban un secreto evidente.
 *
 * Solo detecta formatos de secreto muy reconocibles (llaves de AWS, bloques de llave privada, tokens de
 * GitHub, Slack, Stripe, Google y Anthropic). No usa heurísticas genéricas de "password=..." para evitar
 * falsos positivos. No mira comandos de shell: solo el contenido que se escribe en archivos.
 * Exenciones: archivos de plantilla (`.example`, `.sample`, `.template`) y la llave de ejemplo documentada
 * por AWS. El mensaje nunca repite el secreto. Para saltarlo: lanzar Claude Code con RAI_ALLOW_SECRETS=1.
 * Fail-open: cualquier payload raro o error = permitir.
 */
import { readStdin, parsePayload } from './lib/transcript.mjs';

const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);
const TEMPLATE_FILE = /\.(example|sample|template)$/i;
const AWS_DOC_EXAMPLE = /AKIAIOSFODNN7EXAMPLE/g;

const DETECTORS = [
  ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['private key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{22,}\b/],
  ['Slack token', /\b(?:xox[baprse]|xapp)-[A-Za-z0-9-]{10,}/],
  ['Stripe live key', /\b[sr]k_live_[0-9A-Za-z]{16,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}(?![0-9A-Za-z_-])/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
];

/** Texto que la herramienta va a escribir. */
function writtenText(name, input) {
  if (name === 'Write') return String(input?.content ?? '');
  if (name === 'Edit') return String(input?.new_string ?? '');
  if (name === 'MultiEdit') return (input?.edits ?? []).map((e) => String(e?.new_string ?? '')).join('\n');
  return '';
}

function ask(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason },
  }));
}

function main() {
  if (process.env.RAI_ALLOW_SECRETS === '1') return;
  const payload = parsePayload(readStdin());
  if (payload.hook_event_name !== 'PreToolUse') return;
  const { tool_name: name, tool_input: input } = payload;
  if (!WRITE_TOOLS.has(name)) return;

  const file = String(input?.file_path ?? '');
  if (TEMPLATE_FILE.test(file)) return;

  const text = writtenText(name, input).replace(AWS_DOC_EXAMPLE, '');
  const found = DETECTORS.filter(([, re]) => re.test(text)).map(([kind]) => kind);
  if (found.length === 0) return;

  ask(`Posible secreto (${found.join(', ')}) en ${file || 'el archivo'}. Los secretos viven en variables de entorno o en un gestor de secretos, no en el código. Aprueba solo si es intencional (por ejemplo un dato de prueba).`);
}

try {
  main();
} catch {
  // fail-open
}
process.exit(0);
