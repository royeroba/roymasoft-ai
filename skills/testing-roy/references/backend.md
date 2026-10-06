# Backend testing (services, APIs, databases)

Last verified: 2026-10-06

Detect the repo's runner and follow it; this page does not change it.

## Levels for services

- **Unit tests:** cover the public interface and non-trivial code paths with dependencies isolated. Skip trivial getters and setters.
- **Integration tests:** test one integration point at a time (database, external API, filesystem). They are slower than unit tests but give real-world confidence.
- **Contract tests:** consumer-driven contracts keep service interfaces compatible.
- **End-to-end tests:** a minimal set for the critical user journeys.

Source: https://martinfowler.com/articles/practical-test-pyramid.html

## Databases and other real dependencies

Test repository code by starting a database, connecting the application, triggering writes and checking the data; test your own repository methods, not trivial ORM behavior. Testcontainers gives lightweight, throwaway instances of common databases (PostgreSQL, MongoDB, Redis and others) in Docker, created and destroyed around the tests, so tests run against real service instances instead of manual mocks. It requires a Docker runtime.

Source: https://martinfowler.com/articles/practical-test-pyramid.html
Source: https://node.testcontainers.org/

## External services

Stub the external service locally with canned responses that match the real API contract, and pair the stubs with contract tests so they stay in sync with the real API.

Source: https://martinfowler.com/articles/practical-test-pyramid.html

## Contract tests with Pact

Contract testing checks each application in isolation against a shared contract. With Pact the consumer drives the contract: it is generated during the consumer's tests, only the paths actually used are tested, and the provider verifies it. It is most valuable with several services. Provider-only contract testing does not ensure that consumers call correctly.

Source: https://docs.pact.io/

## Node's built-in runner

`node:test` offers `describe`/`it`, subtests, mocking of functions, methods, modules and timers, snapshot testing, code coverage, watch mode, randomized order (`--test-randomize`) and sharding. Use it only if the repo already does or the user asks; otherwise follow the repo's runner.

Source: https://nodejs.org/api/test.html
