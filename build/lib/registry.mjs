/**
 * Registry of repositories this harness has been projected into.
 *
 * `update` needs it: pulling the harness is useless if the client repositories keep running the
 * previous version, and nothing else records where they are.
 *
 * Lives at ~/.roymasoft/projects.json. Never inside a client repository — that would leak one
 * client's paths into another's git history.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';

const ROOT = join(homedir(), '.roymasoft');
const FILE = join(ROOT, 'projects.json');

function load() {
	if (!existsSync(FILE)) return { version: 1, projects: [] };
	try {
		const parsed = JSON.parse(readFileSync(FILE, 'utf8'));
		return { version: parsed.version ?? 1, projects: parsed.projects ?? [] };
	} catch {
		// A corrupt registry must not block work: start clean rather than crash.
		return { version: 1, projects: [], corrupt: true };
	}
}

function save(data) {
	mkdirSync(ROOT, { recursive: true });
	writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function registryPath() {
	return FILE;
}

export function list() {
	return load().projects;
}

/** Records a projection. Re-projecting the same path updates its entry rather than duplicating it. */
export function record(path, agents) {
	const data = load();
	const absolute = resolve(path);
	const entry = {
		path: absolute,
		agents,
		projectedAt: new Date().toISOString(),
	};

	const index = data.projects.findIndex((p) => resolve(p.path) === absolute);
	if (index >= 0) data.projects[index] = entry;
	else data.projects.push(entry);

	save(data);
	return entry;
}

export function forget(path) {
	const data = load();
	const absolute = resolve(path);
	const before = data.projects.length;
	data.projects = data.projects.filter((p) => resolve(p.path) !== absolute);
	save(data);
	return before !== data.projects.length;
}

/**
 * Entries whose directory no longer exists. Reported rather than removed: a missing path may be an
 * unmounted drive, not a deleted repository.
 */
export function stale() {
	return load().projects.filter((p) => !existsSync(p.path));
}
