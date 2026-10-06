# tsconfig strictness

Last verified: 2026-10-06

## What `strict` enables

`strict` turns on a family of checks that give stronger correctness guarantees: `alwaysStrict`, `noImplicitAny`, `noImplicitThis`, `strictBindCallApply`, `strictBuiltinIteratorReturn`, `strictFunctionTypes`, `strictNullChecks`, `strictPropertyInitialization` and `useUnknownInCatchVariables`. Future TypeScript versions may add stricter checks under `strict`, so a compiler upgrade can surface new errors.

Source: https://www.typescriptlang.org/tsconfig/#strict

## Recommended flags beyond `strict`

- `exactOptionalPropertyTypes`: an optional property cannot be set to `undefined` explicitly.
- `noImplicitOverride`: requires the `override` keyword when a subclass overrides a method.
- `noPropertyAccessFromIndexSignature`: requires bracket notation for index-signature properties.
- `noUncheckedIndexedAccess`: adds `undefined` to values read through an index signature.
- `verbatimModuleSyntax`: keeps imports and exports exactly as written, so type-only imports are explicit.

Source: https://www.typescriptlang.org/tsconfig/#strict

## Plugin policy for flags

- **New project or new package:** propose `strict` plus the five extra flags above.
- **Existing project:** never change flags silently. Run the typecheck, report how many errors the flag would add and propose an incremental plan (one flag at a time, or per folder with project references). The user decides.
- **Upgrading TypeScript:** run the typecheck on the new version before and after, and report new errors separately from yours.
- Never use `@ts-ignore`, a looser flag or `any` to make a flag pass.

Source: https://www.typescriptlang.org/tsconfig/#strict
