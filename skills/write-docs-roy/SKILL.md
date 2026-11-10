---
name: write-docs-roy
description: "Writes or updates project documentation in the repo, grounded in the real code: README, API reference, runbook, onboarding guide and architecture notes. Trigger: the user asks to 'write the README', 'document this', 'update the docs', 'write a runbook', 'onboarding guide', 'API docs', 'document this endpoint', or 'explain how to run this project'. It writes files in the repo only; it does not publish to Notion, Drive or Confluence."
disable-model-invocation: false
argument-hint: "what to document and for whom"
---

# /write-docs-roy — Documentation grounded in the code

You write docs a new person can follow, and every fact in them comes from the code or from the user. **You write files in the repo, left unstaged**: you do not publish to Notion, Google Docs or Confluence, and you do not commit.

## When to use / when not

- Use it to create or update a README, an API reference, a runbook, an onboarding guide or an architecture note.
- Do not use it to read docs from Notion or Drive (that is `/consult-docs-roy`), for code comments (the rules cover them) or for a spec of a feature (that is `/spec-roy`).

## 1. Detect and decide

Find what exists (`README`, `docs/`, `CLAUDE.md`, `AGENTS.md`): follow its language, headings and tone. Ask only what the code cannot answer, with closed options: who reads it (new teammate, user of the API, on-call person) and where it lives. Choose one purpose per document:

| Purpose | Use for |
|---|---|
| Tutorial | Teaching a newcomer by doing; ends with something that works |
| How-to | A task for someone who already knows the basics (a runbook is a how-to) |
| Reference | Facts to look up: endpoints, options, variables |
| Explanation | Why it is built this way: architecture, decisions, trade-offs |

Do not mix purposes in one page; link instead.

## 2. Gather facts from the code

- Commands come from `package.json` scripts, a Makefile or CI; ports and variables from the code and `.env.example` (names only, never values or secrets).
- Endpoints, parameters and errors come from the router and handlers; use CodeGraph, then grep.
- Names of modules and files are checked to exist. Dates come from the system.
- What you cannot verify (on-call contacts, SLAs, deployment targets, owners) you ask for or leave out. Never invent it, and never leave a placeholder that looks like a fact.

## 3. Write

1. **Most useful first.** The reader's first screen answers what this is and how to get it running.
2. **Show, do not tell:** commands, example requests and responses, copied from real sources.
3. **Link, do not duplicate:** point to the doc or file that owns the fact.
4. **Shape by type:**
   - README: what and why, quick start, configuration, usage, how to test, how to contribute.
   - Runbook: when to use it, prerequisites and access, numbered steps, how to check it worked, rollback, who to escalate to.
   - API reference: for each endpoint the method, path, auth, parameters, example request and response, errors.
   - Onboarding: environment setup, how the pieces connect, the common tasks, who to ask for what.

Correct: "Run `npm run dev` (from `package.json`); the app listens on port 3000 (`src/server.ts:14`)."
Incorrect: "Start the app with the usual command; it runs on the default port."
It fails because the reader cannot follow it and nothing can be checked.

## 4. Verify

Check that every relative link and file path exists, that every command appears in the repo, and that every claim has a source in the code or from the user. Do not run the documented commands unless the user asks; if you did not run them, say so ("commands copied from `package.json`, not executed"). Show the diff and state what is still unverified.

## If it fails

If the code contradicts what the user said, show both and ask which is right. If a fact is missing, name the question that settles it. A shorter true doc beats a longer guess.

Source: https://diataxis.fr/

## Final checklist

- [ ] One purpose per document; the existing language and format followed
- [ ] Every command, path, port and variable name comes from the repo
- [ ] No secret value and no invented contact, SLA or owner
- [ ] Links and file paths checked; what was not executed said
- [ ] Files left unstaged; nothing published elsewhere
