---
name: skill-creator
description: "Create a new skill for this harness. Trigger: the human asks to add a skill, or a pattern has been repeated enough to be worth encoding. Writes SKILL.md with valid frontmatter and keeps it within the token budget."
disable-model-invocation: false
argument-hint: "what the skill should do"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, Bash(ls:*), Bash(cat:*)
---

# /skill-creator

A skill is a **runtime instruction contract for a model**, not documentation for a human. Write it
as instructions, in the imperative, in English.

---

## Create a skill when

- A pattern is repeated and the agent gets it wrong without guidance.
- A workflow has steps that must happen in order, with gates between them.
- A decision tree exists and the agent picks wrong without it.

## Do not create one when

- It is a one-off.
- It is a project convention → that belongs in the project's `PROJECT.md`.
- It is a general behaviour rule → that belongs in `behavior/`.
- It is knowledge about a library → that is Context7's job, not a skill's.

**Behaviour rules go in `behavior/`. Workflows go in `skills/`.** Getting this wrong is the most
common mistake: a "skill" that is really a rule ends up never loaded, or loaded always.

---

## Steps

1. **Check it does not exist.** Read `skills/_registry.md` and the existing `skills/`.
2. **Confirm the trigger.** What exact words or situations should load this? If you cannot name them, the skill will never fire.
3. Create `skills/<kebab-name>/SKILL.md`.
4. Add companions only if needed: `assets/` for templates and schemas, `references/` for detail. **Link them by relative path** from the body.
5. Re-run the projection so the registry picks it up: `node build/project.mjs <target>`.

---

## Frontmatter

```yaml
---
name: kebab-name
description: "What it does. Trigger: the words or situations that should load it."
disable-model-invocation: false   # true = only the human invokes it explicitly
argument-hint: "what the argument means, or (none)"
allowed-tools: Read, Grep, Glob, Write, Bash(git status:*)
---
```

**`description` is the whole triggering mechanism.** It is what goes in the registry and what the
orchestrator matches against. Put the trigger words in it, literally. A vague description means a
skill that never loads.

**`allowed-tools` is least privilege, and it is the skill's real boundary.** A design skill does not
get `Edit`. A review skill does not get `Write`. Scope `Bash` per command: `Bash(git status:*)`,
never bare `Bash` unless the skill genuinely needs arbitrary execution.

---

## Body

| Section | Purpose |
|---|---|
| **Session context** *(optional)* | Live state injected with `` !`cmd` ``, each with a `\|\| echo` fallback |
| **When to use / not use** | So it fires at the right time and stays quiet otherwise |
| **Steps or phases** | Numbered, with an explicit gate where one matters |
| **Boundaries** | `**Will:**` / `**Will not:**` — what it must never do |
| **Return / close** | The exact shape of the output |

### Rules for the body

- **Imperative, not descriptive.** "Read `PROJECT.md` first", not "this skill reads PROJECT.md".
- **Bad / Good pairs** for anything the model gets wrong by default. They teach faster than prose.
- **Name the concrete failure**, never the principle alone.
- **Tables for decision trees.** A table is cheaper to read than three paragraphs.
- **No hedging.** "Never commit" beats "it is generally preferable not to commit".

### Budget

Target **180–450 tokens** of body. 700 acceptable. **1000 is the hard ceiling.**

Over budget → move detail into `references/` and link it, or the skill is doing two jobs and should
be two skills.

Every token in a skill is paid every time it loads. A skill nobody can afford to load is worthless.

---

## Before you finish

- Does the `description` contain words the human would actually say?
- Would the skill fire on the right task, and stay quiet on the wrong one?
- Does `allowed-tools` grant the minimum, not the convenient?
- Is every instruction something the model can act on, not something it can only agree with?
- Is it under the ceiling?

Then say the path you wrote and that the projection must be re-run. **Do not commit.**
