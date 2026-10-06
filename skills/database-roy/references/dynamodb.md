# DynamoDB

Last verified: 2026-10-06

## Design from the access patterns

DynamoDB's best-practices guide starts from NoSQL design: list the access patterns first (what is read and written, with which keys and how often), then choose partition keys, sort keys and secondary indexes. The guide has dedicated pages for sort keys, secondary indexes, large items and attributes (store large payloads in S3 and keep a pointer), time series, many-to-many relationships (adjacency lists), querying versus scanning, table design, concurrent updates (version control) and bulk operations. Open the matching page before designing that part.

Source: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html

## Partition keys and throughput

Design for uniform activity across all partition keys in the table and its secondary indexes. Every partition delivers at most 3,000 read units per second and 1,000 write units per second; item size counts (a 20 KB item consumes 5 read units per consistent read). A key that concentrates traffic becomes a hot partition. Use write sharding to spread writes across keys, and spread bulk uploads. These limits are service quotas that can change: check the current documentation before depending on a number.

Source: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html

## Query and scan

Before using `Scan` on a large table, read the querying and scanning best-practices page and prefer access patterns that `Query` can serve with the table's or an index's keys.

Source: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html
