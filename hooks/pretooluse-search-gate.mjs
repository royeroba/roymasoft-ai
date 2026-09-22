#!/usr/bin/env node
/**
 * PreToolUse hook — asks for confirmation before the session's first code edit if nothing in the
 * graph/memory family was ever called this session.
 *
 * `behavior/routing.md` invariant #1 ("graph → memory → targeted code, in every route") was only
 * reinforced with a `UserPromptSubmit` reminder (`prompt-search-reminder.mjs`) — text the model can
 * read and still skip. A live session proved it: after the first two graph searches, the rest of a
 * whole feature was plain Read/Grep. This is the mechanical follow-up, on the one moment that
 * actually matters — before code gets written, not before every prompt.
 *
 * Deliberately narrow: fires once per session (the first code edit only), and only asks — it does
 * not deny. `permissionDecision: "ask"` opens Claude Code's real permission prompt, which the model
 * cannot silently talk past, without hard-blocking a legitimate edit the human wants to approve
 * anyway. Fail-open on anything ambiguous: an unrecognized payload, an unreadable transcript, or an
 * internal error all mean "allow", never "ask" — a gate that misfires becomes noise, and noise gets
 * ignored (same lesson already applied in stop-memory-check.mjs).
 */

import { readStdin, parsePayload, readTranscriptLines, parseEntry, entryToolUses } from './lib/transcript.mjs';

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit']);

const CODE_EXTENSIONS = new Set([
	'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.go', '.py', '.rb', '.java', '.kt', '.swift',
	'.rs', '.vue', '.svelte', '.c', '.cc', '.cpp', '.h', '.hpp', '.cs', '.php', '.scala', '.dart',
]);

const GRAPH_MEMORY_TOOL = /search_graph|trace_path|query_graph|get_architecture|search_code|get_code_snippet|mem_search|mem_context/;

function extensionOf(filePath) {
	const match = /\.[a-zA-Z0-9]+$/.exec(filePath ?? '');
	return match ? match[0].toLowerCase() : '';
}

function isCodeEdit(name, input) {
	if (!EDIT_TOOLS.has(name)) return false;
	return CODE_EXTENSIONS.has(extensionOf(input?.file_path));
}

function allow() {
	// No output = Claude Code's default: proceed as normal.
}

function ask(reason) {
	process.stdout.write(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: 'PreToolUse',
				permissionDecision: 'ask',
				permissionDecisionReason: reason,
			},
		}),
	);
}

function main() {
	const payload = parsePayload(readStdin());
	if (payload.hook_event_name !== 'PreToolUse') return allow();
	if (!isCodeEdit(payload.tool_name, payload.tool_input)) return allow();

	const lines = readTranscriptLines(payload.transcript_path);
	if (!lines.length) return allow();

	let sawPriorCodeEdit = false;
	let sawGraphOrMemory = false;

	for (const line of lines) {
		const entry = parseEntry(line);
		if (!entry) continue;
		for (const use of entryToolUses(entry)) {
			if (GRAPH_MEMORY_TOOL.test(use.name)) sawGraphOrMemory = true;
			if (isCodeEdit(use.name, use.input)) sawPriorCodeEdit = true;
		}
	}

	// Already past the first code edit this session — the gate already had its one chance.
	if (sawPriorCodeEdit) return allow();
	if (sawGraphOrMemory) return allow();

	ask(
		'Todavía no se ve ninguna búsqueda de grafo o memoria en esta sesión (search_graph, trace_path, ' +
			'query_graph, get_architecture, search_code, get_code_snippet, mem_search, mem_context) antes ' +
			'de este primer edit de código. behavior/routing.md invariante #1: grafo → memoria → código, ' +
			'siempre. Si ya se investigó por otro medio, se puede continuar.',
	);
}

try {
	main();
} catch {
	allow();
}
process.exit(0);
