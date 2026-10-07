# OWASP Top 10:2025 as a map of risks

Last verified: 2026-10-06

The ten categories in order. Each line says what to check in code; the check is derived from the cited official pages. Edition changes versus 2021: A03 and A10 are new, A07 and A09 were renamed, SSRF was merged into A01 and Security Misconfiguration moved up to #2.

Source: https://top10.owasp.org/2025/
Source: https://top10.owasp.org/2025/0x00_2025-Introduction/

## A01 Broken Access Control (includes SSRF)

Check authorization on the server for every request and every object, deny by default, and validate user-supplied URIs before the server fetches them.

Source: https://api-security.owasp.org/editions/2023/en/0x11-t10

## A02 Security Misconfiguration

Set security headers, remove default accounts and unused features, hide fingerprinting such as `X-Powered-By`, and use custom error handlers.

Source: https://expressjs.com/en/advanced/best-practice-security.html

## A03 Software Supply Chain Failures

Install from the lockfile, pin versions, audit dependencies and review `package.json` for typos. See `supply-chain.md`.

Source: https://nodejs.org/en/learn/getting-started/security-best-practices

## A04 Cryptographic Failures

Use TLS for data in transit, use `crypto.timingSafeEqual()` for secret comparisons and `crypto.scrypt()` for password hashing and comparison, and do not write your own crypto.

Source: https://nodejs.org/en/learn/getting-started/security-best-practices
Source: https://expressjs.com/en/advanced/best-practice-security.html

## A05 Injection

Parameterize queries; keep SQL structure separate from data. Escape output for its context, and avoid `eval()` and `child_process.exec()` with unsanitized input.

Source: https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html
Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html

## A06 Insecure Design

Design controls in, not on: limit request sizes, rate-limit sensitive and business flows, and apply least privilege from the start.

For a new feature that accepts input, changes access or stores sensitive data, name its trust boundaries first and run STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege) over each one. Write abuse cases (a way to use the feature that the implementer did not expect) next to the use cases and cover each with a test or an acceptance criterion.

Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
Source: https://api-security.owasp.org/editions/2023/en/0x11-t10
Source: https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html
Source: https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html

## A07 Authentication Failures

Block brute force by user and IP address and track failed attempts over time; use secure cookie flags and generic cookie names; do not hand-roll sessions.

Source: https://expressjs.com/en/advanced/best-practice-security.html

## A08 Software or Data Integrity Failures

Verify what you install and build: lockfiles with integrity, `npm ci`, signed provenance for builds (see SLSA in `supply-chain.md`).

Source: https://slsa.dev/spec/v1.0/levels

## A09 Security Logging and Alerting Failures

Log application activity with a logging library (for example Pino) and keep secrets and personal data out of logs; alert on failures that need a human.

Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
Source: https://sre.google/sre-book/monitoring-distributed-systems/

## A10 Mishandling of Exceptional Conditions

Handle errors explicitly and without leaking details. After an `uncaughtException` the process is in an undefined state: do synchronous cleanup, log and exit, never resume; let an external supervisor restart it. Attach `error` listeners to event emitters.

Source: https://nodejs.org/api/process.html
Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
