# API security

Last verified: 2026-10-06

For HTTP APIs of any kind. Each item maps to the OWASP API Security Top 10 (2023).

## The ten API risks

- **API1 Broken Object Level Authorization:** endpoints that take object IDs must check that the caller may access that object.
- **API2 Broken Authentication:** authentication mechanisms and tokens must be implemented correctly.
- **API3 Broken Object Property Level Authorization:** check authorization per property, not only per object (no mass assignment, no excess data exposure).
- **API4 Unrestricted Resource Consumption:** limit request size, rate and cost; unbounded use leads to denial of service or higher cost.
- **API5 Broken Function Level Authorization:** check roles and groups for each function, not only at the UI.
- **API6 Unrestricted Access to Sensitive Business Flows:** protect flows such as buying a ticket or posting a comment from automated abuse.
- **API7 Server Side Request Forgery:** validate any user-supplied URI before fetching it.
- **API8 Security Misconfiguration:** review complex configuration, headers, CORS and error behavior.
- **API9 Improper Inventory Management:** keep documentation and API versions current; retire old versions.
- **API10 Unsafe Consumption of APIs:** treat data from third-party APIs with the same distrust as user input.

Source: https://api-security.owasp.org/editions/2023/en/0x11-t10

## Error responses

Return errors as problem details (`application/problem+json`) with `type`, `title`, `status`, `detail` and `instance`. Keep `detail` focused on resolution, avoid exposing sensitive implementation details through error messages, and let clients ignore unknown extension members.

Source: https://www.rfc-editor.org/rfc/rfc9457.html

## Request limits and input

Restrict the request body size per content type, validate input at the boundary and protect against HTTP parameter pollution. Server timeouts and socket limits are in `node-express.md`.

Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
