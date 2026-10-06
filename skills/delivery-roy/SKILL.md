---
name: delivery-roy
description: "Guides building and reviewing delivery configuration: Dockerfiles, container setup for Node.js, CI pipelines and GitHub Actions workflows, with secure, reproducible and least-privilege defaults. Trigger: the user asks to write or change a Dockerfile, docker-compose file, CI pipeline or GitHub Actions workflow, 'containerize this', 'add CI', 'run tests in CI', 'deploy workflow', 'pin the actions', or a change edits Dockerfile, .dockerignore or .github/workflows files."
disable-model-invocation: false
argument-hint: "the Dockerfile, pipeline or workflow to write or review"
---

# /delivery-roy — Secure, reproducible delivery

You write and review container and pipeline configuration with the official guidance cited in `references/`. **You never deploy, push images, trigger workflows or change production settings on your own**, and you do not run a build unless the user asks (the rules' "Build" paragraph).

## When to use / when not

- Use it whenever a Dockerfile, compose file, CI pipeline or GitHub Actions workflow is written, changed or reviewed.
- Do not use it for dependency rules (that is `/security-roy`, `supply-chain.md`), application runtime behavior (that is `/backend-roy`) or cloud infrastructure beyond the repo.

## 1. Detect (never assume)

Find the existing `Dockerfile`, `.dockerignore`, `docker-compose*`, the CI system (`.github/workflows`, GitLab CI or another) and the Node version in use (`.nvmrc`, `engines`, the current base image). Follow the repo's existing structure and naming. Consult Context7 for the versions in use (Node, the base image's tooling, the major version of each action) before relying on a feature or an option. For a CI system other than GitHub Actions, apply the principles and check that system's documentation through Context7.

## 2. Route to the right reference

| Need | Read |
|---|---|
| Dockerfile, images, containers for Node.js | `references/docker.md` |
| CI pipelines, GitHub Actions, secrets, tokens | `references/ci.md` |
| Before closing | `references/checklist.md` |

## 3. Rules for every pipeline and image

1. **Reproducible**: pinned versions, lockfile installs (`npm ci`), and the same steps in CI as locally.
2. **Least privilege**: containers run as a non-root user; CI tokens get only the permissions each job needs.
3. **No secrets in images, logs or the repo**: they come from the CI secret store or the environment at runtime.
4. **Immutable references**: pin base images and third-party actions to a digest or commit SHA.
5. **Small and single-purpose**: multi-stage builds and one concern per container.
6. **Verified in CI**: build, tests and dependency audit run automatically on every change.

## 4. Verify

Read the result against `references/checklist.md`. Do not run `docker build` or trigger a workflow unless asked; if you can only verify by running it, ask first. Say what was not verified (the real build, the registry push, the deployment).

Correct:
```dockerfile
FROM node:<exact-version> AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:<exact-version>
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package*.json ./
RUN npm ci --omit=dev
USER node
CMD ["node", "dist/server.js"]
```

Incorrect:
```dockerfile
FROM node:latest
COPY . .
RUN npm install
CMD npm start
```
It fails because the base image is unpinned, dependencies are not reproducible, everything runs as root, and `npm start` swallows termination signals.

## If it fails

If the Node version, the registry or the deployment target is unknown, ask; do not invent them. Never put a real credential in a Dockerfile or workflow file, not even temporarily.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Base images and actions pinned; installs from the lockfile
- [ ] Non-root user; minimal token permissions
- [ ] No secret in the image, the workflow file or the logs
- [ ] Untrusted input is never interpolated into shell commands
- [ ] Nothing built, pushed, triggered or deployed without the user's yes
