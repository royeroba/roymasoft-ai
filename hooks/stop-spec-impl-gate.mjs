#!/usr/bin/env node
/**
 * Stop hook — blocks reporting a `/spec-impl` closing verdict ("PASA"/"NO PASA") unless the
 * `auditor` subagent was actually delegated to this session.
 *
 * `skills/spec-impl/SKILL.md`'s Closing section instructs delegating to `auditor` before reporting
 * done — prose again, with nothing checking it happened. Same mechanism as `stop-memory-check.mjs`:
 * heuristic, fail-open, only blocks what it can actually justify from the transcript.
 */

import { readStdin, parsePayload, readTranscriptLines, parseEntry, entryText, entryToolUses, entryRole } from './lib/transcript.mjs';

const CLOSING_VERDICT = /auditor[ií]a\s*:?\s*(PASA|NO\s*PASA)/i;
const AUDITOR_DELEGATION = /auditor/i;

function main() {
	const payload = parsePayload(readStdin());
	if (payload.stop_hook_active) return;

	const lines = readTranscriptLines(payload.transcript_path);
	if (!lines.length) return;

	const entries = lines.map(parseEntry).filter(Boolean);

	const lastAssistant = [...entries].reverse().find((entry) => entryRole(entry) === 'assistant');
	if (!lastAssistant || !CLOSING_VERDICT.test(entryText(lastAssistant))) return;

	const delegatedToAuditor = entries.some((entry) =>
		entryToolUses(entry).some((use) => use.name === 'Task' && AUDITOR_DELEGATION.test(JSON.stringify(use.input ?? {}))),
	);
	if (delegatedToAuditor) return;

	process.stdout.write(
		JSON.stringify({
			decision: 'block',
			reason:
				'Este turno reporta un veredicto de auditoría de /spec-impl, pero no se ve ninguna delegación ' +
				'real a Task(subagent_type: auditor) en esta sesión. skills/spec-impl/SKILL.md Closing pide ' +
				'delegar de verdad antes de reportar PASA/NO PASA — hacelo ahora, no lo des por hecho.',
		}),
	);
}

try {
	main();
} catch {
	// Never block a stop this hook cannot justify.
}
process.exit(0);
