---
name: create-skill-roy
description: "Creates or reviews a skill (or decides that it should be a rule) for the roymasoft-ai plugin. Trigger: the user asks to 'create a skill', 'make a skill for X', 'new skill', 'improve/review this skill' or 'should this be a skill or a rule'. Decides the type, writes SKILL.md with verifiable rules and validates it with the checklist."
disable-model-invocation: false
argument-hint: "what the skill should do"
---

# /create-skill-roy — Create or review a skill

It is guided by the official Claude Code documentation (`code.claude.com/docs/en/skills`) and by the user's guide on verifiable rules. If you doubt a field or a limit, **consult Context7** (`/websites/code_claude`); do not assume it.

## Conventions of this plugin

- Every skill's `name` and folder **end in `-roy`** (for example `commit-roy`), so the user can tell at a glance that their skill fired and not a similar one from the agent or another tool.
- Skills are written **entirely in English**, including the `description` and its trigger phrases. Replies to the user stay in Spanish (global rule).

## 1. Rule or skill?

| It is... | Answers | Where it goes |
|---|---|---|
| **Rule**: convention ("how X should look": names, structure, limits) | How should this look? | `rules/*.md` or a paragraph in `rules/behavior.md` |
| **Skill**: flow with steps ("what do I do to X") | What steps do I follow? | `skills/<name>-roy/SKILL.md` |

If it is a rule, say so, propose where it goes and **do not create a skill**. A skill **links** the rules; it never copies them.

## 2. Before writing

- Check that nothing equivalent already exists (`skills/`, `rules/`, global skills). If it does, propose extending it.
- Confirm with the user: what triggers the skill, what it delivers and what it does **not** do. If the request is ambiguous, ask with closed options.
- **Type:** *workflow* (steps in a fixed order, like `/rdd-roy`) or *dispatcher* (many conventions: a short `SKILL.md` that routes to `references/<topic>.md`).

## 3. Write the `SKILL.md`

**Frontmatter** (all fields are optional; only `description` is recommended):

- `name`: kebab-case ending in `-roy`. By default it is the folder name.
- `description`: what it does and when to use it, with **the main use case first**. Together with `when_to_use` it is cut at 1,536 characters in the listing. Include phrases the user would really say, in English.
- `disable-model-invocation: true` if it should only run when the user invokes it with `/` (actions with external effect, such as opening a PR). `false` if Claude may trigger it on its own.
- `argument-hint`, `allowed-tools`: only if needed.
- A misspelled field is **ignored silently**: copy the exact name. The opening `---` goes on the first line.

**Body:**

1. One paragraph: what it does and what it does **not** do (for example, "it does not edit, it does not commit").
2. **When to use / when not**, with clear conditions.
3. Numbered steps, actionable and verifiable. Every rule must be checkable by eye in a diff or in an output.
4. For every non-obvious rule, a **correct and an incorrect** example with the why. Take the examples from real code, do not invent them.
5. What it does if something fails ("if it cannot be done, say so; do not invent").
6. Final checklist.

**Size:** own target, under 200 lines (the official documentation allows up to 500). If it grows, move the detail to separate files referenced from `SKILL.md` with what they contain and when to read them.

### Description: correct and incorrect

Correct:
> `description: "Writes and opens the PR for the current change. Trigger: 'create the PR', 'open a pull request'. Summarizes the diff, lists risks and does not push without permission."`

Incorrect:
> `description: "Useful skill to work with code in a clean and orderly way."`

It fails because it does not say when to use it or what it delivers: Claude cannot decide whether it applies, and "clean and orderly" is not verifiable.

## 4. Validate

- Run `claude plugin validate .` at the repo root.
- Bump the version in `.claude-plugin/plugin.json` and `marketplace.json` if the cache must be updated (the repo does not do it on its own).
- Test the trigger with 2 or 3 real phrases from the user. To measure it repeatably, an eval case with a `tool_used: Skill` grader and `claude plugin eval`.
- Do not commit or stage on your own (only if the user asks, with `/commit-roy`). Show the files touched.

## 5. Final checklist

- [ ] Was it a skill and not a rule?
- [ ] Name in kebab-case ending in `-roy`, folder `skills/<name>-roy/`
- [ ] Everything in English, including the trigger phrases
- [ ] `description` with the main use case first and real phrases
- [ ] Clear "when to use / when not"
- [ ] Actionable, verifiable steps, no subjective criteria
- [ ] Correct and incorrect example where not obvious
- [ ] Links the rules, does not copy them
- [ ] Under 200 lines (or detail moved to separate files)
- [ ] `claude plugin validate .` passes
- [ ] Tested with real trigger phrases
