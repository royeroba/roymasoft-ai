# Database checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The engine, its version and the repo's data layer (ORM, query builder, migration tool) were detected and followed.
- [ ] The data model or schema follows the real access patterns, stated in the change.
- [ ] Each new or changed index is justified by a real query and was measured (`EXPLAIN`, profiler or equivalent).
- [ ] Every query is parameterized; no user input is concatenated into SQL, filters or scripts.
- [ ] User input used in a NoSQL filter is checked for its expected type and shape.
- [ ] The application's database account has only the permissions it needs, and connections use TLS.
- [ ] Transactions are short, make no network calls inside, and retry where the isolation level requires it.
- [ ] `EXPLAIN ANALYZE` on a data-modifying statement was wrapped in a transaction that is rolled back.
- [ ] Migrations are split into small reversible steps; indexes on live tables use the engine's non-blocking option.
- [ ] Any drop, truncate, type change, rename or bulk delete has the user's explicit confirmation and a rollback or backup plan.
- [ ] Uses of a dropped or renamed column, table or key were searched in the code and reported.
- [ ] Nothing was run against a production database; tests and migrations ran on a throwaway database and the results were reported.
