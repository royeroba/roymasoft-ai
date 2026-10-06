# Node and Express security

Last verified: 2026-10-06

## Official Node.js practices

- **Denial of service:** handle socket errors, put a reverse proxy in front, configure `headersTimeout`, `requestTimeout`, `timeout` and `keepAliveTimeout`, and limit open sockets with `agent.maxSockets`, `agent.maxTotalSockets` and `agent.maxFreeSockets`.
- **Timing attacks:** compare secrets with `crypto.timingSafeEqual()` and use `crypto.scrypt()` for passwords; do not branch on secrets.
- **Prototype pollution:** avoid insecure recursive merges, validate external JSON against a schema, use `Object.create(null)` where fitting, and check ownership with `Object.hasOwn(obj, key)`.
- **Never run the inspector in production** and never use the `insecureHTTPParser` option.
- **Permission model:** the `--permission` flag restricts file system, network, child process and native addon access, which limits the damage of a malicious dependency.
- **Avoid experimental features in production.**

Source: https://nodejs.org/en/learn/getting-started/security-best-practices

## Official Express practices

- Do not use deprecated or vulnerable Express versions; keep it current.
- Use TLS, do not trust user input, and validate URLs before `res.redirect()` to prevent open redirects.
- Use Helmet for security headers; disable `X-Powered-By` and set custom 404 and error handlers.
- Cookies: generic names and the `secure`, `httpOnly`, `domain`, `path` and `expires` options.
- Prevent brute force with rate limiting by user and IP.
- Run `npm audit` and watch the GitHub Advisory Database.
- Use parameterized queries, sanitize input against XSS and command injection, and check regular expressions for ReDoS (for example with `safe-regex`).

Source: https://expressjs.com/en/advanced/best-practice-security.html

## OWASP Node.js cheat sheet

- Never block the event loop with CPU-heavy work.
- Set `httpOnly`, `Secure` and `SameSite` on session cookies and deploy Helmet for HSTS, CSP, `X-Frame-Options` and `X-Content-Type-Options`.
- Avoid `eval()` and unsanitized `child_process.exec()` or `fs` paths; enable `eslint-plugin-security`.
- Prefer async/await over deep callback nesting for reliable error handling.
- Use CSRF tokens (the `csurf` package is deprecated: use a maintained approach).
- Where this page and the Node.js process documentation differ on `uncaughtException`, the Node.js documentation wins: log, clean up and exit; never resume.

Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
Source: https://nodejs.org/api/process.html
