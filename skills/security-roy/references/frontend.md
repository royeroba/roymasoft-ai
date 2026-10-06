# Frontend security

Last verified: 2026-10-06

## Vue's official rules

- **Never use non-trusted templates:** user-provided content must never become a component template (it is arbitrary code execution).
- Text interpolation and attribute bindings are escaped by Vue; the danger is in the escape hatches.
- **Avoid `v-html` and `innerHTML` with untrusted content.** Use them only for HTML verified as safe, or isolate user content in a sandboxed iframe.
- **URLs:** sanitize URLs on the backend before saving them; a frontend library such as `sanitize-url` is an extra safeguard.
- **Style injection:** do not render user-provided CSS in `<style>`; use object syntax with allow-listed properties.
- **JavaScript injection:** never bind user content to event handlers and never render `<script>` elements.
- Coordinate CSRF protection with the backend and submit tokens with forms.
- For React, the same rules apply to its raw-HTML escape hatch; check the installed version's docs through Context7.

Source: https://vuejs.org/guide/best-practices/security.html

## Content Security Policy and Trusted Types

A strict CSP based on nonces or hashes mitigates XSS: use a nonce-based strict CSP when the server renders the HTML, and a hash-based one when the HTML is static or cached (for example a single-page application). Trusted Types limit dangerous DOM APIs to special typed objects, so the only places that can introduce DOM XSS are the policies you define.

Source: https://web.dev/articles/strict-csp
Source: https://web.dev/trusted-types/

## HTTP defenses (MDN guides)

- Redirect HTTP to HTTPS, use HSTS and a secure TLS configuration; load active and passive resources over HTTPS.
- Control framing against clickjacking and protect against CSRF with tokens or verification.
- Set cookies as restrictively as possible (`Secure`, `HttpOnly`, `SameSite`).
- Define cross-origin access with proper CORS headers, use Cross-Origin Resource Policy, set a Referrer-Policy and verify third-party resources with Subresource Integrity.
- Set correct MIME types and implement a Content Security Policy.

Source: https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides
