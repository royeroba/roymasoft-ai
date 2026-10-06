# Redis

Last verified: 2026-10-06

## Security model

Redis is designed to be accessed by trusted clients inside trusted environments. Do not expose the instance directly to the internet or to untrusted clients: untrusted access must be mediated by an application layer that implements access control, validates input and decides which operations to run. Deny the Redis port to everybody except the application servers (firewall, or `bind 127.0.0.1`); a single `FLUSHALL` from an outside attacker deletes the whole data set. Since version 3.2.0, protected mode replies only to loopback clients when the default configuration has no password.

Source: https://redis.io/docs/latest/operate/oss_and_stack/management/security/

## Authentication and TLS

Use Access Control Lists (Redis 6 and later): named users with fine-grained permissions. The legacy `requirepass` password is shared by all clients and must be long. The `AUTH` command and all traffic are unencrypted without TLS, so enable TLS on client connections, replication and the cluster bus. Renaming commands with `rename-command` is deprecated; restrict commands with ACL rules.

Source: https://redis.io/docs/latest/operate/oss_and_stack/management/security/

## Input and code security

The Redis protocol has no string escaping, so injection is not possible with a normal client library; do not compose the body of a Lua script from untrusted strings. Pathological inputs can still cause worst-case algorithmic cost (denial of service), so limit what external clients can send. Restrict the `CONFIG` command, because it can change the working directory and dump file name and so write files to arbitrary paths. Run Redis as an unprivileged `redis` user, not root.

Source: https://redis.io/docs/latest/operate/oss_and_stack/management/security/
