---
name: typescript-roy
description: "Guides writing and reviewing TypeScript with a strict, type-safe style: tsconfig strictness, avoiding any, narrowing unknown, error handling, exports and naming. Trigger: the user asks to write, type, refactor or review TypeScript, 'add types', 'fix this type error', 'enable strict', 'tsconfig', 'remove any', 'type this API response', or a change adds or edits .ts or .tsx files."
disable-model-invocation: false
argument-hint: "what to type, or the tsconfig/type error to fix"
---

# /typescript-roy — Strict, type-safe TypeScript

You write TypeScript that the compiler can verify. **The repo's own configuration and conventions come first**: you do not flip compiler flags or reformat the codebase on your own, and you do not copy a whole style guide (the linter and `tsconfig` enforce style).

## When to use / when not

- Use it whenever TypeScript is written, typed, refactored or reviewed, or when `tsconfig.json` is discussed.
- Do not use it for framework idioms (React or Vue rules belong to `/frontend-roy` once it exists) or for runtime security (that is `/security-roy`).

## 1. Detect (never assume)

Read `tsconfig.json` (and any `extends`), the installed TypeScript version, the lint config (ESLint and typescript-eslint if present) and the typecheck script. Run the repo's typecheck (for example `tsc --noEmit`) **before** changing anything so you know the baseline. Consult Context7 for the installed version before relying on a compiler option or an API.

## 2. Route to the right reference

| Need | Read |
|---|---|
| Compiler flags, strictness, migrating a project | `references/tsconfig.md` |
| Types, exports, naming, errors, disallowed features | `references/style.md` |
| Before closing | `references/checklist.md` |

## 3. Rules for every project

1. **Convention precedence:** the repo's established convention wins (for example default exports required by a framework); the guide applies where the repo has none.
2. **No `any`.** Use a specific type, or `unknown` and narrow it before use. If `any` is unavoidable, say why in a comment.
3. **Assertions need a reason.** Prefer a runtime check or a type guard over `as`.
4. **Validate external data at the boundary** (API responses, JSON, environment): the type system does not check it at runtime.
5. **Errors:** throw only `Error` instances; type caught values as `unknown` and narrow them.
6. **Strictness changes are the user's decision.** Report the gap in one line and propose an incremental plan; do not enable flags silently.

## 4. Verify

Run the typecheck and the repo's lint after the change and report both results. If the typecheck was already failing in the base, report that separately and do not fix it unless asked.

Correct:
```ts
interface User { id: string; name: string }

function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null
    && typeof (value as Record<string, unknown>).id === 'string'
    && typeof (value as Record<string, unknown>).name === 'string';
}

const data: unknown = await response.json();
if (!isUser(data)) throw new Error('Unexpected user payload');
```

Incorrect:
```ts
const data: any = await response.json();
const user = data as User;
```
It fails because `any` switches checking off and the assertion claims a shape nobody verified.

## If it fails

If the compiler output is large or unclear, show the first errors and the count, and ask before a broad refactor. Never silence an error with `any`, `@ts-ignore` or a looser flag to make it pass.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Baseline typecheck run before changing; repo conventions followed
- [ ] No new `any`; external data validated; assertions justified
- [ ] Errors thrown as `Error` and caught as `unknown`
- [ ] No compiler flag changed without the user's decision
- [ ] Typecheck and lint run after the change and reported
