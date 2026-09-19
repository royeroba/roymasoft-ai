# Spec template

The shape `/spec` must respect. **Not text to copy verbatim** — each section states its purpose and
shows a minimal example.

Specs are written in **English**. If the repository's existing specs are in another language, match
them instead.

---

## Header

A blockquote. No tables, no code blocks.

```markdown
# SPEC NN — Short descriptive title

> **Status:** Draft
> **Depends on:** SPEC 01, SPEC 02
> **Date:** YYYY-MM-DD
> **Objective:** One sentence. If it needs two, the feature is too big.
```

**Valid states:** `Draft` · `In review` · `Approved` · `Implemented` · `Obsolete`.
Pick one set per repository and stay consistent. `/spec-impl` matches by meaning, so equivalents in
other languages are accepted — but do not mix them within a repository.

**Objective rule:** one sentence a human reads in five seconds and understands what will be built.
If it does not fit, split the feature.

---

## 1 — Why this spec exists *(optional)*

Only for specs that take non-obvious decisions or break an existing pattern. The **why**, not the
what. Omit for simple specs.

---

## 2 — Scope

Two sub-blocks. **Both mandatory.**

```markdown
## Scope

**In:**
- Concrete thing one.
- Concrete thing two.

**Out of scope (future specs):**
- Something possible but not now.
- Something raised in conversation and deliberately deferred.
```

**Why "out" matters:** it captures what came up during the questions and was deliberately left
behind. Without that record, implementation will be tempted to slip it in "while we're here".

---

## 3 — Data model

The concrete structures that appear or change. Real code, not abstract pseudocode.

```markdown
## Data model

\`\`\`ts
type ExportRequest = {
  filters: ReportFilters;   // reuses the existing type, src/reports/types.ts
  format: 'csv' | 'xlsx';
  requestedAt: string;      // ISO 8601, UTC
};
\`\`\`

Conventions:
- Dates are ISO 8601 strings in UTC, never Date objects across the boundary.
```

Introduces no new data? Say so explicitly: *"No new structures. Reuses the model from SPEC 01."*

---

## 4 — Implementation plan

Numbered steps. Each step must leave the system **functional and runnable**.

```markdown
## Implementation plan

1. Add `ExportRequest` to `src/features/export/types.ts`. No behaviour change.
2. Implement `buildCsv(rows)` in `src/features/export/csv.ts`. Check: `pnpm test csv.spec.ts`.
3. Wire the route at `src/api/export.ts` to `buildCsv`. Check: `curl localhost:3000/export?format=csv`.
```

**Rules:**
- Each step is independently commitable.
- A step needing more than 30–50 lines usually contains two steps.
- The last step is **not** "test everything" — that is the acceptance criteria.
- Every step names how it is checked.

---

## 5 — Acceptance criteria

Boolean checklist. Each item verifiable yes or no.

```markdown
## Acceptance criteria

- [ ] `GET /export?format=csv` returns 200 with `Content-Type: text/csv`.
- [ ] The first row is the header, matching the visible column order.
- [ ] A filter set over 50k rows returns 413 with `ExportTooLargeError`.
```

**Anti-patterns:**
- ❌ "that it works well" — not verifiable
- ❌ "good UX" — subjective
- ❌ "no bugs" — not operational
- ✅ "Pressing Esc closes the dialog without saving" — boolean, verifiable

---

## 6 — Decisions taken and discarded

**The section with the most value three months from now.** Capture what you considered, not only
what you chose.

```markdown
## Decisions

- **Yes:** stream the response. Exports can exceed memory at 50k rows.
- **No:** generate to a temp file first. Adds cleanup and a failure mode for no benefit here.
- **Yes:** hard row cap at 50k, returning 413. Bounds the worst case explicitly.
- **No:** background job with email delivery. Real option, but it is its own spec.
```

Every decision carries a brief reason. Decisions without reasons are the first ones re-litigated.

---

## 7 — Risks *(optional)*

Only for non-obvious risks.

```markdown
## Risks

| Risk | Mitigation |
|---|---|
| Client aborts mid-stream, leaving the query open | Pass the abort signal through; tested in `export.spec.ts` |
| Column order drifts from the UI | Both read the same `COLUMNS` constant |
```

Omit for small, contained features.

---

## Final — What is NOT in this spec

Repeat explicitly at the end what will not be done. The repetition is deliberate: Scope already
says it, but the closing lines are what someone skimming actually reads.

```markdown
## What is **not** in this spec

- Excel export (`format: 'xlsx'` is typed but returns 501).
- Scheduled or emailed exports.
- Column selection by the user.

Each of these, if it happens, gets its own spec.
```

---

## Document-wide rules

- **One idea per sentence.** Two commas and a semicolon means split it.
- **Concrete names.** Not "the levels module" but `src/levels.ts`. Not "a key" but the exact string.
- **No TODOs.** A TODO in a spec means the decision was not taken. Take it, or record it as an open decision with a reason.
- **No long executable code.** Short snippets to illustrate data shapes are fine; full functions are not.
- **Standard Markdown.** It must render on GitHub without surprises.
