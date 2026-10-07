# Security checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a blocker; an item already unmet in the base is a warning.

- [ ] User input and data from third-party APIs are validated at the boundary (type, size, format) before use.
- [ ] Every database query and command is parameterized; no string concatenation with external data.
- [ ] Authorization is enforced on the server for each request and each object or property, denying by default.
- [ ] No secret, token or private key appears in the code, config files, logs or the diff; secrets come from the environment or a secret store.
- [ ] Error responses do not leak stack traces, queries, file paths or internal identifiers.
- [ ] Cookies set `Secure`, `HttpOnly` and `SameSite`; security headers (HSTS, CSP, frame and MIME protections) are present for web responses.
- [ ] User content is never rendered as raw HTML, a template, a style or an event handler without sanitization.
- [ ] Sensitive endpoints and business flows have rate or size limits.
- [ ] Dependencies come from the lockfile (`npm ci`), were audited when changed, and no unexpected package was added.
- [ ] After an uncaught exception the process logs, cleans up and exits; it never resumes.
- [ ] Passwords and secret comparisons use the platform's crypto (`scrypt`, `timingSafeEqual`), not custom code.
- [ ] A new feature that accepts input, changes access or stores sensitive data has its trust boundaries named and its abuse cases covered by a test or acceptance criterion.
- [ ] The ASVS target level (default L2, minimum L1) was stated and what was not verified was reported.
