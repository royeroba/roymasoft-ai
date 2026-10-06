# Supply chain

Last verified: 2026-10-06

## Dependencies (Node.js official)

- Pin dependency versions and use lockfiles for direct and transitive dependencies.
- Install with `npm ci` for deterministic installs; use `--ignore-scripts` (or the `ignore-scripts` config) to stop arbitrary install scripts.
- Automate vulnerability checks with `npm audit` and run them in CI.
- npm has a `min-release-age` config (in days) that installs only versions published before that age. Check that the installed npm supports it before relying on it.
- Review `package.json` for typosquatting and be careful with maintainers' and lockfile changes.
- Do not publish sensitive files: use `npm publish --dry-run`, `.npmignore` and the `files` allowlist.

Source: https://nodejs.org/en/learn/getting-started/security-best-practices
Source: https://docs.npmjs.com/cli/v11/using-npm/config

## Build provenance (SLSA)

SLSA build levels: L0 gives no guarantees; L1 means the artifact has provenance (it may be unsigned); L2 means builds run on a hosted platform with signed provenance, preventing tampering after the build; L3 hardens the build so runs cannot influence each other and signing credentials are isolated from user-defined steps.

Source: https://slsa.dev/spec/v1.0/levels

## Secure development process (NIST SSDF)

The SSDF (SP 800-218, version 1.1) groups practices into: Prepare the Organization, Protect the Software, Produce Well-Secured Software and Respond to Vulnerabilities. Use the groups as a lens for the release process, not as a code checklist.

Source: https://csrc.nist.gov/projects/ssdf

## CI and containers

Hardening of GitHub Actions workflows and Dockerfiles lives in `/delivery-roy`; keep dependency rules here and pipeline rules there.

Source: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
