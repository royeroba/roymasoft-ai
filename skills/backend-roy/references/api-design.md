# HTTP API design

Last verified: 2026-10-06

Follow the repo's existing API style first. Where it has none, use these references.

## Google API Improvement Proposals (AIPs)

The AIPs summarize Google's API design decisions and can be adopted as a framework for your own rules. The general AIPs relevant to HTTP APIs, by number and title:

- Resource-oriented design: 121 (design), 122 (resource names), 123 (resource types).
- Standard methods: 130 (methods), 131 (Get), 132 (List), 133 (Create), 134 (Update), 135 (Delete).
- 151 Long-running operations, 155 Request identification, 158 Pagination, 160 Filtering, 161 Field masks.
- 180 Backwards compatibility, 181 Stability levels, 185 API versioning.
- 193 Errors.

Open the specific AIP before designing that part (for example AIP-158 before adding a list endpoint); do not invent rules from the title alone.

Source: https://google.aip.dev/general

## Error responses

Return errors as problem details (`application/problem+json`) with `type`, `title`, `status`, `detail` and `instance`. The `status` is advisory (the real response status wins), `title` stays the same across occurrences, `detail` explains this occurrence and focuses on resolution, and extension members may be added (clients must ignore unknown ones). Prefer registered problem types, use absolute URIs for `type` and `instance`, and never expose sensitive implementation details.

Source: https://www.rfc-editor.org/rfc/rfc9457.html

## Security of the API surface

Check each endpoint against the OWASP API Security Top 10 (object-level and function-level authorization, resource consumption limits, unsafe consumption of third-party APIs). See `/security-roy`.

Source: https://api-security.owasp.org/editions/2023/en/0x11-t10

## Working rules

- Use the repo's routing, validation and error-handling patterns; add a new endpoint the way the existing ones are written.
- Validate input at the boundary; reject unknown or oversized input.
- Make list endpoints paginated by design and document how clients resume.
- Keep changes backward compatible, or version them; say which one a change is.
- State which behavior is idempotent and how a client retries safely.

Source: https://google.aip.dev/general
