/**
 * Upstream version lookups for the external components.
 *
 * Read-only by contract: this module fetches and compares. It never installs, never writes and
 * never decides. `sync` reports; the human picks.
 */

import { execFileSync } from 'node:child_process';

/** Where each component's current version comes from. */
const SOURCES = {
	engram: { kind: 'github', repo: 'Gentleman-Programming/engram' },
	cbm: { kind: 'github', repo: 'DeusData/codebase-memory-mcp' },
	rtk: { kind: 'github', repo: 'rtk-ai/rtk' },
	context7: { kind: 'npm', pkg: '@upstash/context7-mcp' },
};

const TIMEOUT_MS = 10_000;

async function getJson(url, accept = 'application/json') {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		// npm rejects GitHub's vendor Accept header with 406, so each registry gets its own.
		const headers = { 'User-Agent': 'roymasoft-ai', Accept: accept };
		// A token lifts GitHub's 60/hour anonymous rate limit. Optional by design.
		if (process.env.GITHUB_TOKEN && url.includes('api.github.com')) {
			headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
		}

		const response = await fetch(url, { signal: controller.signal, headers });
		if (!response.ok) return { error: `HTTP ${response.status}` };
		return { data: await response.json() };
	} catch (err) {
		return { error: err.name === 'AbortError' ? 'timeout' : err.message };
	} finally {
		clearTimeout(timer);
	}
}

async function latestGithub(repo) {
	const { data, error } = await getJson(`https://api.github.com/repos/${repo}/releases/latest`, 'application/vnd.github+json');
	if (error) return { error };
	return {
		version: (data.tag_name ?? '').replace(/^v/, ''),
		publishedAt: data.published_at ?? null,
		url: data.html_url ?? `https://github.com/${repo}/releases`,
		notes: data.body ?? '',
	};
}

async function latestNpm(pkg) {
	const { data, error } = await getJson(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`);
	if (error) return { error };
	return {
		version: data.version ?? '',
		publishedAt: null,
		url: `https://www.npmjs.com/package/${pkg}`,
		notes: '',
	};
}

/** Installed version, read from the binary itself. Null when the tool is absent. */
export function installedVersion(component) {
	const probes = {
		engram: ['engram', ['--version']],
		rtk: ['rtk', ['--version']],
		cbm: ['codebase-memory-mcp', ['--version']],
		context7: null,
	};
	const probe = probes[component];
	if (!probe) return null;

	try {
		const out = execFileSync(probe[0], probe[1], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
		const match = out.match(/\d+\.\d+\.\d+(?:[-+][\w.]+)?/);
		return match ? match[0] : out.split(/\r?\n/)[0].trim();
	} catch {
		return null;
	}
}

/** Naive semver compare. Returns 1 when a > b, -1 when a < b, 0 when equal or uncomparable. */
export function compareVersions(a, b) {
	if (!a || !b) return 0;
	const parse = (v) => v.replace(/^v/, '').split(/[.\-+]/).map((n) => (/^\d+$/.test(n) ? Number(n) : n));
	const left = parse(a);
	const right = parse(b);

	for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
		const x = left[i];
		const y = right[i];
		if (x === undefined) return -1;
		if (y === undefined) return 1;
		if (typeof x === 'number' && typeof y === 'number') {
			if (x !== y) return x > y ? 1 : -1;
		} else if (String(x) !== String(y)) {
			return String(x) > String(y) ? 1 : -1;
		}
	}
	return 0;
}

/**
 * Upstream state for every component, in parallel.
 *
 * `status` is deliberately conservative: anything the lookup could not establish comes back as
 * `unknown`, never as `up-to-date`. A failed fetch is not evidence that nothing changed.
 */
export async function checkAll(componentIds = Object.keys(SOURCES)) {
	const results = await Promise.all(
		componentIds.map(async (id) => {
			const source = SOURCES[id];
			if (!source) return { id, status: 'unknown', error: 'no upstream source configured' };

			const latest = source.kind === 'github' ? await latestGithub(source.repo) : await latestNpm(source.pkg);
			if (latest.error) return { id, status: 'unknown', error: latest.error };

			const installed = installedVersion(id);
			let status;
			if (!installed) status = 'not-installed';
			else if (compareVersions(latest.version, installed) > 0) status = 'update-available';
			else status = 'current';

			return {
				id,
				status,
				installed,
				latest: latest.version,
				publishedAt: latest.publishedAt,
				url: latest.url,
				notes: latest.notes,
			};
		}),
	);
	return results;
}

export { SOURCES };
