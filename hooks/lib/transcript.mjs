/**
 * Shared JSONL transcript helpers for hooks that need to look back at what already happened this
 * session — never throws, always degrades to "nothing found" on anything malformed.
 */

import { readFileSync, existsSync } from 'node:fs';

/** Hard safety cap regardless of what a caller asks for — a huge session transcript never blows up
 *  a hook's memory. */
const MAX_TRANSCRIPT_LINES = 5000;

export function readStdin() {
	try {
		return readFileSync(0, 'utf8');
	} catch {
		return '';
	}
}

export function parsePayload(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

/** Reads a transcript's lines, JSONL — one message per line. `maxLines` caps how many *trailing*
 *  lines come back; omitted, the whole session comes back (still bounded by MAX_TRANSCRIPT_LINES). */
export function readTranscriptLines(path, maxLines) {
	try {
		if (!path || !existsSync(path)) return [];
		const text = readFileSync(path, 'utf8');
		const lines = text.split('\n').filter((l) => l.trim());
		const capped = lines.length > MAX_TRANSCRIPT_LINES ? lines.slice(-MAX_TRANSCRIPT_LINES) : lines;
		return maxLines ? capped.slice(-maxLines) : capped;
	} catch {
		return [];
	}
}

/** Parses one JSONL line, returning null on anything malformed rather than throwing. */
export function parseEntry(line) {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}

/** Best-effort text extraction across whatever shape a transcript entry turns out to have. */
export function entryText(entry) {
	try {
		const content = entry?.message?.content;
		if (typeof content === 'string') return content;
		if (Array.isArray(content)) {
			return content
				.map((block) => {
					if (typeof block === 'string') return block;
					if (block?.type === 'text') return block.text ?? '';
					if (block?.type === 'tool_use') return block.name ?? '';
					return '';
				})
				.join(' ');
		}
	} catch {
		// fall through
	}
	return '';
}

/** tool_use blocks in one transcript entry: [{ id, name, input }]. Empty for anything else (user
 *  turns, plain text, malformed entries). */
export function entryToolUses(entry) {
	try {
		const content = entry?.message?.content;
		if (!Array.isArray(content)) return [];
		return content
			.filter((block) => block?.type === 'tool_use' && block?.name)
			.map((block) => ({ id: block.id, name: block.name, input: block.input }));
	} catch {
		return [];
	}
}

export function entryRole(entry) {
	return entry?.type ?? '';
}
