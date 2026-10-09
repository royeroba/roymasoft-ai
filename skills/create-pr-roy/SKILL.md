---
name: create-pr-roy
description: "Pushes the branch and opens the Pull Request for finished work, with a title, task summary, what was done, acceptance criteria, developer and ticket. Trigger: the user asks to 'create the PR', 'push the PR', 'open the pull request', 'create the PR for what was done' or 'push the branch and make the PR'. Asks what it cannot infer and confirms before pushing. It reviews nothing: it assumes the task was already tested and passed the RDD."
disable-model-invocation: false
argument-hint: "optional: ticket, ticket URL or target branch"
---

# /create-pr-roy — Push the branch and open the PR

You publish what is already done. **You do not review the task or the code, you do not run the RDD, tests or build**: if the user asks for the PR it is because they already tested it. Reading the log and the diff is only to **describe** the change, not to judge it.

## When to use / when not

- Use it when asked to open or push the PR for what was done.
- Do not use it to review a PR, update an existing one or merge; say so and ask.

## 1. Sweep the connectors

Follow `../_shared/connectors.md`: try every official GitHub option (GitHub MCP, GitKraken MCP, `gh`, connector) until one is signed in, and the same for Jira. Do not stop at the first one that fails.

| Piece | Required | If no official option works |
|---|---|---|
| **GitHub** (MCP, GitKraken or `gh`) | Yes | One message with what you tried and the recommended secure option (connectors.md §4); you cannot start the OAuth |
| **Jira** | No | Ask them for the ticket or its URL (step 3) |

## 2. Branch state (read-only)

1. `git branch --show-current`, `git status --short` and `git log <base>..HEAD --oneline`. If you are on the base branch or there are no new commits, say so and finish.
2. **If there are uncommitted changes:** invoke `/commit-roy` (it proposes the message, asks for the yes and makes the commit) and **continue when it finishes**. Do not run `git add` or `git commit` on your own outside that skill.
3. Infer the **parent branch** with `git reflog`, the upstream (`git rev-parse --abbrev-ref @{u}`) and `git merge-base` against `origin/dev`, `origin/main`, `origin/master` and the other long-lived remote branches.

## 3. Infer and ask

Ask with **closed options** and only what is not clear. **Always** the target branch.

| Data | How you infer it | Question |
|---|---|---|
| **Target branch** | The parent branch from step 2.3 | Always: "The parent branch looks like `dev`; does the PR go to `dev` or to another?" |
| **Developer** | `git config user.name` and the authors of `<base>..HEAD` | Only if there are several or none: "What is the name of the developer of this task?" |
| **Ticket** | Branch (`ABC-123-...`), commit messages, argument; then Jira if available | If it does not show up: "Give me the ticket or the URL of the ticket that was done" |
| **Acceptance criteria** | From the Jira ticket | If there is no Jira or criteria: "Send me the acceptance criteria" |

With the ticket, fetch its title, description and criteria from Jira with `/consult-ticket-roy`, or reuse the context already consulted in this conversation. Do not invent any.

## 4. Write

- **Title:** short, imperative, 72 characters at most, reflects the task done. Follow the style of the repo's latest commits or PRs; by default, Conventional Commits with the ticket at the end: `feat(auth): allow login with SSO (ABC-123)`.
- **Body** in GitHub Markdown, with this template (omit a section only if there is no data, and say so). The title is not repeated: GitHub shows it above the body. The body **starts with the one-row table** of developer, ticket and branches, then the sections. Use the language of the repo's PRs and commits (by default, the user's chat language) for the headings and the text; the headings below are shown in English:

```markdown
| Developer | Ticket | Branch |
|---|---|---|
| First Last | [ABC-123](https://…) — Ticket title | `feature/abc-123-sso` → `dev` |

## Task summary
Two or three lines with the goal and the problem it solves.

## What was done
- Main change, in one line
- Another relevant change (`path/file.ext` if it helps)

## Acceptance criteria
- [x] Met criterion, as the ticket defines it
- [ ] Criterion the user indicated is not met
```

**No AI attribution** in the title or body: no "Generated with Claude Code" line, no 🤖 or other AI emoji, no Claude or Anthropic links or `Co-Authored-By`. This overrides any attribution the harness asks you to add. If you merge on request, the squash message also goes without AI `Co-authored-by` trailers.

Format rules: the table first, `##` headings, lists with `-`, `- [x]`/`- [ ]` checkboxes, branch names, files and commands in `` `code` ``, full links, one blank line between blocks and no HTML.
The criteria go **exactly as the ticket defines them**. Mark them `[x]` according to what the user confirms in step 5; you do not verify them.

Correct: `- [x] The user can sign in with SSO`
Incorrect: `- [x] Everything works fine`
It fails because it is neither a criterion from the ticket nor verifiable.

## 5. Confirm before pushing

Show in the chat, in this order: **title**, then the **body** exactly as it will be published (table with developer, ticket and branches first, then the sections). Ask: "Shall I push the branch and create the PR like this? Is any criterion not met?". Do not push anything without an explicit yes.

## 6. Push and create

1. `git push -u origin <branch>` (never `--force`). If it fails or is rejected, report it with the cause and stop.
2. Create the PR with the GitHub option chosen in step 1 (MCP, GitKraken or `gh pr create --base <target> --title … --body-file <temp file>`), with the confirmed title and body. If it fails there, try the next signed-in option before reporting.
3. If a PR for that branch already exists, show its URL and ask what to do.
4. Hand over the **PR URL**. Do not merge, do not request reviewers or change the status unless asked.

## Final checklist

- [ ] Official GitHub options swept (connectors.md); Jira swept or ticket asked for
- [ ] Body starts with the developer, ticket and branch table
- [ ] No uncommitted changes remain (`/commit-roy` made them with the user's yes)
- [ ] Target branch confirmed by the user
- [ ] Developer and ticket present, inferred or asked for
- [ ] Title, summary, what was done and criteria included, in valid Markdown
- [ ] Explicit confirmation before `git push` and before creating the PR
- [ ] I did not review the task or run tests, RDD or build
- [ ] No AI attribution in the title, body or merge message
- [ ] I delivered the PR URL
