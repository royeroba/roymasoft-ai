/**
 * Environment detection: OS, runtimes, agents and components.
 *
 * Shared by init, update, sync and doctor. Everything here is read-only — detection never
 * installs, never writes, never asks.
 *
 * Detection is evidence-based, like the rest of the harness: a tool is present because a probe
 * found it, and the probe is reported so the human can disagree with it.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, platform, arch, release } from 'node:os';

const HOME = homedir();
const IS_WINDOWS = platform() === 'win32';

/**
 * Agent probes, in the order they are trusted. A single hit is enough, and the hit is recorded
 * so `init` can say *why* it thinks an agent is installed.
 */
const AGENT_PROBES = {
	claude: {
		label: 'Claude Code',
		bins: ['claude'],
		dirs: ['.claude'],
		apps: [],
		writes: ['CLAUDE.md', '.claude/'],
	},
	codex: {
		label: 'Codex',
		bins: ['codex'],
		dirs: ['.codex'],
		apps: [],
		writes: ['AGENTS.md', '.codex/skills/'],
	},
	cursor: {
		label: 'Cursor',
		bins: ['cursor'],
		dirs: ['.cursor'],
		apps: ['cursor', 'Cursor'],
		writes: ['.cursor/rules/'],
	},
	copilot: {
		label: 'GitHub Copilot',
		bins: [],
		dirs: ['.copilot'],
		apps: [],
		writes: ['.github/copilot-instructions.md'],
	},
	antigravity: {
		label: 'Antigravity',
		bins: ['antigravity'],
		dirs: ['.antigravity'],
		apps: ['Antigravity'],
		writes: ['.gemini/GEMINI.md', '.antigravity/skills/'],
	},
};

/** Runtimes the harness or its components need. */
const RUNTIME_PROBES = [
	{ id: 'node', bin: 'node', args: ['--version'], required: true, why: 'the harness itself' },
	{ id: 'git', bin: 'git', args: ['--version'], required: true, why: 'projection and update' },
	{ id: 'go', bin: 'go', args: ['version'], required: false, why: 'building engram from source' },
	{ id: 'winget', bin: 'winget', args: ['--version'], required: false, why: 'installing rtk and cbm on Windows' },
];

function onPath(bin) {
	try {
		const cmd = IS_WINDOWS ? 'where' : 'which';
		const out = execFileSync(cmd, [bin], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
		return out.split(/\r?\n/)[0].trim() || null;
	} catch {
		return null;
	}
}

function probeVersion(bin, args) {
	try {
		return execFileSync(bin, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
			.split(/\r?\n/)[0]
			.trim();
	} catch {
		return null;
	}
}

/** Installed desktop applications, where the platform makes them listable. */
function installedApps() {
	const roots = IS_WINDOWS
		? [join(process.env.LOCALAPPDATA ?? '', 'Programs'), 'C:\\Program Files']
		: ['/Applications', join(HOME, 'Applications')];

	const found = [];
	for (const root of roots) {
		if (!root || !existsSync(root)) continue;
		try {
			found.push(...readdirSync(root));
		} catch {
			// Unreadable directory is simply no evidence.
		}
	}
	return found;
}

export function detectOS() {
	return {
		platform: platform(),
		arch: arch(),
		release: release(),
		isWindows: IS_WINDOWS,
		shell: IS_WINDOWS ? 'powershell' : (process.env.SHELL ?? 'sh'),
	};
}

export function detectRuntimes() {
	return RUNTIME_PROBES.map((probe) => {
		const path = onPath(probe.bin);
		return {
			id: probe.id,
			required: probe.required,
			why: probe.why,
			present: Boolean(path),
			path,
			version: path ? probeVersion(probe.bin, probe.args) : null,
		};
	});
}

/**
 * Which agents are on this machine, and why we think so.
 *
 * `alreadyProjected` outranks every probe: if a repository already carries an agent's files, the
 * harness keeps maintaining them even when that agent is not installed here — otherwise projecting
 * from a second machine would silently strip a teammate's configuration.
 */
export function detectAgents(targetRepo = null) {
	const apps = installedApps();

	return Object.entries(AGENT_PROBES).map(([id, probe]) => {
		const evidence = [];

		for (const bin of probe.bins) {
			const path = onPath(bin);
			if (path) evidence.push(`\`${bin}\` on PATH (${path})`);
		}
		for (const dir of probe.dirs) {
			if (existsSync(join(HOME, dir))) evidence.push(`~/${dir} exists`);
		}
		for (const app of probe.apps) {
			if (apps.some((entry) => entry.toLowerCase() === app.toLowerCase())) evidence.push(`${app} installed`);
		}

		let alreadyProjected = false;
		if (targetRepo) {
			alreadyProjected = probe.writes.some((rel) => existsSync(join(targetRepo, rel)));
			if (alreadyProjected) evidence.push('already projected in this repository');
		}

		return {
			id,
			label: probe.label,
			present: evidence.length > 0,
			alreadyProjected,
			evidence,
			writes: probe.writes,
		};
	});
}

/** Minimal reader for the `[components.x]` tables in stack.toml. Not a general TOML parser. */
export function readComponents(stackPath) {
	if (!existsSync(stackPath)) return {};
	const components = {};
	let current = null;

	for (const line of readFileSync(stackPath, 'utf8').split(/\r?\n/)) {
		const trimmed = line.trim();

		const table = trimmed.match(/^\[components\.([A-Za-z0-9_-]+)\]$/);
		if (table) {
			current = table[1];
			components[current] = {};
			continue;
		}
		if (trimmed.startsWith('[')) {
			current = null;
			continue;
		}
		if (!current) continue;

		const pair = trimmed.match(/^([a-z_]+)\s*=\s*(.+)$/);
		if (!pair) continue;

		const raw = pair[2].trim();
		let value;
		if (raw.startsWith('"""')) {
			value = raw.replace(/^"""/, '').trim();
		} else if (raw.startsWith('"')) {
			// A quoted value ends at its closing quote; anything after it is a comment.
			const close = raw.indexOf('"', 1);
			value = close > 0 ? raw.slice(1, close) : raw.replace(/"/g, '');
		} else {
			const hash = raw.indexOf('#');
			value = (hash >= 0 ? raw.slice(0, hash) : raw).trim();
		}
		components[current][pair[1]] = value;
	}
	return components;
}

/** Component state: what stack.toml wants, against what the machine actually has. */
export function detectComponents(stackPath) {
	const components = readComponents(stackPath);

	return Object.entries(components).map(([id, config]) => {
		const check = config.check ?? '';
		const onDemand = check.trim() === '';
		const bin = onDemand ? null : check.split(/\s+/)[0];
		const path = bin ? onPath(bin) : null;

		return {
			id,
			enabled: config.enabled === 'true',
			purpose: config.purpose ?? '',
			why: config.why ?? '',
			install: config.install ?? '',
			mcp: config.mcp ?? '',
			notes: config.notes ?? '',
			onDemand,
			present: onDemand ? true : Boolean(path),
			path,
		};
	});
}
