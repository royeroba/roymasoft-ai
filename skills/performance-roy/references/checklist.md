# Performance checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] A user-visible metric and a target were named before any code was changed.
- [ ] A baseline was measured and recorded (command or tool, data used, number).
- [ ] The measurement used realistic data volume, not a toy dataset.
- [ ] The bottleneck was located with a profiler, trace or query plan, not assumed.
- [ ] Only one change was applied per measurement.
- [ ] The result was re-measured in the same way and compared with the baseline.
- [ ] A change that did not improve the metric was reverted, not kept "just in case".
- [ ] For web pages, field data was considered and thresholds were checked at the 75th percentile.
- [ ] For SQL, `EXPLAIN ANALYZE` on data-modifying statements ran inside a transaction that was rolled back.
- [ ] The related tests ran and behavior did not change.
- [ ] The report states before, after and what the measurement cannot show.
