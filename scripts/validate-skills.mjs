#!/usr/bin/env node
/**
 * Validates the objective rules of the plugin's skills (SPEC 01).
 *
 * Usage: node scripts/validate-skills.mjs [--root <skills-dir>] [--evals <cases.jsonl>] [--expect-evals <n>]
 *
 * All skills: name = folder, kebab-case ending in `-roy`, description <= 1024 chars, third person,
 * has a `Trigger:`, SKILL.md < 200 lines, no Spanish text.
 * Engineering skills (ENGINEERING_SKILLS): plus `references/` one level deep, each reference <= 100 lines,
 * every non-checklist reference has a `Last verified: YYYY-MM-DD` line and every `##` section a `Source: <URL>` line, and `references/checklist.md`
 * has at least 5 `- [ ]` items.
 * Exit code 1 when any error is found. Warnings (version-like numbers in references) do not fail.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const ROOT = opt('--root', join(HERE, '..', 'skills'));
const EVALS = opt('--evals', join(HERE, '..', 'evals', 'cases.jsonl'));
const EXPECT_EVALS = opt('--expect-evals', null);

const ENGINEERING_SKILLS = new Set([
  'testing-roy', 'security-roy', 'typescript-roy', 'database-roy',
  'frontend-roy', 'backend-roy', 'performance-roy', 'delivery-roy',
]);
const SPANISH = /[áéíóúñÁÉÍÓÚÑ¿¡]/;
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const lines = (text) => text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');

function frontmatter(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^"([\s\S]*)"$/, '$1');
  }
  return out;
}

function checkSkill(dir) {
  const where = `skills/${dir}`;
  const file = join(ROOT, dir, 'SKILL.md');
  if (!existsSync(file)) return err(where, 'missing SKILL.md');
  const text = readFileSync(file, 'utf8');
  const fm = frontmatter(text);
  if (!fm) return err(where, 'missing or malformed frontmatter (the opening --- must be on line 1)');

  if (fm.name !== dir) err(where, `name "${fm.name}" must equal the folder name`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*-roy$/.test(dir)) err(where, 'name must be kebab-case and end in -roy');
  if (!fm.description) err(where, 'missing description');
  else {
    if (fm.description.length > 1024) err(where, `description has ${fm.description.length} chars (max 1024)`);
    if (!/Trigger:/.test(fm.description)) err(where, 'description must contain "Trigger:" with the trigger phrases');
    if (/^(I|You|Use this|Usa|Esta)\b/.test(fm.description)) err(where, 'description must be written in the third person');
  }
  if (lines(text).length >= 200) err(where, `SKILL.md has ${lines(text).length} lines (max 199)`);
  if (SPANISH.test(text)) err(where, 'Spanish text found in SKILL.md (skills are written in English)');

  const refDir = join(ROOT, dir, 'references');
  if (!ENGINEERING_SKILLS.has(dir)) return;
  if (!existsSync(refDir)) return err(where, 'missing references/ folder');

  const refs = readdirSync(refDir);
  for (const name of refs) {
    const p = join(refDir, name);
    if (statSync(p).isDirectory()) { err(where, `references/${name} is a folder (references must be one level deep)`); continue; }
    if (!name.endsWith('.md')) { err(where, `references/${name} must be a .md file`); continue; }
    const body = readFileSync(p, 'utf8');
    const rwhere = `${where}/references/${name}`;
    if (lines(body).length > 100) err(rwhere, `${lines(body).length} lines (max 100)`);
    if (SPANISH.test(body)) err(rwhere, 'Spanish text found');
    if (name === 'checklist.md') {
      const items = body.match(/^- \[ \] /gm) ?? [];
      if (items.length < 5) err(rwhere, `checklist has ${items.length} items (min 5)`);
      continue;
    }
    if (!/^Last verified: \d{4}-\d{2}-\d{2}$/m.test(body)) err(rwhere, 'missing "Last verified: YYYY-MM-DD" line');
    const sections = body.replace(/\r\n/g, '\n').replace(/```[\s\S]*?```/g, '').split(/^## /m).slice(1);
    if (sections.length === 0) err(rwhere, 'no "## " sections');
    for (const s of sections) {
      const title = s.split('\n')[0].trim();
      if (!/^Sources?: <?https?:\/\/\S+/m.test(s)) err(rwhere, `section "${title}" has no "Source: <URL>" line`);
    }
    const versions = body.match(/\bv?\d+\.\d+\.\d+\b/g);
    if (versions) warn(rwhere, `version-like numbers to review: ${[...new Set(versions)].join(', ')}`);
  }
  if (!refs.includes('checklist.md')) err(where, 'missing references/checklist.md');
  if (!/references\//.test(text)) err(where, 'SKILL.md does not route to references/');
}

if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) {
  console.error(`error skills root not found: ${ROOT}`);
  process.exit(1);
}
const skillDirs = readdirSync(ROOT).filter((d) => !d.startsWith('_') && !d.startsWith('.') && statSync(join(ROOT, d)).isDirectory());
for (const dir of skillDirs) checkSkill(dir);
const evalsRequested = args.includes('--evals') || EXPECT_EVALS !== null;
if (!existsSync(EVALS)) {
  if (evalsRequested) err('evals', `file not found: ${EVALS}`);
} else {
  const rows = readFileSync(EVALS, 'utf8').replace(/\r\n/g, '\n').split('\n');
  let valid = 0;
  const ids = [];
  rows.forEach((row, i) => {
    if (!row.trim()) return;
    try {
      const o = JSON.parse(row);
      for (const k of ['id', 'route', 'repo', 'prompt', 'expect']) if (typeof o[k] !== 'string' || !o[k]) throw new Error(`missing "${k}"`);
      valid++;
      ids.push(o.id);
    } catch (e) { err(`evals/cases.jsonl:${i + 1}`, e.message); }
  });
  if (new Set(ids).size !== ids.length) err('evals/cases.jsonl', 'duplicate ids');
  if (EXPECT_EVALS !== null && valid !== Number(EXPECT_EVALS)) err('evals/cases.jsonl', `expected ${EXPECT_EVALS} valid cases, found ${valid}`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`OK (${skillDirs.length} skills checked)`);
