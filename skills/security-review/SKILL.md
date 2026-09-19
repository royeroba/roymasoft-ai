---
name: security-review
description: "Security review of backend and frontend code. Trigger: the human asks about security, injection, XSS, authorization, secrets or vulnerabilities, or a change touches auth, input handling, queries or file access. Reports exploitable findings with a concrete attack, never a checklist."
disable-model-invocation: false
argument-hint: "(none) | path | diff"
allowed-tools: Read, Grep, Glob, Task, Bash(git diff:*), Bash(git log:*)
---

# /security-review

A finding is only a finding if you can describe **the attack**. "Could be unsafe" is not a finding.

Scope it: a diff, a path, or a feature. Reviewing a whole codebase at once produces noise.

---

## What to check

Lookup tables — injection, authorization, secrets, XSS, storage, severity:
`references/checklist.md`. Read the half that matches what you are reviewing.

**Backend:** injection (SQL, command, path, template, NoSQL, deserialization) ·
**authorization** — the most common real vulnerability and the least visible in a diff ·
secrets in code, logs, URLs or errors.

**Frontend:** XSS sinks · open redirect · `postMessage` origin · secrets in the bundle ·
third-party scripts · token storage.

Framework escaping rules change between versions. **Check current behaviour with Context7** rather
than recalling what was true two majors ago.

---

## Boundaries

**Will:**
- Report findings with a concrete, describable attack
- Point at the specific line and the specific input that reaches it
- Say what you could not check

**Will not:**
- Fix anything — you report, the human decides
- Run exploits, scanners or anything against a live system
- Produce a compliance checklist
- Flag "this could theoretically be unsafe" with no path from an input to the sink

---

## Finding format

```
🔴 src/api/reports.ts:88 — SQL injection through the `sort` parameter
   Attack: GET /reports?sort=id;DROP TABLE reports-- reaches the query at :88
            unparameterized, concatenated into ORDER BY.
   Why parameters do not fix it: bind variables cannot bind identifiers.
   Fix: allowlist — ['id','createdAt','total'].includes(sort) or reject.
```

Severity by **exploitability and impact**, not by category name:
🔴 exploitable now, real impact · 🟡 requires a precondition, or impact is bounded · 🟢 hardening

---

## Close

```
**Alcance:** <qué revisaste — y qué NO>
🔴 <n>  🟡 <n>  🟢 <n>
**No pude comprobar:** <ej. authz en runtime, configuración de despliegue, deps transitivas>
```

If nothing exploitable turned up, say so plainly and name what you examined. An honest "nothing
found in this scope" beats a padded list — and it tells the human where to look next.
