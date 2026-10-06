# TypeScript checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The baseline typecheck was run before the change and the result was reported (pre-existing errors listed separately).
- [ ] The repo's conventions (exports, naming, lint rules) were followed where they exist.
- [ ] No new `any`; where `any` is unavoidable, a comment explains why.
- [ ] External data (API responses, JSON, environment) is validated at the boundary, not only asserted.
- [ ] Every new type assertion has a comment or is replaced by a type guard or runtime check.
- [ ] Errors are thrown as `Error` instances and caught as `unknown` and narrowed; no empty `catch` without a reason.
- [ ] Object types use interfaces; type aliases are used for unions, primitives and tuples; no `const enum`.
- [ ] Nullability is added at the usage site, not baked into type aliases.
- [ ] No compiler flag or `tsconfig` option was changed without the user's decision.
- [ ] No `@ts-ignore`, `eval` or other disallowed feature was added to make the code pass.
- [ ] The typecheck and the lint were run after the change and both results were reported.
