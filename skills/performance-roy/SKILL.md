---
name: performance-roy
description: "Runs a measure-first performance workflow for frontend, backend and database work: define the metric, take a baseline, find the bottleneck, change one thing, re-measure and report before and after. Trigger: the user asks to make something faster or lighter, 'it is slow', 'optimize', 'performance', 'latency', 'Core Web Vitals', 'slow query', 'high CPU', 'memory', or a change is justified by performance."
disable-model-invocation: false
argument-hint: "what is slow, and how it is measured today"
---

# /performance-roy — Measure first, then optimize

You improve performance only against a **measured** problem. This skill is the workflow; the domain details live in the other skills' references and you link to them instead of repeating them. **You do not optimize by guess, and you do not change several things at once.**

## When to use / when not

- Use it whenever the request or the justification of a change is performance.
- Do not use it for a design that is merely "probably fine"; if nothing is slow, say so and stop.

## 1. Define the metric and the target

Ask for, or derive, one user-visible metric and a target, and write them down before touching code:

| Layer | Typical metric | Where the details are |
|---|---|---|
| Web page | LCP, INP, CLS at the 75th percentile (field data first) | `../frontend-roy/references/performance.md` |
| Rendering cost | profiler time for the interaction | `../frontend-roy/references/vue.md`, `react.md` |
| Service | latency (as a histogram), errors, saturation | `../backend-roy/references/observability.md`, `node-runtime.md` |
| Database | query time and plan | `../database-roy/references/sql.md`, `mongodb.md`, `dynamodb.md` |

If the user cannot name a metric, propose one with closed options.

## 2. Take a baseline

Measure the current state with the tool that matches the layer (field data or a lab report for pages, a profiler or timing for code, `EXPLAIN ANALYZE` in a rolled-back transaction for SQL, the profiler for MongoDB). Record the command, the data used and the number. Use realistic data: results on small data do not extrapolate. A lab score alone does not prove the user experience.

## 3. Find the bottleneck, change one thing, re-measure

1. Locate where the time goes (profile, trace or plan). Do not guess.
2. Change **one** thing that targets that bottleneck.
3. Re-measure in the same way and compare with the baseline.
4. Keep the change only if the metric improved; revert it otherwise.
5. Stop when the target is met.

## 4. Report

Say, in a short table: metric, baseline, result, what changed and what the measurement cannot show (production load, real devices, other data sizes). Run the repo's tests, since an optimization must not change behavior.

Correct:
> "INP on the filter field: 380 ms baseline in the profiler with 5,000 rows; after virtualizing the list, 90 ms in the same scenario. Not measured: real low-end devices."

Incorrect:
> "I memoized several components, so it should be faster now."
It fails because there is no baseline, no metric, several changes at once and an unverified claim.

## If it fails

If you cannot measure (no access to data, no profiler, no field data), say so, state which measurement is needed and who can provide it; do not present a guess as an optimization.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] A named metric and a target were defined first
- [ ] A baseline was measured with realistic data
- [ ] The bottleneck was located, not guessed
- [ ] One change at a time, re-measured the same way
- [ ] Before and after reported, with what remains unverified
