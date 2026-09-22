#!/usr/bin/env node
/**
 * Projects the harness into a target repository, in each agent's native format.
 *
 * One source of truth (`behavior/`, `agents/`, `skills/`, `contracts/`) becomes an agent-specific
 * projection per target. Copies, never symlinks: symlinks need elevation or developer mode on
 * Windows, and they break in ZIP downloads.
 *
 * Usage as a module:  project({ target, agents })
 * Usage as a script:  node build/project.mjs <target-repo> [--agents claude,cursor]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HARNESS = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Where the harness detail files land inside the target repository. */
const VENDOR = '.rai';

/** Idempotent block markers: everything outside them is the user's and is preserved. */
const BLOCK_START = '<!-- roymasoft-ai:start -->';
const BLOCK_END = '<!-- roymasoft-ai:end -->';

/** Files prefixed with this are contracts for the parent, not subagent definitions. */
const NOT_A_SUBAGENT = '_';

export const ALL_AGENTS = ['claude', 'codex', 'cursor', 'copilot', 'antigravity'];

/**
 * Behaviour files that become individually addressable rules, with the description each
 * agent uses to decide when to attach them.
 */
const BEHAVIOR_RULES = {
	'evidence.md': 'Never assume. What may be claimed and the proof required. When to stop and ask.',
	'output.md': 'Response shape: lead with the action, no preamble, no recap, no closers.',
	'language.md': 'Conversation language vs. technical artifact language.',
	'routing.md': 'Ceremony ladder: ping-pong vs SDD, delegation triggers, and when TDD applies.',
	'search.md': 'Search order: graph, grep, glob, read. Never bash to search.',
	'memory.md': 'What to persist, with which scope, and client isolation.',
	'code-style.md': 'SOLID, DRY, KISS, Clean Code. Docstrings on signatures, no comments.',
	'security.md': 'Secrets, destructive commands, untrusted content.',
	'verification.md': 'How the TDD mode is resolved and what counts as proof.',
};

function read(rel) {
	return readFileSync(join(HARNESS, rel), 'utf8');
}

function frontmatter(text) {
	const lines = text.split(/\r?\n/);
	if (lines[0]?.trim() !== '---') return {};
	const end = lines.indexOf('---', 1);
	if (end === -1) return {};
	const out = {};
	for (const line of lines.slice(1, end)) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (match) out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
	}
	return out;
}

function listDirs(rel) {
	const abs = join(HARNESS, rel);
	if (!existsSync(abs)) return [];
	return readdirSync(abs).filter((entry) => statSync(join(abs, entry)).isDirectory());
}

function listFiles(rel, ext = '.md') {
	const abs = join(HARNESS, rel);
	if (!existsSync(abs)) return [];
	return readdirSync(abs).filter((entry) => entry.endsWith(ext) && statSync(join(abs, entry)).isFile());
}

/** Every file under a skill directory, including companions in `assets/` and `references/`. */
function skillFiles(name) {
	const root = join(HARNESS, 'skills', name);
	const found = [];
	const walk = (dir) => {
		for (const entry of readdirSync(dir)) {
			const abs = join(dir, entry);
			if (statSync(abs).isDirectory()) walk(abs);
			else found.push(relative(root, abs).split('\\').join('/'));
		}
	};
	walk(root);
	return found;
}

function skillNames() {
	return listDirs('skills').filter((name) => !name.startsWith(NOT_A_SUBAGENT));
}

/** Extracts the per-agent content from `<!-- plan-mode:<agent> -->...<!-- /plan-mode:<agent> -->`
 *  blocks, so one shared skill source can diverge by host agent. Falls back to the `generic`
 *  block when the agent has none of its own. A skill with no such blocks is returned unchanged. */
function stripAgentBlocks(content, agentId) {
	const blockRe = /<!-- plan-mode:(\w+) -->\n([\s\S]*?)\n<!-- \/plan-mode:\1 -->\n?/g;
	const blocks = {};
	let hasBlocks = false;
	for (const m of content.matchAll(blockRe)) {
		hasBlocks = true;
		blocks[m[1]] = m[2];
	}
	if (!hasBlocks) return content;
	const chosenId = blocks[agentId] !== undefined ? agentId : 'generic';
	return content.replace(blockRe, (_match, id) => (id === chosenId ? `${blocks[id]}\n` : ''));
}

/**
 * Runs a projection into `target` for the given `agents`.
 * Returns what it wrote, so callers can report without re-deriving it.
 */
