---
name: backend-roy
description: "Guides building and reviewing backend services in Node.js: HTTP API design, error responses, runtime behavior, configuration, logging and observability. Trigger: the user asks to create or change an endpoint, route, middleware or service, 'REST API', 'Express', 'pagination', 'error handling', 'graceful shutdown', 'logging', 'monitoring', 'metrics', 'tracing', 'OpenTelemetry', or a change edits server-side Node code."
disable-model-invocation: false
argument-hint: "the endpoint, service or problem"
---

# /backend-roy — Robust, observable services

You build and review backend code with the official guidance cited in `references/`. **The repo's framework, existing API conventions and tooling come first**; you do not swap frameworks or add monitoring vendors on your own.

## When to use / when not

- Use it whenever endpoints, middleware, services, process behavior, configuration or observability are written or reviewed.
- Do not use it for database design (that is `/database-roy`), authentication and injection hardening (that is `/security-roy`) or containers and pipelines (that is `/delivery-roy` once it exists).

## 1. Detect (never assume)

Read `package.json` and the lockfile for the runtime and framework (Node, Express, Fastify, Nest) and their **installed versions**, the existing routes and error format, the logging library, the config approach and any tracing or metrics already in place. Consult Context7 for the installed version before relying on an API. Follow the existing API style; use the references only where the repo has no convention.

## 2. Route to the right reference

| Need | Read |
|---|---|
| New or changed HTTP endpoints, errors, pagination, versioning | `references/api-design.md` |
| Event loop, process lifecycle, configuration, production setup | `references/node-runtime.md` |
| Logs, metrics, traces, alerts | `references/observability.md` |
| Before closing | `references/checklist.md` |

## 3. Rules for every service

1. **Never block the event loop**: no synchronous APIs or CPU-heavy work in request handlers; offload CPU work to worker threads.
2. **Validate at the boundary** and return errors in one consistent, safe format that does not leak internals.
3. **After an uncaught exception, log, clean up and exit; never resume.** A supervisor restarts the process.
4. **Configuration comes from the environment**, not from code; processes are stateless.
5. **Logs are events on stdout**, structured, without secrets or personal data.
6. **Observe symptoms users feel**: latency, traffic, errors and saturation.

## 4. Verify

Run the repo's tests, lint and typecheck, and report the results. Call the endpoint locally when it is cheap and safe, and say what was not verified (production load, real traffic, the supervisor setup).

Correct:
```js
app.get('/reports/:id', async (req, res, next) => {
  try {
    const report = await fs.promises.readFile(pathFor(req.params.id), 'utf8');
    res.type('text/plain').send(report);
  } catch (err) {
    next(err);
  }
});
```

Incorrect:
```js
app.get('/reports/:id', (req, res) => {
  res.send(fs.readFileSync('/reports/' + req.params.id));
});
```
It fails because the synchronous read blocks the event loop for every client, errors are unhandled, and the path is built from user input.

## If it fails

If you cannot tell the framework, the error format or the deployment model, ask; do not invent a convention. Never add a process-level handler that keeps the server running after an unknown error.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Runtime, framework, versions and existing API conventions detected
- [ ] No synchronous or CPU-heavy work in handlers; async errors handled
- [ ] Input validated; errors consistent and free of internals
- [ ] No resuming after an uncaught exception
- [ ] Config from the environment; structured logs without secrets
