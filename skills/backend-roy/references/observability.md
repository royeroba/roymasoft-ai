# Observability

Last verified: 2026-10-06

## The four golden signals

Monitor at least these four for any user-facing service:

- **Latency:** time to serve a request; distinguish successful from failed requests.
- **Traffic:** demand on the system (for example requests per second).
- **Errors:** rate of failed requests, explicit or implicit.
- **Saturation:** how full the service is, focusing on its most constrained resource.

Source: https://sre.google/sre-book/monitoring-distributed-systems/

## Alerting

Page a human only for an urgent, actionable condition that is affecting users now or imminently; alert on symptoms rather than causes for user-facing systems; avoid alert fatigue. Use metrics for monitoring and alerting (histograms capture tail latency), logs for debugging and after-the-fact analysis, and dashboards for sub-critical issues.

Source: https://sre.google/sre-book/monitoring-distributed-systems/

## Signals with OpenTelemetry

OpenTelemetry's supported signals are traces (the path of a request through the application), metrics (a measurement captured at runtime), logs (a recording of an event) and baggage (contextual information passed between signals); signals correlate so the same occurrence can be examined from several angles. Profiles and events were in development when this page was checked: verify their current status before relying on them.

Source: https://opentelemetry.io/docs/concepts/signals/

## Working rules

- Use the instrumentation and logging library the repo already has; do not add a vendor or an agent without asking.
- Write structured logs to stdout with a request or trace identifier; never log secrets, tokens or personal data.
- Record latency as a histogram, not only an average.
- Define an alert only with a user-visible symptom and a named action for the person paged.

Source: https://sre.google/sre-book/monitoring-distributed-systems/
