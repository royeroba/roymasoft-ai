# MongoDB

Last verified: 2026-10-06

## Data modeling

Data that is accessed together should be stored together: structure the model on the application's access patterns. Embed related data in one document when it is read together (fewer reads, better performance); reference it from another collection for one-to-many and many-to-many relationships, or when it is accessed less often or independently. The flexible schema lets documents vary, but unbounded arrays (arrays that grow without limit) are an anti-pattern. Combine unique indexes and schema validation to enforce the design.

Source: https://www.mongodb.com/docs/manual/data-modeling/
Source: https://www.mongodb.com/docs/manual/applications/indexes/

## Indexes

Build indexes from the application's real queries and index frequently accessed fields on large datasets. MongoDB typically uses one index per query (each clause of an `$or` may use its own). For compound indexes follow the ESR guideline: Equality fields first, then Sort, then Range. Indexes speed reads but cost on writes and memory: weigh the read-to-write ratio, drop unused indexes and profile on production-representative data.

Source: https://www.mongodb.com/docs/manual/applications/indexes/

## Query input

Inferred from the "validate input at the boundary" rule of `/security-roy`: check that user input is the expected primitive type before using it in a filter, so that an object such as `{ "$ne": null }` cannot change what the query means.

Source: https://www.mongodb.com/docs/manual/administration/security-checklist/

## Security checklist (self-managed deployments)

- Enable access control (SCRAM by default, or X.509, LDAP, Kerberos) and apply least-privilege roles.
- Use TLS for all connections and encryption at rest (or client-side field-level encryption for sensitive fields).
- Limit network exposure: trusted network, firewall, `net.bindIp`, no direct root SSH.
- Enable auditing where available (Enterprise) and run MongoDB under a dedicated OS user.
- Disable server-side JavaScript if unused (`--noscripting`), which disables `mapReduce`, `$where`, `$accumulator` and `$function`.
- Monitor CVE alerts, patch regularly, rotate database users and review network policy so the instance never becomes internet-exposed.

Source: https://www.mongodb.com/docs/manual/administration/security-checklist/
