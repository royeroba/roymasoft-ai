---
name: security-roy
description: "Applies application security practices when writing or reviewing code for frontend and backend (JavaScript, TypeScript, Vue, React, Node, Express): OWASP Top 10:2025, API security, XSS and CSP, authentication, secrets, supply chain. Trigger: a change touches authentication, authorization, user input, database queries, secrets, file uploads, dependencies or HTTP headers, or the user asks 'is this secure', 'security review', 'harden this', 'OWASP', 'XSS', 'SQL injection' or 'audit the dependencies'."
disable-model-invocation: false
argument-hint: "what to secure or review"
---

# /security-roy — Secure by default

You write and review code with the security practices of the official sources cited in `references/`. **You report findings with `file:line`, severity and the fix; you do not silently change code outside the agreed scope.** A change that adds a vulnerability is a blocker.

## When to use / when not

- Use it when a change touches authentication, authorization, user input, queries, secrets, uploads, dependencies, headers or error handling, or when asked to review security.
- Do not use it for infrastructure hardening beyond the repo (cloud accounts, networks) or for penetration testing.

## 1. Detect the stack and the target level

Read `package.json` and the lockfile (framework and version), the auth approach, where user input enters, which database is used and how secrets are loaded. Consult Context7 for the **installed version** before relying on a security API. The verification target is **ASVS L2 by default and L1 as the minimum**; ask once if the data is more sensitive than usual (`references/asvs.md`).

## 2. Route to the right reference

| The change touches | Read |
|---|---|
| Anything (the map of risks) | `references/owasp-top10.md` |
| HTTP endpoints, REST or GraphQL APIs, error responses | `references/api.md` |
| Node or Express servers, cookies, headers, process behavior | `references/node-express.md` |
| Rendering user content, CSP, CORS, CSRF, Vue or React views | `references/frontend.md` |
| Dependencies, lockfile, build and release | `references/supply-chain.md` |
| Choosing how deep to verify | `references/asvs.md` |
| Before closing | `references/checklist.md` |

## 3. Rules for every stack

1. **All external input is untrusted** (users, other services, third-party APIs): validate it at the boundary.
2. **Deny by default** for access: authorization is checked on the server for every request and object.
3. **Parameterize, never concatenate** into queries and commands.
4. **Secrets never live in code, logs or the repo**; they come from the environment or a secret store.
5. **Least privilege** for database accounts, tokens and process permissions.
6. **Do not roll your own crypto or authentication**: use the platform's and the framework's.
7. **Errors do not leak internals** (stack traces, SQL, paths).

## 4. Verify and report

Run the repo's tests and linters, plus `npm audit` (or the repo's equivalent) when dependencies changed. Report findings as `severity · file:line · what · fix`. Say what was not verified (running system, real attackers, infrastructure).

Correct:
```js
// placeholder syntax depends on the driver (here: node-postgres)
const { rows } = await db.query('SELECT id, name FROM users WHERE id = $1', [req.params.id]);
```

Incorrect:
```js
const { rows } = await db.query("SELECT * FROM users WHERE id = " + req.params.id);
```
It fails because user input becomes part of the SQL text (injection), and it selects every column.

## If it fails

If you cannot tell whether something is exploitable, say what you checked and what you could not, and ask; do not label it safe. Never paste a real secret into a message.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Stack, version and ASVS target detected
- [ ] Input validated at the boundary; queries parameterized
- [ ] Authorization enforced server-side; deny by default
- [ ] No secrets in code, logs or the diff; errors do not leak internals
- [ ] Dependencies installed from the lockfile and audited when changed
