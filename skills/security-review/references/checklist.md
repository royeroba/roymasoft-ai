# Security checklist

Lookup detail for `/security-review`. Read the half that matches what you are reviewing.

A finding is only a finding if you can describe **the attack**.

---

## Backend

### Injection

| Kind | Look for | Real fix |
|---|---|---|
| **SQL** | Concatenation or template literals in a query; `WHERE ${x}`; dynamic `ORDER BY` | Parameterized queries. For identifiers, an allowlist — bind variables cannot bind column names |
| **Command** | `exec`, `system`, `shell=True`, backticks with any user-derived value | Argument arrays, never a shell string. Allowlist the command |
| **Path traversal** | User input joined into a filesystem path | Resolve, then verify the result is inside the allowed root. Stripping `..` is not enough |
| **Template / SSTI** | User input rendered as a template rather than as data | Pass as data. Never compile user input |
| **NoSQL** | A user-controlled object reaching a query — `{ $ne: null }` | Validate types before querying; reject operators in user input |
| **Deserialization** | `pickle`, `yaml.load`, `unserialize` on untrusted bytes | Safe loaders only |

### Authorization

The most common real vulnerability, and the least visible in a diff.

- Is the check present on **every** path to the resource, including the "internal" one?
- Is it the **right** check? Authentication proves who; authorization proves whether they may.
- **IDOR** — does the handler verify the record belongs to the caller, or trust the id in the request?
- **Mass assignment** — does an update spread the whole request body into the record?
- A diff that adds a route, a query param or a field widens the surface: its authz needs review.

### Secrets and data

Hardcoded keys · secrets in logs or error messages · secrets in URLs or query strings · PII in
logs · verbose errors leaking stack traces or schema to the client.

---

## Frontend

| Kind | Look for | Fix |
|---|---|---|
| **XSS** | `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `eval`, `new Function` with user-derived input | Render as text. If HTML is required, sanitize with a maintained library and name it |
| **Open redirect** | Redirect target from a query param | Allowlist of destinations |
| **postMessage** | Handler that does not check `event.origin` | Check the origin, always |
| **Secrets in the bundle** | An API key in client code, or in a non-public env var | It is public. Move it server-side |
| **Third-party scripts** | `<script src>` to a domain you do not control | Pin with SRI, or self-host |
| **Storage** | Tokens in `localStorage`, reachable by any script on the page | Prefer httpOnly cookies; know the trade-off |

Framework escaping rules change between versions. **Check current behaviour with Context7** rather
than recalling what was true two majors ago.

---

## Severity

By **exploitability and impact**, not by category name.

| | |
|---|---|
| 🔴 | Exploitable now, real impact |
| 🟡 | Requires a precondition, or bounded impact |
| 🟢 | Hardening |
