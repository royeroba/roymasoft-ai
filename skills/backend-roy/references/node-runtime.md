# Node runtime and production behavior

Last verified: 2026-10-06

## Performance practices (Express production guide)

- Use gzip compression, or do it at the reverse proxy for high-traffic sites.
- Avoid synchronous functions in production: they block the event loop. Use `--trace-sync-io` in development to find them.
- Log with a library: `debug` for debugging and a fast asynchronous logger such as Pino for application activity, not `console.log`.
- Handle exceptions with try/catch for synchronous code and `async`/`await` with proper error handling; do not listen for `uncaughtException`.
- Move CPU-intensive work (image processing, parsing, cryptography) to worker threads, using a pool such as `piscina` rather than a new thread per request.
- Set `NODE_ENV=production`; the guide says it can improve performance by a factor of three.
- Run the latest LTS Node.js, restart automatically with a process manager or init system, run one instance per CPU core (cluster), cache and load-balance behind a reverse proxy.

Source: https://expressjs.com/en/advanced/best-practice-performance.html

## After an uncaught exception

`uncaughtException` is a crude last-resort mechanism and not "On Error Resume Next". After it, the application is in an undefined state and it is not safe to resume. Use the handler only for synchronous cleanup of allocated resources before shutting down, and rely on an external monitor in a separate process to restart the application. Exceptions thrown inside the handler are not caught and the process exits with a non-zero code.

Source: https://nodejs.org/api/process.html

## Twelve-factor principles that apply to services

- Store config in the environment (not in code).
- Treat backing services (databases, queues) as attached resources.
- Run the app as one or more stateless processes.
- Disposability: fast startup and graceful shutdown.
- Treat logs as event streams.
- Keep development, staging and production as similar as possible.

Source: https://12factor.net/

## Event loop and server limits

Never block the event loop with CPU-intensive operations; keep operations asynchronous. Configure server timeouts and socket limits as described in `/security-roy` (`node-express.md`).

Source: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
