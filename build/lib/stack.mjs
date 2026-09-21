/**
 * Targeted write to stack.toml: flips one component's `enabled` flag.
 *
 * `detect.mjs` is deliberately read-only, so this lives on its own — the only place in the
 * harness that writes to stack.toml. It edits exactly the `enabled` line inside a component's own
 * `[components.<id>]` table and leaves everything else (comments, other tables, formatting)
 * untouched, the same discipline `uninstall.mjs` uses for client repositories.
 */

import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Sets `enabled = true` for `[components.<id>]` in `stackPath`. No-op (returns false) if the
 * table is missing or already enabled — callers only need to check truthiness, not diff state.
 */
export function enableComponent(stackPath, id) {
	const raw = readFileSync(stackPath, 'utf8');
	const usesCRLF = raw.includes('\r\n');
	const lines = raw.split(/\r?\n/);

	const start = lines.findIndex((l) => l.trim() === `[components.${id}]`);
	if (start === -1) throw new Error(`no [components.${id}] table in ${stackPath}`);

	let end = lines.length;
	for (let i = start + 1; i < lines.length; i += 1) {
		if (lines[i].trim().startsWith('[')) {
			end = i;
			break;
		}
	}

	for (let i = start + 1; i < end; i += 1) {
		const trimmed = lines[i].trim();
		if (trimmed.startsWith('enabled') && /=\s*false\b/.test(trimmed)) {
			lines[i] = lines[i].replace('false', 'true');
			writeFileSync(stackPath, lines.join(usesCRLF ? '\r\n' : '\n'), 'utf8');
			return true;
		}
	}
	return false;
}
