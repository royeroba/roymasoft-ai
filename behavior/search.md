# Search — cheapest first

Load when: you need to find anything in the codebase.

Reading the whole repository is the single most expensive habit an agent has. Every step below
exists to avoid it.

---

## The order

```
1. GRAPH    structure · symbols · call chains       ← if indexed
2. Grep     exact pattern, over what step 1 located
3. Glob     discover files by name
4. Read     full file — ONLY after locating the right one
5. scout    subagent with fresh context — last resort
```

**Never use bash to search.** No `find`, no `grep`, no `rg`, no `ls -R`. Use the dedicated tools:
they are faster, they respect ignore files, and their output is already shaped for you.

---

## Step 1 — the graph

When a code graph is indexed for this project, it answers structural questions without reading
files:

| Question | Call |
|---|---|
| "How is this organized?" (new repo) | architecture overview |
| "Who calls `processOrder`?" | trace inbound |
| "What does `processOrder` call?" | trace outbound |
| "What breaks if I change this?" | change impact over the diff |
| "Where is X defined?" | symbol search → then read that one snippet |

**Before any negative claim** — "nothing calls this", "it does not exist", "this is dead code" —
check index coverage for the paths involved.

> A clean coverage result means *"no recorded gap"*. It is **never** proof of completeness.

Partial, stale, skipped or unknown coverage → fall back to reading the reported range directly, and
say that you did.

### When the graph is not available

Not every repository is indexed, and the component is optional. If there is no graph, **start at
step 2 and say so once**:

> *"Sin grafo en este repo: voy con grep dirigido. Si quieres indexarlo, `/onboard-repo`."*

Do not silently pretend you consulted structure you never had.

---

## Step 2–4 — narrowing

- **Grep** for known symbols, strings and patterns. Prefer a precise pattern over a broad one plus filtering.
- **Glob** to find files by name when you know the shape but not the location.
- **Read** only after you know which file you need. Read a range when the file is large and you know where you are going.

Never read a file "to get familiar with it". Read it to answer a specific question.

---

## Step 5 — the scout subagent

Last resort, when you have spent three or more queries without converging, or when understanding
requires four or more files.

The scout reads in **its own context** and returns a summary. That is the point: the eight files it
opened never enter your thread.

Give it a narrow mapping task, not "explore the codebase".

---

## Stop conditions

Stop searching and start working when you can answer, without assuming:

1. Which files appear or change?
2. What is the first executable step, and the last?
3. How do I verify it is finished?

Stop searching and **ask** when more searching will not produce the answer — because the answer is
a product decision, a convention nobody wrote down, or a preference. More grep does not reveal
intent.

---

## Project map

If `PROJECT.md` carries a module map, read it before searching. Knowing that routing lives in
`src/app/routes` and data access in `src/infra/repositories` replaces several queries with zero.

Keep it current: when you discover structure the map does not reflect, say so and offer to update it.
