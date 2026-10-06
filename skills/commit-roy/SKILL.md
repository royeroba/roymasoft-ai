---
name: commit-roy
description: "Commits the current changes with a Conventional Commits message. Trigger: the user asks to 'make the commit', 'commit this', 'commit message', 'what message should I use' or 'prepare the commit'. Reads the diff, proposes type, scope and description, shows the message and, with the user's go-ahead, stages and commits."
disable-model-invocation: false
argument-hint: "optional: context or ticket (for example ABC-123)"
---

# /commit-roy — Commit with Conventional Commits

You read the change, write a message in [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) and, with the user's go-ahead, stage and commit. **You never run `git push`** (that is covered by `/create-pr-roy`). A hook asks for confirmation on screen on every `git add` and `git commit`: that is expected, do not work around it.

## When to use / when not

- Use it when asked to make, prepare or write a commit, or the message for one. If they only ask for the message, hand it over without executing anything.
- Do not use it for amend, rebase, squash or opening a PR; for those, say so and ask.
- Never trigger it on your own initiative or when finishing another task.

## 1. Read the change (read-only)

1. `git status --short` and `git diff --staged`. If nothing is staged, use `git diff` and warn: "nothing is staged; I'm basing this on the working tree".
2. `git log --oneline -10` to copy the repo's **language and scope style**. If the history is not consistent, use the language the user writes in the chat.
3. If there are no changes, say so and finish.

## 2. One commit or several?

If the diff mixes unrelated purposes (a fix and a refactor, or code and docs for something else), **propose several commits**: for each one, the list of files and its message. The user stages each group. Do not force a split if the change is a single unit.

## 3. Build the message

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer]
```

| Type | When |
|---|---|
| `feat` | New functionality for the user |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting with no logic change |
| `refactor` | Internal change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` / `ci` | Dependencies, build, pipelines |
| `chore` | Maintenance that does not fit above |
| `revert` | Undoes a previous commit |

Verifiable rules:

- **Description:** imperative mood, lowercase first letter, no trailing period, 72 characters at most, says **what changed and why it matters**, not how.
- **Type:** the one that describes the effect, not the file. A change in `README` that fixes a broken command is `docs`; a behavior change with a test is `fix` or `feat`.
- **Scope:** only if the repo already uses it (step 1.2) and it is a real module, not an invented one.
- **Body:** only if the why does not fit in the description. Lines of 72 at most.
- **Breaking change:** `!` after the type or scope **and** a `BREAKING CHANGE: <what breaks and how to migrate>` footer.
- **Ticket footer:** `Refs: ABC-123` if the user gave it. Do not invent numbers.

Correct:
```
fix(auth): keep the session open when renewing an expired token

The interceptor retried without waiting for the refresh and cleared the session.
```

Incorrect:
```
Fixed stuff and updated files.
```
It fails because it has no type, is in the past tense, does not say what was fixed and is not verifiable.

## 4. Show and confirm

1. Show the message in a code block, the files that would go in the commit and any file that should **not** go.
2. Ask: "Shall I make the commit like this?". Without an explicit yes, execute nothing. If they asked only for the message, stop here.

## 5. Execute

1. Stage **only the listed files** (`git add <files>`), never `git add .` or `-A`, and do not include files with secrets.
2. `git commit` with the confirmed message. If it has a body, use a temporary message file outside the repo and delete it afterwards. Never `--no-verify`.
3. If a git hook fails, show the error and stop: do not retry with another message or by skipping the hook.
4. With several commits, run them one by one in the proposed order.
5. Show `git log --oneline -n` with what was created. Leave unstaged everything that does not belong in the commit.

## 6. Alerts

- If the diff includes secrets (`.env`, keys, tokens, credentials), **do not write the commit**: warn first.
- If there are generated files, binaries or unrelated lockfiles, point them out.
- If you do not understand the purpose of the change, ask; do not guess from file names.

## Final checklist

- [ ] I read the real diff, I did not assume
- [ ] I did not run `git add` or `git commit` without the user's explicit yes
- [ ] Stage only the listed files, no `git add .` or `--no-verify`
- [ ] I did not `git push`
- [ ] Correct type according to the effect
- [ ] Description in imperative mood, lowercase, no period, 72 characters or fewer
- [ ] `BREAKING CHANGE` if the change breaks compatibility
- [ ] Language and scope match the repo's history
- [ ] I checked for secrets and files that should not go
