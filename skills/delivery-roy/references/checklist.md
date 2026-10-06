# Delivery checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The existing Dockerfile, CI system and Node version were detected and the repo's structure was followed.
- [ ] Base images are pinned (exact version or digest), not `latest`.
- [ ] Dependencies install from the lockfile (`npm ci`), and package manifests are copied before the application code.
- [ ] The image uses a multi-stage build and the final stage runs as a non-root user.
- [ ] The container starts Node directly in `CMD` (or through an init process), so termination signals reach it.
- [ ] `.dockerignore` excludes `.env`, `.git` and local artifacts; no secret is copied into an image layer.
- [ ] Workflows set the default `GITHUB_TOKEN` permission to read-only and raise it per job only where needed.
- [ ] Third-party actions are pinned to a full commit SHA from the official repository.
- [ ] Untrusted input (titles, branch names, comments) is passed through environment variables, never interpolated into `run:` commands.
- [ ] No real credential appears in a Dockerfile or workflow; secrets come from the secret store or OIDC.
- [ ] CI runs the tests and the dependency audit on every pull request.
- [ ] Nothing was built, pushed, triggered or deployed without the user's request; unverified items were stated.
