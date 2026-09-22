#!/usr/bin/env node
/**
 * UserPromptSubmit hook — reinforces the search-order invariant mechanically.
 *
 * `behavior/routing.md`'s invariant #1 ("graph → memory → targeted code, in every route") is
 * prose in an always-on file, and the harness already has one proven case in its own memory
 * (`review/proactive-save-not-self-enforced`) where reinforced prose alone was not enough. This
 * is the same fix applied to the other rule the human asked to protect the same way: the order
 * of investigation never depends on whether the task turns out to be ping-pong or SDD.
 *
 * Deliberately short: this fires on every prompt, so every character here costs tokens on every
 * single turn. One line, not a paragraph.
 *
 * Contract: NEVER blocks the prompt. Any failure exits 0 with no output.
 */

import { readFileSync } from 'node:fs';

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

const REMINDER = 'Antes de responder: grafo → memoria → código, en ese orden — siempre, sea ping-pong o SDD.';

function main() {
	const payload = parsePayload(readStdin());
	// A trivial prompt (a bare "sí", "dale", "gracias") does not need the reminder repeated — it
	// only adds noise on turns that are just confirming something already in flight.
	const prompt = String(payload.prompt ?? '').trim();
	if (prompt.length < 12) return;

	process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: REMINDER } }));
}

try {
	main();
} catch {
	// Never block the prompt.
}
process.exit(0);
