#!/usr/bin/env node
/**
 * PreToolUse hook — denies writing an "Approved" spec unless this session actually called
 * `ExitPlanMode` at least once.
 *
 * `skills/spec/SKILL.md`'s plan-mode block tells the model: draft inside `EnterPlanMode`, present
 * with `ExitPlanMode`, and if approved there, save `Status: Approved` directly. That instruction is
 * prose with nothing behind it — a live session proved the model can skip straight to the old
 * Draft-then-manual-approve pattern while still claiming (or being asked to claim) approval, without
 * ever calling `ExitPlanMode`. This is the mechanical backstop, built the same way gentle-ai's own
 * hard gate works (`sdd_preflight_hook.go`): proof is an actual `tool_use` in the transcript, never
 * text the model could have written itself.
 *
 * Deliberately the minimum-certainty version: it only checks whether `ExitPlanMode` was called at
 * all this session, not whether the specific approval that followed it was a yes. That is already
 * enough to catch exactly what failed live (zero `ExitPlanMode` calls). Distinguishing "approved"
 * from "asked for changes" is a refinement for after this is validated in a real session — flagged
 * in the plan as the least certain piece.
 *
 * Fail-open: anything unrecognized or unreadable means "allow" — never deny on a guess.
 */

import { readStdin, parsePayload, readTranscriptLines, parseEntry, entryToolUses } from './lib/transcript.mjs';

const SPEC_PATH = /(^|[\\/])specs[\\/][^\\/]+\.md$/i;
const APPROVED_STATE = /status\s*[:\-]?\s*\*{0,2}\s*(Approved|Aprobado|Aprovado|Approuvé|Genehmigt)\b/i;

function allow() {
	// No output = Claude Code's default: proceed as normal.
}

function deny(reason) {
	process.stdout.write(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: 'PreToolUse',
				permissionDecision: 'deny',
				permissionDecisionReason: reason,
			},
		}),
	);
}

function writtenText(toolInput) {
	// Write carries the full content; Edit carries the changed fragment. Either is enough to catch
	// the status line landing in the file.
	return [toolInput?.content, toolInput?.new_string].filter(Boolean).join('\n');
}

function main() {
	const payload = parsePayload(readStdin());
	if (payload.hook_event_name !== 'PreToolUse') return allow();
	if (!['Write', 'Edit'].includes(payload.tool_name)) return allow();
	if (!SPEC_PATH.test(payload.tool_input?.file_path ?? '')) return allow();
	if (!APPROVED_STATE.test(writtenText(payload.tool_input))) return allow();

	const lines = readTranscriptLines(payload.transcript_path);
	if (!lines.length) return allow(); // no transcript to prove anything against — do not deny on nothing

	for (const line of lines) {
		const entry = parseEntry(line);
		if (!entry) continue;
		for (const use of entryToolUses(entry)) {
			if (use.name === 'ExitPlanMode') return allow();
		}
	}

	deny(
		'Este archivo va a quedar en estado Approved, pero no se ve ningún ExitPlanMode en esta sesión. ' +
			'Si el humano aprobó por chat, guardá Draft y que lo cambie a mano — o volvé a pasar por ' +
			'EnterPlanMode/ExitPlanMode de verdad, como pide skills/spec/SKILL.md.',
	);
}

try {
	main();
} catch {
	allow();
}
process.exit(0);
