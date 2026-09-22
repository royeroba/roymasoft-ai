#!/usr/bin/env node
/**
 * Stop hook — nudges proactive memory saving.
 *
 * A live session already proved that reinforcing `behavior/memory.md` with stronger prose is not
 * enough on its own (see the harness's own memory: `review/proactive-save-not-self-enforced`) —
 * a real decision was made and only saved after the human asked. This hook is the mechanical
 * follow-up: heuristic, not semantic, and it will have false positives and false negatives.
 *
 * Contract: NEVER blocks a stop it cannot justify. Any failure, missing transcript, or ambiguous
 * signal exits 0 with no output — a nudge that fires wrongly ten times a day gets ignored, which
 * defeats the point.
 */

import { readStdin, parsePayload, readTranscriptLines, parseEntry, entryText } from './lib/transcript.mjs';

const DECISION_SIGNALS = /\b(decid[ií]|arregl[ée]|fix(ed|ing)?|root cause|discovered|descubr|convention|bug fix|gotcha)\b/i;
const MEM_SAVE_TOOL = /mem_save/;

function main() {
	const payload = parsePayload(readStdin());

	// Claude Code sets this when a Stop hook already fired once this cycle — never re-block, or a
	// wrong heuristic becomes an infinite loop instead of a missed reminder.
	if (payload.stop_hook_active) {
		return;
	}

	const lines = readTranscriptLines(payload.transcript_path, 60);
	if (!lines.length) return;

	let sawDecisionSignal = false;
	let sawMemSave = false;

	for (const line of lines) {
		const entry = parseEntry(line);
		if (!entry) continue;
		const text = entryText(entry);
		if (MEM_SAVE_TOOL.test(text)) sawMemSave = true;
		if (DECISION_SIGNALS.test(text)) sawDecisionSignal = true;
	}

	if (sawDecisionSignal && !sawMemSave) {
		process.stdout.write(
			JSON.stringify({
				decision: 'block',
				reason:
					'Este turno tiene señales de una decisión, fix o descubrimiento, y no se ve ningún mem_save. ' +
					'Si corresponde guardarlo (behavior/memory.md), hacelo ahora con mem_save antes de terminar. ' +
					'Si ya se guardó, o no aplica, seguí — esto es un empujón heurístico, no una regla dura.',
			}),
		);
	}
}

try {
	main();
} catch {
	// Never block a stop this hook cannot justify.
}
process.exit(0);
