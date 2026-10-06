# TypeScript style (Google TypeScript Style Guide)

Last verified: 2026-10-06

The repo's own convention and linter win; apply these rules where the repo has none and in new code. Do not restate the whole guide: the linter enforces most of it.

## The `any` and `unknown` types

Avoid `any`: it undermines the value of static types. Prefer a specific interface or type alias, or `unknown` for values whose type is genuinely unclear, and narrow with a type guard before dereferencing. If `any` is necessary, suppress the lint warning with a comment explaining why.

Source: https://google.github.io/styleguide/tsguide.html

## Type assertions

Use `as` syntax, not angle brackets. Avoid assertions without a clear reason and explain in a comment why they are safe. Prefer runtime checks (`instanceof`, truthiness, type guards) over assertions.

Source: https://google.github.io/styleguide/tsguide.html

## Interfaces, aliases and enums

Use interfaces for object types and reserve type aliases for unions, primitives and tuples. Do not use `const enum`; use a plain `enum`, and do not convert enum values to booleans implicitly.

Source: https://google.github.io/styleguide/tsguide.html

## Exports

Use named exports only; default exports give no canonical name, which makes central maintenance difficult. Do not export mutable bindings (`export let`). If the framework requires default exports (some route or component conventions), follow the framework and say so.

Source: https://google.github.io/styleguide/tsguide.html

## Null and undefined

Type aliases must not include `|null` or `|undefined`; add nullability at the usage site. Prefer optional fields (`field?: Type`) over `|undefined` unions.

Source: https://google.github.io/styleguide/tsguide.html

## Errors

Always `new Error()`, and throw only `Error` instances (or subclasses), never strings or arbitrary values. Catch as `unknown` and narrow. An empty `catch` needs a comment explaining why it is appropriate.

Source: https://google.github.io/styleguide/tsguide.html

## Naming

`UpperCamelCase` for classes and interfaces, `lowerCamelCase` for variables, functions and properties, `CONSTANT_CASE` only for module-level and static constants. Avoid abbreviations except universal ones (URL, ID).

Source: https://google.github.io/styleguide/tsguide.html

## Disallowed features

Wrapper objects (`new String()`, `new Boolean()`, `new Number()`), reliance on automatic semicolon insertion, the `namespace` keyword (use modules), `with`, dynamic code evaluation (`eval`, `Function(string)`), non-standard ECMAScript features, modifying built-in prototypes and `debugger` statements in production code.

Source: https://google.github.io/styleguide/tsguide.html
