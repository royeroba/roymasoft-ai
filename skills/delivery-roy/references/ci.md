# CI and GitHub Actions

Last verified: 2026-10-06

## GitHub's official hardening guidance

- **Secrets:** store sensitive data only as GitHub secrets, never as plaintext in a workflow. Mask any sensitive value that is not a secret (`::add-mask::VALUE`), register generated sensitive values (such as JWTs) as secrets so they are redacted, rotate secrets periodically and audit their use.
- **`GITHUB_TOKEN` least privilege:** set the default permission to read-only for repository contents and raise permissions only for the specific jobs that need them.
- **Pin actions to a full-length commit SHA:** it is the only way to use an action as an immutable release. Verify the SHA comes from the official repository and not a fork, and audit the action's source code.
- **Script injection:** prefer an action over an inline script, and pass untrusted input (such as an issue title or a branch name) through an environment variable rather than interpolating it directly into a shell command.
- **Third-party actions:** audit their source for how they handle secrets and which hosts they reach.
- **OpenID Connect:** use OIDC for cloud authentication instead of long-lived secrets; it gives short-lived, scoped tokens.
- **Self-hosted runners:** avoid them for public repositories, prefer just-in-time runners and keep sensitive information off the runner machine.

Source: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions

## What the pipeline should verify

- Run tests on every commit and pull request; use sharding and parallelism to keep them fast (Playwright's guidance).
- Install with `npm ci` and run `npm audit` automatically in CI (Node.js security guidance).
- Build and test container images in CI (Docker's guidance).

Source: https://playwright.dev/docs/best-practices
Source: https://nodejs.org/en/learn/getting-started/security-best-practices

## Twelve-factor principles for delivery

Strictly separate the build, release and run stages; keep development, staging and production as similar as possible; run admin and management tasks as one-off processes; keep config in the environment.

Source: https://12factor.net/

## Plugin rules

These are the plugin's own rules, derived from the guidance above:

- Do not trigger, re-run or cancel a workflow, and do not push to a registry, without the user's request.
- Never write a real credential into a workflow file; reference the secret store or OIDC.
- Do not add a deployment step to a workflow unless the user asks, and say which environment it targets.

Source: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
