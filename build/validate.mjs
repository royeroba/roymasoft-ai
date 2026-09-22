#!/usr/bin/env node
/**
 * Validates the harness itself: frontmatter, token budgets and dead references.
 *
 * A skill with a vague description never fires, and a skill over budget is one nobody can afford
 * to load. Both fail silently at runtime, which is why they are checked here instead.
 *
 * Usage:  node build/validate.mjs        exit 1 on any error
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HARNESS = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Budgets in estimated tokens (bytes/4). The core is paid on every single turn. */
const CORE_BUDGET = 1500;
const SKILL_BUDGET = 1000;        // auto-invocable: puede dispararse en cualquier tarea
const SKILL_BUDGET_EXPLICIT = 2000; // disable-model-invocation: true — solo la lanza el humano
const SKILL_WARN = 700;

/** Auto-invocable, but the trigger is a narrow, rare SDD-phase hand-off — not "any task" — so
 *  these keep the larger, explicit-only budget even with disable-model-invocation: false. */
const NARROW_TRIGGER_SKILLS = new Set(['spec', 'spec-impl']);

const errors = [];
const warnings = [];

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const tokens = (text) => Math.round(Buffer.byteLength(text, 'utf8') / 4);

function frontmatter(text) {
	const lines = text.split(/\r?\n/);
	if (lines[0]?.trim() !== '---') return null;
	const end = lines.indexOf('---', 1);
	if (end === -1) return null;
	const out = {};
	for (const line of lines.slice(1, end)) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (match) out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
	}
	out.__body = lines.slice(end + 1).join('\n');
	return out;
}

function dirsIn(rel) {
	const abs = join(HARNESS, rel);
	if (!existsSync(abs)) return [];
	return readdirSync(abs).filter((e) => statSync(join(abs, e)).isDirectory());
}

// ── Core ─────────────────────────────────────────────────────────────────────

function checkCore() {
	const path = join(HARNESS, 'behavior/_core.md');
	if (!existsSync(path)) return fail('behavior/_core.md is missing');
	const size = tokens(readFileSync(path, 'utf8'));
	if (size > CORE_BUDGET) fail(`behavior/_core.md is ~${size} tokens, over the ${CORE_BUDGET} always-on budget`);
	else console.log(`  core: ~${size} tokens (budget ${CORE_BUDGET})`);
}

// ── Skills ───────────────────────────────────────────────────────────────────

function checkSkills() {
	const names = dirsIn('skills').filter((n) => !n.startsWith('_'));
	if (!names.length) warn('no skills found');

	for (const name of names) {
		const path = join(HARNESS, 'skills', name, 'SKILL.md');
		const label = `skills/${name}`;

		if (!existsSync(path)) {
			fail(`${label}: no SKILL.md`);
			continue;
		}

		const text = readFileSync(path, 'utf8');
		const meta = frontmatter(text);

		if (!meta) {
			fail(`${label}: no closed frontmatter fence`);
			continue;
		}
		if (!meta.name) fail(`${label}: frontmatter has no name`);
		else if (meta.name !== name) fail(`${label}: frontmatter name "${meta.name}" does not match the directory`);

		if (!meta.description) {
			fail(`${label}: frontmatter has no description — it would never be indexed`);
		} else {
			if (meta.description.length < 40) fail(`${label}: description too short to trigger on anything useful`);
			if (!/trigger/i.test(meta.description)) warn(`${label}: description names no trigger — it may never fire`);
		}

		if (!meta['allowed-tools']) warn(`${label}: no allowed-tools — it inherits everything`);
		else if (/(^|,)\s*Bash\s*(,|$)/.test(meta['allowed-tools'])) {
			warn(`${label}: grants unscoped Bash. Prefer Bash(cmd:*)`);
		}

		const explicitOnly = meta['disable-model-invocation'] === 'true' || NARROW_TRIGGER_SKILLS.has(name);
		const ceiling = explicitOnly ? SKILL_BUDGET_EXPLICIT : SKILL_BUDGET;
		const size = tokens(meta.__body);
		if (size > ceiling) fail(`${label}: ~${size} tokens, over the ${ceiling} ceiling`);
		else if (!explicitOnly && size > SKILL_WARN) warn(`${label}: ~${size} tokens, consider moving detail to references/`);

		// Dead companion references: `assets/x.md` or `references/x.md` mentioned but absent.
		for (const match of meta.__body.matchAll(/`((?:assets|references)\/[^`]+)`/g)) {
			if (!existsSync(join(HARNESS, 'skills', name, match[1]))) {
				fail(`${label}: references ${match[1]}, which does not exist`);
			}
		}
	}
	console.log(`  skills: ${names.length} checked`);
}

// ── Subagents ────────────────────────────────────────────────────────────────

function checkAgents() {
	const abs = join(HARNESS, 'agents');
	if (!existsSync(abs)) return warn('no agents/ directory');

	const files = readdirSync(abs).filter((f) => f.endsWith('.md'));
	for (const file of files) {
		const label = `agents/${file}`;
		const text = readFileSync(join(abs, file), 'utf8');

		// `_`-prefixed files are contracts for the parent, not subagent definitions.
		if (file.startsWith('_')) {
			if (frontmatter(text)) warn(`${label}: has frontmatter but is not projected as a subagent`);
			continue;
		}

		const meta = frontmatter(text);
		if (!meta) {
			fail(`${label}: subagent definition without frontmatter`);
			continue;
		}
		for (const key of ['name', 'description', 'tools']) {
			if (!meta[key]) fail(`${label}: frontmatter has no ${key}`);
		}
		if (meta.name && `${meta.name}.md` !== file) fail(`${label}: name "${meta.name}" does not match the filename`);
		if (meta.tools && /\bWrite\b|\bEdit\b/.test(meta.tools) && /review|verif|scout|audit/i.test(file)) {
			fail(`${label}: a read-only role must not be granted Write or Edit`);
		}
	}
	console.log(`  agents: ${files.length} checked`);
}

// ── Pointers ─────────────────────────────────────────────────────────────────

function checkPointers() {
	const core = readFileSync(join(HARNESS, 'behavior/_core.md'), 'utf8');
	const GENERATED_AT_BUILD = new Set(['skills/_registry.md']);
	for (const match of core.matchAll(/`((?:behavior|contracts|agents|skills)\/[^`*]+\.md)`/g)) {
		const target = match[1];
		if (GENERATED_AT_BUILD.has(target)) continue;
		if (!existsSync(join(HARNESS, target))) fail(`behavior/_core.md points at ${target}, which does not exist`);
	}
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('validating roymasoft-ai\n');
checkCore();
checkSkills();
checkAgents();
checkPointers();

if (warnings.length) {
	console.log('');
	for (const w of warnings) console.warn(`  [warn]  ${w}`);
}
if (errors.length) {
	console.log('');
	for (const e of errors) console.error(`  [FAIL]  ${e}`);
	console.error(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
	process.exit(1);
}
console.log(`\nok — ${warnings.length} warning(s), no errors.`);
