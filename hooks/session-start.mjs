#!/usr/bin/env node
/**
 * SessionStart hook.
 *
 * One implementation, not three: the harness already requires Node for the projection, so
 * dispatching through `node` is cross-platform without a PowerShell and a bash twin that drift
 * apart. Resolves paths from its own location, never from an environment variable it does not own.
 *
 * Contract: NEVER blocks session start. Any failure exits 0 with no output.
 * Whatever this prints on stdout reaches the model as additional context, so every line
 * costs tokens on every session. Keep it short.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Hard cap on what this hook may inject, regardless of how much it finds. */
const MAX_INJECTED_CHARS = 4000;

function readStdin() {
	try {
		return readFileSync(0, 'utf8');
	} catch {
		return '';
	}
}

function parsePayload(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

/** Project root: what the agent reports, falling back to the process cwd. */
function resolveCwd(payload) {
	const candidate = payload.cwd ?? process.cwd();
	try {
		return resolve(candidate);
	} catch {
		return process.cwd();
	}
}

function readIfPresent(path, limit) {
	try {
		if (!existsSync(path)) return null;
		const text = readFileSync(path, 'utf8');
		return limit && text.length > limit ? `${text.slice(0, limit)}\n…(truncated)` : text;
	} catch {
		return null;
	}
}

/**
 * Post-compaction recovery. The session lost its working context, so the first thing the model
 * needs is an instruction to rebuild it before continuing — not a restatement of the rules.
 */
function compactionBlock() {
	return [
		'## Context was just compacted',
		'',
		'Before continuing work:',
		'1. Persist the compacted handoff to memory, if memory is available.',
		'2. Recover recent project context from memory.',
		'3. Re-read the feature document or spec you were working on.',
		'',
		'Do not resume from the summary alone — reconcile it against the actual files first.',
	].join('\n');
}

function startupBlock(projectDoc) {
	if (projectDoc) {
		return ['## Project context', '', projectDoc.trim()].join('\n');
	}
	return [
		'## Project context',
		'',
		'`PROJECT.md` is not present in this repository. Say so once, and offer `/onboard-repo`',
		'to index it and record its stack, conventions, commands and testing capability.',
		'Do not infer the stack from the repository name.',
	].join('\n');
}

function main() {
	const payload = parsePayload(readStdin());
	const cwd = resolveCwd(payload);
	const source = String(payload.source ?? '').toLowerCase();

	const harness = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	void harness; // resolved for future use (awareness text, stack profile)

	const blocks = [];

	if (source === 'compact') {
		blocks.push(compactionBlock());
	}

	const projectDoc = readIfPresent(join(cwd, 'PROJECT.md'), 2500);
	blocks.push(startupBlock(projectDoc));

	const out = blocks.join('\n\n').slice(0, MAX_INJECTED_CHARS);
	if (out.trim()) process.stdout.write(`${out}\n`);
}

try {
	main();
} catch {
	// Never block session start.
}
process.exit(0);
