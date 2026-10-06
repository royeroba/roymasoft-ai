# SQL (PostgreSQL as the reference)

Last verified: 2026-10-06

Details below are from the PostgreSQL documentation; for another relational engine check its own docs first.

## Index types

B-tree is the default and covers equality, ranges and sorted retrieval (`<`, `<=`, `=`, `>=`, `>`, `BETWEEN`, `IN`, `IS NULL`); `LIKE` and `~` use it only when the pattern is anchored at the start. Hash covers equality only. GiST and SP-GiST fit geometric and non-balanced structures, full-text and nearest-neighbor searches. GIN fits multi-component values such as arrays and full text. BRIN fits very large tables whose column values correlate with the physical order. Choose from the operators the queries actually use.

Source: https://www.postgresql.org/docs/current/indexes-types.html

## Reading plans with EXPLAIN

`EXPLAIN` shows the plan with estimated costs and rows. `EXPLAIN ANALYZE` actually executes the query and adds real times, row counts and `Buffers`; compare estimated rows with actual rows. Because it runs the statement, wrap data-modifying statements in `BEGIN; … ROLLBACK;`. Statistics are samples, results on small tables do not extrapolate to large ones, and `LIMIT` distorts estimated costs. `EXPLAIN (FORMAT JSON)` gives machine-readable output.

Source: https://www.postgresql.org/docs/current/using-explain.html

## Transactions and isolation

Read Committed is the default: each command sees the data committed when it starts. Repeatable Read gives the whole transaction one snapshot and prevents dirty, nonrepeatable and phantom reads but still allows serialization anomalies. Serializable also prevents those. Repeatable Read and Serializable can fail with `SQLSTATE 40001` (serialization failure): abort the transaction and retry it from the beginning. Read-only transactions never have serialization conflicts. Choose the lowest level that preserves correctness.

Source: https://www.postgresql.org/docs/current/transaction-iso.html

## Locks and long transactions

A transaction that needs a conflicting lock waits until it is released, and holding transactions open for long periods (for example while waiting for user input) is a bad idea. Keep transactions short and do not do network calls inside them.

Source: https://www.postgresql.org/docs/current/explicit-locking.html

## Injection and privileges

Prevent SQL injection with parameterized queries (SQL structure separated from data), and make sure parameterization happens on the server side rather than by client-side string building. Apply least privilege at database, table, column and row level; use one account per application; avoid superuser accounts; require encrypted connections (TLS 1.2 or later); keep the database on an internal network segment; remove default accounts; keep security patches current; and encrypt and protect backups.

Source: https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html
Source: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html
