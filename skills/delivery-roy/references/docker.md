# Docker for Node.js

Last verified: 2026-10-06

## Docker's official build practices

- Base images: start from current official images, pin versions to a specific digest for supply-chain integrity and use a minimal base that matches the requirements to reduce vulnerabilities.
- Multi-stage builds: split the Dockerfile into stages to reduce the final image size, and reuse base stages.
- If a service can run without privileges, use `USER` to switch to a non-root user.
- Use `.dockerignore` to exclude irrelevant files from the build context; prefer `COPY` over `ADD`.
- Put `apt-get update` and `apt-get install` in the same `RUN` to avoid stale cache layers.
- Limit each container to a single concern and keep containers ephemeral (stopped and replaced with minimal setup).
- Rebuild images regularly with `--pull` (and `--no-cache` when needed) to pick up fresh dependencies, and build and test images in CI/CD.

Source: https://docs.docker.com/build/building/best-practices/

## Node.js specifics (official Node.js Docker guide)

- Run as the unprivileged `node` user instead of root.
- Set `NODE_ENV=production`.
- Node.js was not designed to run as PID 1 and will not handle signals such as SIGINT properly: use an init process (`--init`, Tini).
- Put the start command directly in `CMD` so that `SIGTERM` and `SIGINT` reach the Node process; running it through `npm` swallows exit signals.
- Restrict memory consumption with the container's memory flags to avoid excessive use on shared hosts.
- Use multi-stage builds so package managers do not end up in the final image.
- Use `npm ci` instead of `npm install` for reproducible builds, and copy `package*.json` before the application code to benefit from layer caching.
- Specify exact Node.js versions rather than generic tags.
- Alpine images need build tools (such as python3, make and g++) for native dependencies: choose the base from the project's dependencies; the plugin does not prescribe Alpine.

Source: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md

## Plugin rules

These are the plugin's own rules, derived from the principles above:

- Never `COPY` a `.env` file or bake a secret into an image layer; list such files in `.dockerignore` and pass configuration at runtime.
- Never write a real credential in a Dockerfile, even in a build argument.
- Do not build or push the image without the user's request.

Source: https://docs.docker.com/build/building/best-practices/
