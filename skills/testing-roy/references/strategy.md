# Testing strategy

Last verified: 2026-10-06

Applies to any stack. Facts below come from the cited pages; where a rule is the plugin's own decision it says so.

## Test sizes

Small tests run in a single process. Medium tests can span multiple processes but only reach `localhost`. Large tests remove the `localhost` restriction and can span machines. Use the size to decide what a test may touch.

Source: https://abseil.io/resources/swe-book/html/ch11.html

## Pyramid shape, not a fixed ratio

Both Google sources keep the pyramid shape: most tests narrow-scoped, fewer integration tests, very few end-to-end tests. They give different mixes (the book aims for around 80% narrow, 15% medium and 5% end-to-end; the Testing Blog says 70/20/10) and the blog adds that the exact mix differs for each team. **Plugin decision:** keep the shape and never impose a ratio.

Source: https://abseil.io/resources/swe-book/html/ch11.html
Source: https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html

## Flakiness

At Google the flaky rate hovers around 0.15%, and as it approaches 1% the tests begin to lose value. Treat a flaky test as a defect: find the cause (shared state, time, network, ordering) rather than adding retries or sleeps.

Source: https://abseil.io/resources/swe-book/html/ch11.html

## The Beyonce Rule

"If you liked it, then you shoulda put a test on it": test everything you do not want to break. When a change touches behavior that has no test, add one before or with the change.

Source: https://abseil.io/resources/swe-book/html/ch11.html

## Push tests down, remove duplicates

Write many small, fast tests and a minimal set of high-level ones. If a lower-level test already covers a behavior, delete the redundant higher-level test. One test per condition, and test observable behavior instead of coupling to implementation details. Skip trivial getters and setters.

Source: https://martinfowler.com/articles/practical-test-pyramid.html

## End-to-end tests are expensive

End-to-end tests are slow and prone to flakiness: keep only the critical user journeys there and cover the rest lower in the pyramid.

Source: https://martinfowler.com/articles/practical-test-pyramid.html
Source: https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
