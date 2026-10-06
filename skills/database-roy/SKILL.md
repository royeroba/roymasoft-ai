---
name: database-roy
description: "Guides database work for SQL (PostgreSQL as the reference) and NoSQL (MongoDB, DynamoDB, Redis): schema and data modeling, indexes, query performance, transactions, migrations and database security. Trigger: the user asks to design a schema or collection, write or optimize a query, add an index, write a migration, model data, 'this query is slow', 'EXPLAIN', 'add a column', 'drop a table', 'MongoDB', 'DynamoDB', 'Redis', or a change touches database access code."
disable-model-invocation: false
argument-hint: "what to model, query or migrate"
---

# /database-roy — SQL and NoSQL data work

You design, query and change data stores following the official documentation cited in `references/`. **You never run a destructive or irreversible statement without the user's explicit confirmation, and you never connect to a production database on your own.**

## When to use / when not

- Use it whenever schemas, queries, indexes, migrations, transactions or data models are written, changed or reviewed.
- Do not use it for application-level injection or access control beyond the database (that is `/security-roy`) or for general query-builder usage that has nothing to do with the data design.

## 1. Detect (never assume)

Find the engine and version from dependencies (`pg`, an ORM, `mongoose`, an AWS SDK client, `ioredis`), `docker-compose`, config and migration folders. Note whether there is an ORM or query builder and follow it. Consult Context7 for the installed engine or driver version before relying on a feature. If you cannot tell which engine is in use, ask once with closed options.

## 2. Route to the right reference

| Engine or topic | Read |
|---|---|
| SQL design, indexes, plans, transactions, privileges (PostgreSQL as reference) | `references/sql.md` |
| Schema changes on existing data | `references/migrations.md` |
| MongoDB | `references/mongodb.md` |
| DynamoDB | `references/dynamodb.md` |
| Redis | `references/redis.md` |
| Before closing | `references/checklist.md` |

Other relational engines share the principles in `sql.md` but differ in detail: check the engine's own documentation through Context7 before applying a specific command.

## 3. Rules for every engine

1. **Model from the access patterns**: what is read and written together, how often, and how large.
2. **Measure before optimizing**: look at the plan or the profiler on realistic data; do not add indexes by guess.
3. **Parameterize every query** and never build queries from raw user input.
4. **Least privilege**: one account per application, only the permissions it needs, TLS on, no network exposure beyond what is needed.
5. **Irreversible changes are high risk**: drops, truncates, type changes and bulk deletes need the user's explicit yes, a rollback or backup plan and a first run on a non-production copy.
6. **Keep transactions short** and handle retries where the engine requires them.

## 4. Verify

Run the repo's tests and migrations against a local or throwaway database (see `/testing-roy`), and report the commands and results. Say what you could not verify (real data volume, production load, replication).

Correct:
```sql
BEGIN;
EXPLAIN ANALYZE UPDATE orders SET status = 'archived' WHERE created_at < $1;
ROLLBACK;
```

Incorrect:
```sql
EXPLAIN ANALYZE UPDATE orders SET status = 'archived' WHERE created_at < now() - interval '1 year';
```
It fails because `EXPLAIN ANALYZE` actually runs the update and nothing rolls it back.

## If it fails

If the engine, the data volume or the access pattern is unknown, ask; do not guess an index or a model. If a statement could lose data, stop and ask.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Engine, version and the repo's data layer detected
- [ ] Model and indexes follow the real access patterns and were measured
- [ ] Queries parameterized; account privileges minimal
- [ ] Irreversible steps confirmed by the user, with a rollback plan
- [ ] Tests or migrations run on a non-production database and reported
