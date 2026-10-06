# ASVS: how deep to verify

Last verified: 2026-10-06

## What it is

The OWASP Application Security Verification Standard is an open standard of security requirements for web applications. The current version is 5.0.0 (345 requirements, of which 70 are Level 1), and requirement references use the form `v5.0.0-1.2.5` (version, chapter, section, requirement).

Source: https://owasp.org/www-project-application-security-verification-standard/
Source: https://devguide.owasp.org/en/03-requirements/05-asvs/

## The three levels

- **Level 1:** the bare minimum every application should reach: defense against easy-to-find vulnerabilities in the OWASP Top 10, checkable by tools or manually without source access.
- **Level 2:** recommended for most applications and for those that contain sensitive data that need protection (business-to-business transactions, healthcare data, business-critical functions).
- **Level 3:** the highest level, for high-value, high-assurance or high-safety applications (critical infrastructure, health and safety).

Source: https://devguide.owasp.org/en/03-requirements/05-asvs/

## Plugin policy

- **Default target: Level 2. Minimum: Level 1.**
- Ask once at the start of a security task if the repo handles more sensitive data than usual (payments, health, identity); Level 3 is chosen only by the user.
- Cite the ASVS requirement ID in a finding when one clearly applies; do not invent IDs.

Source: https://devguide.owasp.org/en/03-requirements/05-asvs/
