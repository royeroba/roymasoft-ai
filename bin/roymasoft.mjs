#!/usr/bin/env node
/**
 * roymasoft-ai CLI.
 *
 *   roymasoft init [path]     detect, install what is missing (after asking), project
 *   roymasoft update          pull the harness and re-project every registered repository
 *   roymasoft sync            report upstream versions of the external components
 *   roymasoft doctor          read-only health check
 *   roymasoft project [path]  projection only, nothing else
 *
 * Node rather than PowerShell: Node is already a hard dependency of the harness, so one
 * implementation serves Windows, macOS and Linux instead of two that drift apart.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import { project, ALL_AGENTS, HARNESS } from '../build/project.mjs';
import { detectOS, detectRuntimes, detectAgents, detectComponents } from '../build/lib/detect.mjs';
import { checkAll } from '../build/lib/versions.mjs';
import { plan as uninstallPlan, execute as uninstallExecute } from '../build/lib/uninstall.mjs';
import * as registry from '../build/lib/registry.mjs';

const STACK = join(HARNESS, 'stack.toml');

const c = {
	dim: (s) => `\x1b[2m${s}\x1b[0m`,
	bold: (s) => `\x1b[1m${s}\x1b[0m`,
	green: (s) => `\x1b[32m${s}\x1b[0m`,
	yellow: (s) => `\x1b[33m${s}\x1b[0m`,
	red: (s) => `\x1b[31m${s}\x1b[0m`,
	cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

const ok = (m) => console.log(`  ${c.green('ok')}   ${m}`);
const warn = (m) => console.log(`  ${c.yellow('warn')} ${m}`);
const bad = (m) => console.log(`  ${c.red('fail')} ${m}`);
const step = (m) => console.log(`  ${c.dim('·')}    ${m}`);

const args = process.argv.slice(2);
const command = args[0] ?? 'help';
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : null;
};
const positional = args.slice(1).find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true);

async function confirm(question) {
	if (flag('yes')) return true;
	if (!stdin.isTTY) {
		warn('not an interactive terminal — skipping. Re-run with --yes to proceed unattended.');
		return false;
	}
	const rl = createInterface({ input: stdin, output: stdout });
	const answer = (await rl.question(`\n${question} [y/N] `)).trim().toLowerCase();
	rl.close();
	return answer === 'y' || answer === 'yes';
}

function git(cwd, argv) {
	return execFileSync('git', argv, { cwd, encoding: 'utf8' }).trim();
}

// ── init ─────────────────────────────────────────────────────────────────────

async function cmdInit() {
	const target = resolve(positional ?? process.cwd());
	console.log(`\n${c.bold('roymasoft-ai init')} ${c.dim(`-> ${target}`)}\n`);

	if (!existsSync(target)) {
		bad(`target does not exist: ${target}`);
		process.exit(1);
	}

	// 1. Environment
	const os = detectOS();
	console.log(c.bold('Environment'));
	ok(`${os.platform} ${os.arch}`);

	const runtimes = detectRuntimes();
	let blocked = false;
	for (const r of runtimes) {
		if (r.present) ok(`${r.id} ${c.dim(r.version ?? '')}`);
		else if (r.required) {
			bad(`${r.id} missing — required for ${r.why}`);
			blocked = true;
		} else step(`${r.id} ${c.dim(`— not found (needed for ${r.why})`)}`);
	}
	if (blocked) {
		console.log(`\n${c.red('Install the missing required runtimes and re-run.')}\n`);
		process.exit(1);
	}

	// 2. Agents — only project for what is actually here
	console.log(`\n${c.bold('Agents')}`);
	const agents = detectAgents(target);
	const explicit = value('agents');
	const selected = explicit
		? explicit.split(',').map((a) => a.trim())
		: flag('all')
			? ALL_AGENTS
			: agents.filter((a) => a.present).map((a) => a.id);

	for (const a of agents) {
		if (selected.includes(a.id)) ok(`${a.label} ${c.dim(`— ${a.evidence[0] ?? 'selected explicitly'}`)}`);
		else step(`${a.label} ${c.dim('— not detected, skipping')}`);
	}

	if (!selected.length) {
		warn('no agents detected. Use --agents claude,cursor or --all to force.');
		process.exit(1);
	}

	// 3. Components — report, then ask once
	console.log(`\n${c.bold('Components')}`);
	const components = detectComponents(STACK);
	const missing = components.filter((k) => k.enabled && !k.present && k.install && !k.install.startsWith('('));

	for (const k of components) {
		if (!k.enabled) step(`${k.id} ${c.dim('— disabled in stack.toml')}`);
		else if (k.present) ok(`${k.id} ${c.dim(k.onDemand ? '— on demand' : k.path ?? '')}`);
		else bad(`${k.id} — enabled but not installed`);
	}

    if (missing.length) {
		console.log(`\n${c.bold('These would be installed:')}`);
		for (const k of missing) console.log(`  ${k.id}  ${c.dim(k.install)}`);

		if (await confirm('Install them now?')) {
			for (const k of missing) {
				step(`installing ${k.id}…`);
				const parts = k.install.split(/\s+/);
				const result = spawnSync(parts[0], parts.slice(1), { stdio: 'inherit', shell: os.isWindows });
				if (result.status === 0) ok(`${k.id} installed`);
				else bad(`${k.id} failed (exit ${result.status}) — install it by hand`);
			}
		} else {
			warn('skipped. The harness works without them; enable later with `roymasoft init --yes`.');
		}
	}

	// 4. Project
	console.log(`\n${c.bold('Projection')}`);
	const result = project({ target, agents: selected, log: () => {} });
	ok(`${result.files.length} files for ${selected.join(', ')}`);
	ok(`${result.skills} skills indexed`);

	registry.record(target, selected);
	ok(`registered in ${c.dim(registry.registryPath())}`);

	// 5. What is next
	console.log(`\n${c.bold('Next')}`);
	step('restart your agent so it picks up the skills and subagents');
	if (!existsSync(join(target, 'PROJECT.md'))) step(`run ${c.cyan('/onboard-repo')} to generate PROJECT.md`);
	const mcp = components.filter((k) => k.enabled && k.mcp);
	for (const k of mcp) step(`register the MCP: ${c.cyan(k.mcp)}`);
	console.log('');
}

// ── update ───────────────────────────────────────────────────────────────────

async function cmdUpdate() {
	console.log(`\n${c.bold('roymasoft-ai update')}\n`);

	console.log(c.bold('Harness'));
	let dirty = '';
	try {
		dirty = git(HARNESS, ['status', '--porcelain']);
	} catch {
		bad('the harness is not a git repository — cannot update');
		process.exit(1);
	}
	if (dirty) {
		bad('the harness has uncommitted changes:');
		for (const line of dirty.split('\n').slice(0, 8)) console.log(`         ${line}`);
		console.log(`\n  ${c.yellow('Commit or stash them first. Nothing was pulled.')}\n`);
		process.exit(1);
	}

	const before = git(HARNESS, ['rev-parse', '--short', 'HEAD']);
	try {
		execFileSync('git', ['fetch', '--quiet'], { cwd: HARNESS });
	} catch (err) {
		bad(`fetch failed: ${err.message}`);
		process.exit(1);
	}

	const branch = git(HARNESS, ['rev-parse', '--abbrev-ref', 'HEAD']);
	let behind = '0';
	try {
		behind = git(HARNESS, ['rev-list', '--count', `HEAD..origin/${branch}`]);
	} catch {
		warn(`no upstream for ${branch} — skipping pull`);
	}

	if (behind === '0') {
		ok(`already up to date (${before})`);
	} else {
		console.log(`\n${c.bold(`${behind} new commit(s):`)}`);
		console.log(git(HARNESS, ['log', '--oneline', `HEAD..origin/${branch}`]).split('\n').map((l) => `  ${l}`).join('\n'));
		if (!(await confirm('Pull them?'))) {
			warn('skipped. Nothing changed.');
			return;
		}
		execFileSync('git', ['merge', '--ff-only', `origin/${branch}`], { cwd: HARNESS, stdio: 'ignore' });
		ok(`pulled -> ${git(HARNESS, ['rev-parse', '--short', 'HEAD'])}`);
	}

	// Re-project everywhere, so no client repository keeps running the old behaviour.
	const projects = registry.list();
	console.log(`\n${c.bold('Registered repositories')}`);
	if (!projects.length) {
		step('none yet — run `roymasoft init` inside a repository');
		console.log('');
		return;
	}

	for (const entry of projects) {
		if (!existsSync(entry.path)) {
			warn(`${entry.path} ${c.dim('— gone, skipping (still registered)')}`);
			continue;
		}
		try {
			const result = project({ target: entry.path, agents: entry.agents, log: () => {} });
			ok(`${entry.path} ${c.dim(`(${result.files.length} files, ${entry.agents.join(', ')})`)}`);
		} catch (err) {
			bad(`${entry.path} — ${err.message}`);
		}
	}
	console.log(`\n  ${c.dim('Restart your agents to pick up the new version.')}\n`);
}

// ── sync ─────────────────────────────────────────────────────────────────────

async function cmdSync() {
	console.log(`\n${c.bold('roymasoft-ai sync')} ${c.dim('— upstream versions of the external components')}\n`);
	step('this command only reads and reports. It installs nothing.');
	console.log('');

	const results = await checkAll();
	const updates = [];

	for (const r of results) {
		const label = r.id.padEnd(10);
		if (r.status === 'update-available') {
			warn(`${label} ${r.installed} -> ${c.bold(r.latest)}`);
			updates.push(r);
		} else if (r.status === 'current') ok(`${label} ${r.installed} ${c.dim('(current)')}`);
		else if (r.status === 'not-installed') step(`${label} ${c.dim(`not installed — latest is ${r.latest}`)}`);
		else bad(`${label} ${c.dim(`could not check: ${r.error}`)}`);
	}

	if (updates.length) {
		console.log(`\n${c.bold('What changed')}`);
		for (const r of updates) {
			console.log(`\n${c.cyan(r.id)}  ${r.installed} -> ${r.latest}${r.publishedAt ? c.dim(`  (${r.publishedAt.slice(0, 10)})`) : ''}`);
			console.log(`  ${c.dim(r.url)}`);
			const notes = (r.notes ?? '')
				.split('\n')
				.filter((l) => l.trim())
				.slice(0, 8);
			for (const line of notes) console.log(`  ${line.slice(0, 110)}`);
			if ((r.notes ?? '').split('\n').filter((l) => l.trim()).length > 8) console.log(`  ${c.dim('…')}`);
		}
		console.log(`\n  ${c.yellow('Nothing was installed.')} Decide what to take, then update it yourself.\n`);
	} else {
		console.log(`\n  ${c.dim('Nothing to take.')}\n`);
	}

	const unknown = results.filter((r) => r.status === 'unknown');
	if (unknown.length) {
		console.log(`  ${c.dim(`${unknown.length} component(s) could not be checked — that is not evidence they are current.`)}\n`);
	}
}


// -- uninstall ----------------------------------------------------------------

async function cmdUninstall() {
	const all = flag('all');
	const targets = all
		? registry.list().map((entry) => entry.path)
		: [resolve(positional ?? process.cwd())];

	console.log(`
${c.bold('roymasoft-ai uninstall')}${all ? c.dim(' — every registered repository') : ''}
`);

	if (!targets.length) {
		step('no registered repositories. Pass a path, or run this inside one.');
		console.log('');
		return;
	}

	// Plan everything first: the human should see the whole blast radius before anything goes.
	const plans = [];
	for (const target of targets) {
		if (!existsSync(target)) {
			warn(`${target} ${c.dim('— gone, skipping')}`);
			continue;
		}
		const planned = uninstallPlan(target, HARNESS);
		plans.push(planned);

		const total = planned.remove.length + planned.edit.length;
		console.log(`${c.bold(target)} ${c.dim(`(${total} item(s))`)}`);

		for (const item of planned.remove) console.log(`  ${c.red('-')} ${item.path}${item.kind === 'dir' ? '/' : ''}`);
		for (const item of planned.edit) console.log(`  ${c.yellow('~')} ${item.path} ${c.dim(`— ${item.reason}`)}`);
		for (const item of planned.keep) console.log(`  ${c.dim('=')} ${c.dim(`${item.path} — ${item.reason}`)}`);
		for (const item of planned.foreign) warn(`${item.path} ${c.dim(`— ${item.reason}`)}`);
		console.log('');
	}

	const totalItems = plans.reduce((n, p) => n + p.remove.length + p.edit.length, 0);
	if (!totalItems) {
		step('nothing to remove — the harness is not installed here.');
		console.log('');
		return;
	}

	if (flag('dry-run')) {
		step('dry run: nothing was touched.');
		console.log('');
		return;
	}

	if (!(await confirm(`Remove ${totalItems} item(s) from ${plans.length} repositor${plans.length === 1 ? 'y' : 'ies'}?`))) {
		warn('cancelled. Nothing was touched.');
		return;
	}

	console.log('');
	for (const planned of plans) {
		const result = uninstallExecute(planned);
		ok(`${planned.target} ${c.dim(`(${result.done.length} removed, ${result.pruned.length} empty dir(s) pruned)`)}`);
		for (const f of result.failed) bad(`${f.path} — ${f.error}`);
		registry.forget(planned.target);
	}

	// What the harness cannot undo for you, said plainly rather than left as a surprise.
	console.log(`
${c.bold('Left in place, on purpose')}`);
	step(`the harness clone itself — delete ${c.dim(HARNESS)} by hand if you want it gone`);
	step(`the registry at ${c.dim(registry.registryPath())}`);
	step('external components (engram, rtk, cbm) — they are third-party tools you may still use');
	step('MCP registrations in your agents — remove them with your agent own command');
	if (!all) step(`PROJECT.md and specs/ — yours, not the harness's`);
	console.log('');
}

// -- doctor -------------------------------------------------------------------

function cmdDoctor() {
	console.log(`\n${c.bold('roymasoft-ai doctor')} ${c.dim('— read-only')}\n`);

	const os = detectOS();
	console.log(c.bold('Environment'));
	ok(`${os.platform} ${os.arch}`);
	for (const r of detectRuntimes()) {
		if (r.present) ok(`${r.id} ${c.dim(r.version ?? '')}`);
		else if (r.required) bad(`${r.id} missing — required for ${r.why}`);
		else step(`${r.id} ${c.dim('— not found')}`);
	}

	console.log(`\n${c.bold('Agents on this machine')}`);
	for (const a of detectAgents()) {
		if (a.present) ok(`${a.label} ${c.dim(`— ${a.evidence.join(', ')}`)}`);
		else step(`${a.label} ${c.dim('— not detected')}`);
	}

	console.log(`\n${c.bold('Components')}`);
	for (const k of detectComponents(STACK)) {
		// An on-demand component has no binary to find, so "present" never means "installed".
		if (k.onDemand) step(`${k.id} ${c.dim(k.enabled ? '— active, on demand' : '— disabled, on demand')}`);
		else if (!k.enabled && !k.present) step(`${k.id} ${c.dim('— disabled')}`);
		else if (!k.enabled && k.present) warn(`${k.id} — installed but disabled in stack.toml`);
		else if (k.enabled && k.present) ok(`${k.id} ${c.dim(k.path ?? '')}`);
		else bad(`${k.id} — enabled but not installed`);
	}

	console.log(`\n${c.bold('Registered repositories')}`);
	const projects = registry.list();
	if (!projects.length) step('none');
	for (const entry of projects) {
		if (existsSync(entry.path)) ok(`${entry.path} ${c.dim(`(${entry.agents.join(', ')})`)}`);
		else warn(`${entry.path} ${c.dim('— gone')}`);
	}

	console.log(`\n${c.bold('Harness')}`);
	const check = spawnSync(process.execPath, [join(HARNESS, 'build/validate.mjs')], { encoding: 'utf8' });
	const summary = (check.stdout ?? '').trim().split('\n').pop();
	if (check.status === 0) ok(summary ?? 'valid');
	else {
		bad('validation failed — run `node build/validate.mjs` for detail');
		process.exitCode = 1;
	}
	console.log('');
}

// ── project ──────────────────────────────────────────────────────────────────

function cmdProject() {
	const target = resolve(positional ?? process.cwd());
	const explicit = value('agents');
	const agents = explicit ? explicit.split(',').map((a) => a.trim()) : flag('all') ? ALL_AGENTS : detectAgents(target).filter((a) => a.present).map((a) => a.id);

	try {
		const result = project({ target, agents, log: () => {} });
		console.log(`\n  ${c.green('ok')}   ${result.files.length} files -> ${target}`);
		console.log(`  ${c.dim(`agents: ${result.agents.join(', ')} · ${result.skills} skills`)}\n`);
		registry.record(target, agents);
	} catch (err) {
		console.error(`  ${c.red('fail')} ${err.message}`);
		process.exit(1);
	}
}

// ── main ─────────────────────────────────────────────────────────────────────

function help() {
	console.log(`
${c.bold('roymasoft-ai')}

  ${c.cyan('roymasoft init')} [path]      detect, offer to install what is missing, project
  ${c.cyan('roymasoft update')}           pull the harness, re-project every registered repository
  ${c.cyan('roymasoft sync')}             report upstream versions of external components (read-only)
  ${c.cyan('roymasoft doctor')}           read-only health check
  ${c.cyan('roymasoft project')} [path]   projection only
  ${c.cyan('roymasoft uninstall')} [path] remove the harness from a repository (--all for every one)

${c.bold('Flags')}
  --agents a,b   project for these agents instead of the detected ones
  --all          project for all five agents
  --yes          do not ask before installing or removing
  --dry-run      uninstall: show what would go, touch nothing
`);
}

const commands = { init: cmdInit, update: cmdUpdate, sync: cmdSync, doctor: cmdDoctor, project: cmdProject, uninstall: cmdUninstall };

if (!commands[command]) {
	help();
	process.exit(command === 'help' || flag('help') ? 0 : 1);
}

try {
	await commands[command]();
} catch (err) {
	console.error(`\n  ${c.red('fail')} ${err.message}\n`);
	process.exit(1);
}
