# Code style

Load when: writing or reviewing code.

The repository's existing conventions win over everything here. Cite the occurrences you matched
before following them — and before claiming something *is* the convention, show two.

---

## The four

**SOLID** — one reason to change per unit. Depend on the abstraction the codebase already uses, not
on a new one you introduce for this change.

**DRY** — remove duplication of *knowledge*, not of *characters*. Two functions that look alike but
change for different reasons are not duplication; merging them couples two decisions that should
move independently.

**KISS** — the simplest thing that satisfies the requirement and its tests. No speculative
extension points, no configuration for a case nobody asked for.

**Clean Code** — names that state intent, functions that do one thing, no surprise side effects,
errors handled where they can be handled.

### Applied, not recited

Never justify a change by naming a principle. Name the concrete consequence.

❌ "This violates SRP."
✅ "`saveUser` also sends the welcome email, so a caller that only wants to persist a user triggers
a network call it cannot opt out of — and the test has to mock the mailer."

---

## Comments: none

The code explains itself. If you feel the need to write a comment explaining *what* the code does,
the code is wrong — rename, extract, or restructure instead.

Delete on sight: commented-out code · section banners (`// ---- helpers ----`) · restatements
(`// increment counter`) · changelog notes (`// added by X`) · TODOs without an owner and a reason.

### The one narrow exception

A comment that records **why**, when the *why* is genuinely not recoverable from the code:

```ts
// Stripe returns 200 with an error body on duplicate idempotency keys (as of 2024-11),
// so a status check alone would report success. See STRIPE-4412.
```

Legitimate cases: a workaround for a third-party bug · a business rule that looks wrong but is
correct · a non-obvious performance constraint with a measurement behind it.

If you cannot name the external fact the reader is missing, it is not this exception. Rewrite the
code instead.

---

## Docstrings: on signatures, in the stack's native syntax

Public functions, methods and DTOs carry structured documentation on the signature — parameters and
return. Nothing else.

| Stack | Syntax |
|---|---|
| JavaScript / TypeScript | JSDoc — `@param`, `@returns`, `@throws` |
| Python | Docstring with `Args:` / `Returns:` / `Raises:` — match the repo's style (Google, NumPy, reST) |
| Kotlin | KDoc — `@param`, `@return` |
| Java | Javadoc |
| Go | Doc comment above the declaration, starting with the identifier name |
| C# | XML doc — `<summary>`, `<param>`, `<returns>` |
| PHP | PHPDoc |
| Ruby | YARD — `@param`, `@return` |
| Rust | `///` doc comment |

**Same intent, native syntax.** Never write JSDoc in a Python file.

```ts
/**
 * Streams a CSV export for the given filters.
 *
 * @param filters - Already-validated report filters.
 * @param signal - Aborts the underlying query when cancelled.
 * @returns A readable stream of UTF-8 CSV rows, header included.
 * @throws {ExportTooLargeError} When the filter set exceeds the row budget.
 */
```

### What a docstring is not for

Not a place to restate the body. Not a place to describe the algorithm. Document the **contract**:
what the caller must pass, what they get back, what can go wrong, and any constraint they cannot
see from the types.

If the types already say it, do not repeat it in prose. `@param userId - The user id` earns nothing.

---

## Current APIs

Use Context7 before relying on a library's shape. Do not recall an API from memory — versions move,
and a confidently wrong signature costs more than a lookup.

When you cannot verify a library's current API, say so and ask, rather than writing code against a
remembered version.

---

## Size

Keep each change the smallest coherent behaviour, with its tests and docs alongside. A step that
needs more than 30–50 lines usually contains two steps.

Never split artificially to hit a number, and never delete blank lines, docstrings or tests to look
smaller. If the correct solution is genuinely larger, say why in one line and continue.
