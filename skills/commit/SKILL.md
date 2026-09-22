---
name: commit
description: "Prepare a commit for the human to run. Trigger: the human asks for a commit message, to split work into commits, or what to commit. Runs the diff guard, drafts the message, and hands over the command — never executes it."
disable-model-invocation: false
argument-hint: "(none)"
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(node:*)
---

# /commit

## Session context

Status:
!`git status --short 2>/dev/null || echo "not a git repository"`

Recent messages, to match the repository's style:
!`git log --oneline -10 2>/dev/null || echo "no history"`

---

**You never commit.** You prepare it and hand the human the command.

That is not a formality: the human is the one who tested it, and the one accountable for what lands.

---

## 1. Run the guard

```bash
node .rai/guards/diff-guard.mjs
```

Blocking findings → **stop**. Report them and do not draft a message. A commit message for a diff
that leaks a secret is the wrong deliverable.

Guard not present → say so once and continue, but check the diff yourself for secrets and for
files that should never be committed.

---

## 2. Decide the shape

Read the diff. One coherent change, or several?

| Situation | Do |
|---|---|
| One logical change | One commit |
| Two or more unrelated changes | Propose splitting, with the exact `git add` per commit |
| A refactor mixed with a behaviour change | **Always propose splitting** — the mix is what makes a revert painful |
| Generated files (`AGENTS.md`, `.rai/`, …) mixed with source | Say so: they belong with the change that regenerated them, not scattered |

A commit should be revertible on its own without taking unrelated work with it.

---

## 3. Draft the message

Match the repository's existing style — read the last ten messages above. If they follow
Conventional Commits, follow them. If they do not, do not impose it.

**English** (→ `behavior/language.md`), unless the history is in another language.

```
<type>(<scope>): <what changed, imperative, lowercase, no period>

<why it changed — the reason, not the diff restated>
<constraint or consequence a future reader needs>

<footer: issue refs, breaking changes>
```

**Subject:** under ~60 characters. What, not how.
**Body:** only if it adds something the diff does not show. *Why* beats *what*.

❌ "update export.ts and add a helper function"
✅ `fix(export): stream csv instead of buffering`
   *"A 50k-row export exceeded the container memory limit. Streaming keeps it flat; the row cap at 50k stays as a second guard."*

### Never

- **No attribution trailers.** No `Co-Authored-By`, no `Generated with`, unless the human asks.
- No "as requested", no "per the ticket" with no ticket number.
- No message describing your process instead of the change.

---

## 4. Hand it over

```
Guard: limpio (4 archivos).

Propongo 1 commit:

  git add src/features/export/ src/api/export.ts
  git commit -m "fix(export): stream csv instead of buffering" \
             -m "A 50k-row export exceeded the container memory limit..."

Antes de correrlo: <lo que el humano debería probar>
```

For multiple commits, give them in order, each with its own `git add`.

**Do not run it. Do not `git add`. Do not push.** Print the command and stop.

---

## 5. If the human asks you to commit anyway

They may. It is their repository and their call. In that case:

- Run exactly the command you proposed, nothing extra.
- Never `--no-verify`, never `--amend` on a pushed commit, never force push.
- Never `git add .` — stage the paths you listed.
- Report the resulting hash.

Still never push unless they ask for that separately.
