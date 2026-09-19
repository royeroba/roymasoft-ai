# Detection tables

Lookup detail for `/onboard-repo`. Read this when you reach the phase that needs it.

---

## Stack — manifests

| Manifest | Gives you |
|---|---|
| `package.json` | runtime deps, dev deps, **scripts**, package manager via the lockfile |
| `pyproject.toml` · `requirements.txt` · `Pipfile` | Python deps and tooling |
| `go.mod` · `Cargo.toml` · `composer.json` · `pom.xml` · `build.gradle` · `*.csproj` · `Gemfile` | language, version, deps |
| lockfile | the actual package manager — `pnpm-lock.yaml` means pnpm, not npm |
| `tsconfig.json` · `.eslintrc*` · `.prettierrc*` · `ruff.toml` · `.editorconfig` | tooling and style config |
| `Dockerfile` · `docker-compose*` · `*.tf` | runtime and infra |

Record **versions as declared**, not as remembered. To know what a version implies, ask Context7.

---

## Testing capability

This decides whether TDD is ever offered in this repository.

### Look for

1. **A framework in the manifest** — vitest, jest, pytest, go test, JUnit, RSpec, xUnit…
2. **Test files that exist** — `**/*.{spec,test}.*`, `test_*.py`, `*_test.go`, `src/test/**`. Count them.
3. **A runner command** — the `test` script, the documented command, or the framework default.
4. **CI running them** — a workflow invoking the runner proves the command works.

### Decide

| Evidence | `available` | Write |
|---|---|---|
| Framework + test files + runnable command | `true` | framework, runner, how you detected it |
| Framework declared, **zero test files** | `false` | the dependency exists, the practice does not |
| Test files, no runner you can name | `unknown` | **ask the human for the command** |
| Nothing | `false` | say so plainly |

**Never invent a test command.** `pnpm test` is a guess unless you saw it in `scripts`.

`tdd.mode` starts at `ask` when `available: true`; omit the block entirely when it is `false`.

---

## Commands

From `scripts`, the Makefile, the CI workflow or the README — **verbatim**. Do not normalize `yarn`
to `npm`. Do not invent a `lint` script that does not exist.

Mark each with where you found it. A command nobody wrote down is `unknown`.

---

## Conventions — two occurrences minimum

One example is a coincidence.

| Convention | Evidence required |
|---|---|
| Naming (files, components, tests) | two paths |
| Layering and boundaries | two imports that respect it |
| Error handling | two call sites |
| Docstring style | two functions |
| State management, data fetching | two usages |

A pattern seen once goes in as an observation, not a rule. A pattern you cannot evidence does not
go in at all.
