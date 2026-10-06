# Migrations (schema changes on existing data)

Last verified: 2026-10-06

Limitation: the official PostgreSQL documentation gives locking and index-build principles, not a complete zero-downtime playbook, and this plugin includes no unofficial playbook. Where a step depends on the engine, check its documentation through Context7.

## Locks taken by schema changes

`ALTER TABLE`, `ALTER INDEX`, `DROP TABLE`, `TRUNCATE`, `REINDEX`, `CLUSTER` and `VACUUM FULL` acquire an `ACCESS EXCLUSIVE` lock, which conflicts with every other lock mode and is the only one that blocks a plain `SELECT`. A transaction that needs a conflicting lock waits for it, so a long-running open transaction can make a schema change wait. Keep transactions short and avoid running a migration while long transactions are open.

Source: https://www.postgresql.org/docs/current/explicit-locking.html

## Building indexes on live tables

A normal `CREATE INDEX` blocks writes (not reads) until it finishes. `CREATE INDEX CONCURRENTLY` does not block writes but needs two table scans, takes longer and adds CPU and I/O load. If it fails it leaves an `INVALID` index that is ignored for queries but still costs on writes: drop it and retry, or rebuild with `REINDEX INDEX CONCURRENTLY`. For unique indexes, uniqueness is enforced during the second scan, so a failed build keeps enforcing it.

Source: https://www.postgresql.org/docs/current/sql-createindex.html

## Plugin policy for migrations

These steps are the plugin's own rules, derived from the locking and index-build behavior above, not official documentation:

- Split risky changes into small, separately reversible steps.
- Treat drops, truncates, type changes, renames and bulk deletes as irreversible: ask the user for an explicit yes, state the rollback or backup plan, and first run on a non-production copy.
- Before dropping or renaming a column or table, search the code (CodeGraph, then grep) for its uses and report them.
- Never run a migration against production yourself; give the user the command and what to check.
- Verify with the repo's migration tool on a throwaway database and report the result.

Source: https://www.postgresql.org/docs/current/explicit-locking.html