export function project({ target, agents = ALL_AGENTS, log = () => {} }) {
	const TARGET = resolve(target);
	if (TARGET === HARNESS) throw new Error('refusing to project into the harness itself');
	if (!existsSync(TARGET)) throw new Error(`target does not exist: ${TARGET}`);

	const written = [];
	const selected = new Set(agents);

	const write = (relTarget, content) => {
		const abs = join(TARGET, relTarget);
		mkdirSync(dirname(abs), { recursive: true });
		writeFileSync(abs, content, 'utf8');
		written.push(relTarget);
		log(`wrote ${relTarget}`);
	};

	const generatedHeader = () =>
		['<!-- Generated by roymasoft-ai. Do not edit directly.', '     Edit the harness and re-run: rai project -->', ''].join('\n');

	/** Writes content wrapped in idempotent block markers, preserving whatever else is in the
	 *  file — the same trick Copilot already used, generalized to every full-file projection so a
	 *  pre-existing AGENTS.md/CLAUDE.md/GEMINI.md the client wrote by hand is never silently lost.
	 *  `startMark`/`endMark` default to the HTML-comment markers (markdown files); pass a
	 *  file-appropriate pair — e.g. `#`-prefixed — for anything that isn't markdown. */
	const writeBlock = (relTarget, block, startMark = BLOCK_START, endMark = BLOCK_END) => {
		const abs = join(TARGET, relTarget);
		if (existsSync(abs)) {
			const current = readFileSync(abs, 'utf8');
			if (current.includes(startMark) && current.includes(endMark)) {
				const before = current.slice(0, current.indexOf(startMark));
				const after = current.slice(current.indexOf(endMark) + endMark.length);
				write(relTarget, before + block + after);
			} else if (current.includes('Generated by roymasoft-ai') || current.includes('roymasoft-ai — local harness projection')) {
				// Ours, from a run before this file carried markers — safe to replace outright.
				write(relTarget, block);
			} else {
				// Predates the harness, or edited by hand — keep it, add ours alongside.
				write(relTarget, `${current.trimEnd()}\n\n${block}\n`);
			}
		} else {
			write(relTarget, `${block}\n`);
		}
	};

	const SKILL_MARK = '<!-- roymasoft-ai -->';

	const stampSkill = (content) => {
		const lines = content.split(/\r?\n/);
		if (lines[0]?.trim() === '---') {
			const end = lines.indexOf('---', 1);
			if (end !== -1) {
				lines.splice(end + 1, 0, '', SKILL_MARK);
				return lines.join('\n');
			}
		}
		return `${SKILL_MARK}\n${content}`;
	};

	/** Writes a skill or subagent file we own, but never over foreign content with the same
	 *  name — a client repo may already have its own skill or subagent called `commit` or
	 *  `debug`, from before the harness was ever installed there.
	 *
	 *  `expectedName` is the frontmatter `name:` this file should carry if it is genuinely ours.
	 *  A file from a harness version before `SKILL_MARK` existed has no marker, but its own
	 *  frontmatter name still matches — that combination (same path AND same declared identity)
	 *  is proof enough to treat it as ours and upgrade it, not as a client's unrelated file that
	 *  coincidentally shares a folder or file name. */
	const writeOwned = (relTarget, content, expectedName) => {
		const abs = join(TARGET, relTarget);
		if (existsSync(abs)) {
			const current = readFileSync(abs, 'utf8');
			const oursFromBeforeTheMarker = expectedName && frontmatter(current).name === expectedName;
			if (!current.includes(SKILL_MARK) && !oursFromBeforeTheMarker) {
				log(`skipped ${relTarget} — already exists and is not ours, left untouched`);
				return;
			}
		}
		write(relTarget, stampSkill(content));
	};

	/** Decides ownership for a whole skill folder from its `SKILL.md` alone, then writes every
	 *  file under that one decision — a companion file like `references/x.md` has no frontmatter
	 *  of its own to prove identity, so it inherits the skill's verdict instead of being judged
	 *  alone (which would wrongly orphan it even when the skill itself is legitimately ours). */
	const writeSkill = (destPrefix, name, agentId) => {
		const skillMdAbs = join(TARGET, destPrefix, name, 'SKILL.md');
		if (existsSync(skillMdAbs)) {
			const current = readFileSync(skillMdAbs, 'utf8');
			const oursFromBeforeTheMarker = frontmatter(current).name === name;
			if (!current.includes(SKILL_MARK) && !oursFromBeforeTheMarker) {
				log(`skipped ${destPrefix}/${name}/ — already exists and is not ours, left untouched`);
				return;
			}
		}
		for (const rel of skillFiles(name)) {
			const content = stripAgentBlocks(readFileSync(join(HARNESS, 'skills', name, rel), 'utf8'), agentId);
			write(`${destPrefix}/${name}/${rel}`, stampSkill(content));
		}
	};

	// Lazy pointers must resolve from the target root: `behavior/x.md` -> `.rai/behavior/x.md`
	const core = read('behavior/_core.md').replace(/(`)(behavior|contracts|agents|skills)\//g, `$1${VENDOR}/$2/`);

	// ── Codex: reads AGENTS.md natively. Also the canonical projection the others derive from.
	// AGENTS.md is written whenever any agent is selected, because Cursor and others read it too.
	// Wrapped in markers: a client repo may already have its own AGENTS.md before ever meeting us.
	writeBlock('AGENTS.md', [BLOCK_START, generatedHeader() + core, BLOCK_END].join('\n'));
	if (selected.has('codex')) {
		for (const name of skillNames()) {
			writeSkill('.codex/skills', name, 'codex');
		}
	}

	// ── Claude Code: a one-line pointer, plus native subagents, skills and hooks.
	if (selected.has('claude')) {
		const claudeAbs = join(TARGET, 'CLAUDE.md');
		// `@AGENTS.md` (with the `@`) is Claude Code's actual file-import syntax — plain `AGENTS.md`
		// text never triggers a load. Confirmed live: a client repo silently never picked up
		// `behavior/_core.md` until this was fixed by hand there.
		const pointerBlock = [BLOCK_START, '@AGENTS.md', BLOCK_END].join('\n');
		const claudeCurrent = existsSync(claudeAbs) ? readFileSync(claudeAbs, 'utf8') : null;
		if (claudeCurrent === null || claudeCurrent.trim() === 'AGENTS.md' || claudeCurrent.trim() === '@AGENTS.md') {
			// Nothing there yet, or already exactly our pointer (old plain form or current `@` form)
			// — keep the simple one-line form, upgrading the old one in place.
			write('CLAUDE.md', '@AGENTS.md\n');
		} else if (claudeCurrent.includes(BLOCK_START) && claudeCurrent.includes(BLOCK_END)) {
			const before = claudeCurrent.slice(0, claudeCurrent.indexOf(BLOCK_START));
			const after = claudeCurrent.slice(claudeCurrent.indexOf(BLOCK_END) + BLOCK_END.length);
			write('CLAUDE.md', before + pointerBlock + after);
		} else {
			// The client had their own CLAUDE.md before us — keep it, add our pointer above it.
			write('CLAUDE.md', `${pointerBlock}\n\n${claudeCurrent.trimEnd()}\n`);
		}
		for (const file of listFiles('agents')) {
			if (file.startsWith(NOT_A_SUBAGENT)) continue;
			const name = file.replace(/\.md$/, '');
			writeOwned(`.claude/agents/${file}`, stripAgentBlocks(read(`agents/${file}`), 'claude'), name);
		}
		for (const name of skillNames()) {
			writeSkill('.claude/skills', name, 'claude');
		}
		if (existsSync(join(HARNESS, 'hooks'))) {
			for (const entry of readdirSync(join(HARNESS, 'hooks'))) {
				if (statSync(join(HARNESS, 'hooks', entry)).isFile()) write(`.claude/hooks/${entry}`, read(`hooks/${entry}`));
			}
		}
	}

	// ── Cursor: one .mdc per rule, with its own frontmatter. Unique filenames by design — a
	// client's own Cursor rules never share this prefix, so no collision guard is needed here.
	if (selected.has('cursor')) {
		write(
			'.cursor/rules/rai-core.mdc',
			['---', 'description: roymasoft-ai core behavior contract', 'alwaysApply: true', '---', '', core].join('\n'),
		);
		for (const [file, description] of Object.entries(BEHAVIOR_RULES)) {
			const src = join(HARNESS, 'behavior', file);
			if (!existsSync(src)) continue;
			write(
				`.cursor/rules/rai-${file.replace(/\.md$/, '')}.mdc`,
				['---', `description: ${description}`, 'alwaysApply: false', '---', '', readFileSync(src, 'utf8')].join('\n'),
			);
		}
		for (const name of skillNames()) {
			const content = stripAgentBlocks(readFileSync(join(HARNESS, 'skills', name, 'SKILL.md'), 'utf8'), 'cursor');
			write(
				`.cursor/rules/rai-skill-${name}.mdc`,
				['---', `description: ${frontmatter(content).description ?? name}`, 'alwaysApply: false', '---', '', content].join('\n'),
			);
		}
	}

	// ── Copilot: replace only our marked block, keep whatever else the repo put there.
	if (selected.has('copilot')) {
		writeBlock('.github/copilot-instructions.md', [BLOCK_START, generatedHeader() + core, BLOCK_END].join('\n'));
	}

	// ── Antigravity
	if (selected.has('antigravity')) {
		writeBlock('.gemini/GEMINI.md', [BLOCK_START, generatedHeader() + core, BLOCK_END].join('\n'));
		for (const name of skillNames()) {
			writeSkill('.antigravity/skills', name, 'antigravity');
		}
	}

	// ── Vendored detail, read on demand by every agent through the core's pointers.
	for (const dir of ['behavior', 'contracts', 'agents', 'skills', 'hooks', 'guards']) {
		const src = join(HARNESS, dir);
		if (!existsSync(src)) continue;
		let count = 0;
		const walk = (current) => {
			for (const entry of readdirSync(current)) {
				const abs = join(current, entry);
				if (statSync(abs).isDirectory()) {
					walk(abs);
					continue;
				}
				const rel = relative(HARNESS, abs).split('\\').join('/');
				const dest = join(TARGET, VENDOR, rel);
				mkdirSync(dirname(dest), { recursive: true });
				writeFileSync(dest, readFileSync(abs, 'utf8'), 'utf8');
				count += 1;
			}
		};
		walk(src);
		log(`vendored ${dir}/ (${count} files)`);
	}

	// ── .gitignore: this is a local harness, not a team convention — none of what it generates
	// should end up in the client's history. Same idempotent block as everywhere else, so a
	// human's own ignore rules are never touched, only ours. `.github/copilot-instructions.md` is
	// listed too even though that one file can also carry a client's own pre-existing rules
	// (merged in by `writeBlock` above) — if a repo genuinely wants that file tracked, removing
	// this one line from the block is a one-time, deliberate opt-in.
	if (existsSync(join(TARGET, '.git'))) {
		const gitignoreStart = '# roymasoft-ai:start';
		const gitignoreEnd = '# roymasoft-ai:end';
		writeBlock(
			'.gitignore',
			[
				gitignoreStart,
				'# roymasoft-ai — local harness projection, never committed. Regenerate with `rai project`.',
				'/AGENTS.md',
				'/CLAUDE.md',
				`/${VENDOR}/`,
				'/.claude/',
				'/.codex/',
				'/.antigravity/',
				'/.gemini/',
				'/.cursor/rules/rai-*.mdc',
				'/.github/copilot-instructions.md',
				gitignoreEnd,
			].join('\n'),
			gitignoreStart,
			gitignoreEnd,
		);
	}

	// ── Skill registry: an index, never a summary. Summarizing distorts the skill; an index
	//    costs tokens only when a subagent actually needs one.
	const rows = skillNames().map((name) => {
		const meta = frontmatter(readFileSync(join(HARNESS, 'skills', name, 'SKILL.md'), 'utf8'));
		return { name: meta.name ?? name, description: meta.description ?? '(no description)', path: `${VENDOR}/skills/${name}/SKILL.md` };
	});
	write(
		`${VENDOR}/skills/_registry.md`,
		[
			'# Skill registry',
			'',
			'Index of available skills. Match the task against **Trigger**, then read the exact **Path**',
			'before doing the work. Pass paths to subagents — never a summary.',
			'',
			'| Skill | Trigger | Path |',
			'| --- | --- | --- |',
			...rows.map((r) => `| \`${r.name}\` | ${r.description} | \`${r.path}\` |`),
			'',
		].join('\n'),
	);

	return { target: TARGET, agents: [...selected], files: written, skills: rows.length };
}

// ── Script entry ─────────────────────────────────────────────────────────────

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2);
	const agentsFlag = args.indexOf('--agents');
	const agents = agentsFlag >= 0 ? args[agentsFlag + 1].split(',').map((a) => a.trim()) : ALL_AGENTS;

	// Skip the flag and the value that belongs to it, by index. Comparing by value would make a
	// target that happens to equal the flag's value disappear — and with no --agents at all,
	// `args[-1 + 1]` is args[0], which is the target itself.
	const consumed = new Set(agentsFlag >= 0 ? [agentsFlag, agentsFlag + 1] : []);
	const target = args.find((a, i) => !consumed.has(i) && !a.startsWith('--')) ?? process.cwd();

	try {
		console.log(`roymasoft-ai -> ${resolve(target)}\n`);
		const result = project({ target, agents, log: (m) => console.log(`  ${m}`) });
		console.log(`\ndone — ${result.skills} skill(s) indexed for ${result.agents.join(', ')}.`);
	} catch (err) {
		console.error(`error: ${err.message}`);
		process.exit(1);
	}
}
