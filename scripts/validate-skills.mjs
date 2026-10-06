#!/usr/bin/env node
/**
 * Validates the objective rules of the plugin's skills (SPEC 01).
 *
 * Usage: node scripts/validate-skills.mjs [--root <skills-dir>] [--evals <evals-dir>] [--expect-evals <n>]
 *
 * All skills: name = folder, kebab-case ending in `-roy`, description <= 1024 chars, third person,
 * has a `Trigger:`, SKILL.md < 200 lines, no Spanish text.
 * Engineering skills (ENGINEERING_SKILLS): plus `references/` one level deep, each reference <= 100 lines,
 * every non-checklist reference has a `Last verified: YYYY-MM-DD` line and every `##` section a `Source: <URL>` line, and `references/checklist.md`
 * has at least 5 `- [ ]` items.
 * Evals (`claude plugin eval` layout): each folder under evals/ (except results/) has a non-empty `prompt.md`
 * and `graders/` with at least one .md grader whose frontmatter `type` is a known grader type.
 * Warns when a skill has no `fires-<skill>` case.
 * Exit code 1 when any error is found. Warnings (version-like numbers in references, skills without an eval) do not fail.
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
const EVALS = opt('--evals', join(HERE, '..', 'evals'));
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
const GRADER_TYPES = new Set(['regex', 'tool_used', 'tool_order', 'file_exists', 'llm', 'baseline']);

const promptBody = (text) => text.replace(/\r\n/g, '\n').replace(/^---\n(?:[\s\S]*?\n)?---(?:\n|$)/, '').trim();

function checkEvals() {
  if (!existsSync(EVALS) || !statSync(EVALS).isDirectory()) {
    if (evalsRequested) err('evals', `folder not found: ${EVALS}`);
    return;
  }
  const cases = readdirSync(EVALS).filter((d) => d !== 'results' && !d.startsWith('.') && statSync(join(EVALS, d)).isDirectory());
  let valid = 0;
  for (const c of cases) {
    const where = `evals/${c}`;
    const before = errors.length;
    const promptFile = join(EVALS, c, 'prompt.md');
    if (!existsSync(promptFile)) err(where, 'missing prompt.md');
    else if (!promptBody(readFileSync(promptFile, 'utf8'))) err(where, 'prompt.md has no prompt body');
    const gradersDir = join(EVALS, c, 'graders');
    const graders = existsSync(gradersDir) ? readdirSync(gradersDir).filter((n) => n.endsWith('.md')) : [];
    if (graders.length === 0) err(where, 'needs at least one graders/*.md');
    for (const g of graders) {
      const type = frontmatter(readFileSync(join(gradersDir, g), 'utf8'))?.type;
      if (!GRADER_TYPES.has(type)) err(`${where}/graders/${g}`, `frontmatter type "${type}" must be one of ${[...GRADER_TYPES].join(', ')}`);
    }
    if (errors.length === before) valid++;
  }
  if (EXPECT_EVALS !== null && valid !== Number(EXPECT_EVALS)) err('evals', `expected ${EXPECT_EVALS} valid cases, found ${valid}`);
  if (evalsRequested) for (const s of skillDirs) if (!cases.includes(`fires-${s}`)) warn('evals', `skill ${s} has no fires-${s} case`);
}
checkEvals();

for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`OK (${skillDirs.length} skills checked)`);
