# Backend checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The runtime, framework, versions and the repo's existing API conventions were detected and followed.
- [ ] Handlers use no synchronous filesystem, crypto or parsing calls and no CPU-heavy loops; heavy work is offloaded.
- [ ] Async errors are caught and passed to the error handler; there is no unhandled promise rejection path.
- [ ] Input is validated at the boundary and oversized or unknown input is rejected.
- [ ] Errors use one consistent format (problem details where the repo has none) and expose no stack traces, queries or paths.
- [ ] List endpoints are paginated; a change is backward compatible or explicitly versioned.
- [ ] No handler keeps the process running after an uncaught exception: it logs, cleans up and exits.
- [ ] Configuration is read from the environment; no secret or environment-specific value is hardcoded.
- [ ] Shutdown is graceful: in-flight requests finish and connections close on the termination signal.
- [ ] Logs are structured, go to stdout, carry a request identifier and contain no secrets or personal data.
- [ ] New alerts are based on user-visible symptoms; latency is recorded as a histogram.
- [ ] Tests, lint and typecheck were run and reported; unverified items (production load, supervisor) were stated.
