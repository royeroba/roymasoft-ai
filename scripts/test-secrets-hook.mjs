#!/usr/bin/env node
/**
 * Regression test for hooks/pretooluse-secrets.mjs (SPEC 01, phase 4).
 * Usage: node scripts/test-secrets-hook.mjs
 * Secrets are built at runtime so this file itself carries no literal secret.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOOK = join(dirname(fileURLToPath(import.meta.url)), '..', 'hooks', 'pretooluse-secrets.mjs');

const awsKey = 'AKIA' + 'ABCDEFGHIJKLMNOP';
const ghToken = 'ghp_' + 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8';
const privateKey = '-----BEGIN ' + 'RSA PRIVATE KEY-----\nMIIEow\n-----END RSA PRIVATE KEY-----';
const awsDocExample = 'AKIA' + 'IOSFODNN7EXAMPLE';
const googleKey = 'AIza' + 'SyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q'; // 4 + 35 chars
const googleKeyEndingInDash = 'AIza' + 'SyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6-';
if (googleKey.length !== 39 || googleKeyEndingInDash.length !== 39) throw new Error('google fixtures must be 39 chars');
const slackBot = 'xox' + 'b-1234567890-abcdefghij';
const slackApp = 'xa' + 'pp-1-A0123456789-0123456789-abcdef';
const stripeLive = 'sk_' + 'live_' + 'a1B2c3D4e5F6g7H8';
const anthropicKey = 'sk-' + 'ant-' + 'api03-abcdefghijklmnopqrstuvwxyz';
const encryptedKey = '-----BEGIN ' + 'ENCRYPTED PRIVATE KEY-----\nMIIFH\n-----END ENCRYPTED PRIVATE KEY-----';

const payload = (tool_name, tool_input) => ({ hook_event_name: 'PreToolUse', tool_name, tool_input });

const cases = [
  { name: 'Write with an AWS access key asks', input: payload('Write', { file_path: 'src/config.js', content: `const k = "${awsKey}";` }), expect: 'ask' },
  { name: 'Write with clean content is silent', input: payload('Write', { file_path: 'src/a.js', content: 'export const a = 1;' }), expect: 'silent' },
  { name: '.env.example is exempt', input: payload('Write', { file_path: '.env.example', content: `AWS_KEY=${awsKey}` }), expect: 'silent' },
  { name: 'bypass variable silences the hook', input: payload('Write', { file_path: 'src/config.js', content: awsKey }), env: { RAI_ALLOW_SECRETS: '1' }, expect: 'silent' },
  { name: 'Edit with a GitHub token asks', input: payload('Edit', { file_path: 'src/ci.js', old_string: 'x', new_string: `token: '${ghToken}'` }), expect: 'ask' },
  { name: 'MultiEdit with a private key in the second edit asks', input: payload('MultiEdit', { file_path: 'k.txt', edits: [{ old_string: 'a', new_string: 'b' }, { old_string: 'c', new_string: privateKey }] }), expect: 'ask' },
  { name: "AWS's documented example key is ignored", input: payload('Write', { file_path: 'docs/aws.md', content: awsDocExample }), expect: 'silent' },
  { name: 'other tools are ignored', input: payload('Bash', { command: `echo ${awsKey}` }), expect: 'silent' },
  { name: 'malformed stdin fails open', raw: '{not json', expect: 'silent' },
  { name: 'Google API key asks', input: payload('Write', { file_path: 'a.js', content: `k="${googleKey}"` }), expect: 'ask' },
  { name: 'Google API key ending in a dash asks', input: payload('Write', { file_path: 'a.js', content: `k="${googleKeyEndingInDash}"` }), expect: 'ask' },
  { name: 'Slack bot token asks', input: payload('Write', { file_path: 'a.js', content: slackBot }), expect: 'ask' },
  { name: 'Slack app token asks', input: payload('Write', { file_path: 'a.js', content: slackApp }), expect: 'ask' },
  { name: 'Stripe live key asks', input: payload('Write', { file_path: 'a.js', content: stripeLive }), expect: 'ask' },
  { name: 'Anthropic key asks', input: payload('Write', { file_path: 'a.js', content: anthropicKey }), expect: 'ask' },
  { name: 'encrypted private key asks', input: payload('Write', { file_path: 'k.pem', content: encryptedKey }), expect: 'ask' },
  { name: 'Stripe test key is ignored', input: payload('Write', { file_path: 'a.js', content: 'sk_' + 'test_' + 'a1B2c3D4e5F6g7H8i9' }), expect: 'silent' },
  { name: 'odd payload: edits is not an array', input: payload('MultiEdit', { file_path: 'a.js', edits: 'nope' }), expect: 'silent' },
  { name: 'odd payload: tool_input missing', input: { hook_event_name: 'PreToolUse', tool_name: 'Write' }, expect: 'silent' },
  { name: 'odd payload: content is not a string', input: payload('Write', { file_path: 'a.js', content: { a: 1 } }), expect: 'silent' },
  { name: 'the reason never repeats the secret', input: payload('Write', { file_path: 'src/config.js', content: awsKey }), expect: 'ask', notContains: awsKey },
];

let failed = 0;
for (const c of cases) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: c.raw ?? JSON.stringify(c.input),
    encoding: 'utf8',
    env: { ...process.env, RAI_ALLOW_SECRETS: '', ...(c.env ?? {}) },
  });
  const out = (r.stdout ?? '').trim();
  let ok = r.status === 0;
  let detail = '';
  if (c.expect === 'silent') ok = ok && out === '';
  else {
    try {
      const d = JSON.parse(out).hookSpecificOutput;
      ok = ok && d.permissionDecision === 'ask' && d.hookEventName === 'PreToolUse';
      if (c.notContains && out.includes(c.notContains)) { ok = false; detail = ' (the output contains the secret)'; }
    } catch { ok = false; }
  }
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name}${detail}${ok ? '' : `  exit=${r.status} out=${out.slice(0, 80)}`}`);
}
console.log(failed ? `\n${failed} failed` : `\nall ${cases.length} passed`);
process.exit(failed ? 1 : 0);
