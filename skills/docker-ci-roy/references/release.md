# Release and deploy

Last verified: 2026-11-09

Scope: this reference helps you write, review and check a release plan. The plugin never deploys, tags, promotes or rolls back on its own; the user runs those steps.

## Separate build, release and run

A release is a build combined with its config. It gets a unique identifier and is immutable, so a change means a new release. Rolling back is redeploying an earlier release, which is why every release must stay available and deployable. Keep the build, release and run stages strictly separate.

Source: https://12factor.net/build-release-run

## Automated, repeatable releases

Google's release engineering practice asks for self-service releases, hermetic builds (the same inputs give the same output) and automation that enforces review and approved sources, so a release does not depend on one person's memory or machine.

Source: https://sre.google/sre-book/release-engineering/

## Roll out gradually and decide the rollback first

A canary is a partial, time-limited deployment of a change together with an evaluation of it. Choose the metrics to compare and the thresholds that mean "roll back" before the rollout starts, not while watching it.

Source: https://sre.google/workbook/canarying-releases/

## Make schema changes reversible: expand, then contract

Parallel change splits an incompatible change into expand (add the new next to the old), migrate (move the callers) and contract (remove the old). Each step is deployable and reversible on its own, so the code can roll back without a database rollback. Engine specifics (locks, concurrent index builds) are in `../../database-roy/references/migrations.md`.

Source: https://martinfowler.com/bliki/ParallelChange.html

## Separate deploy from release with flags

Release toggles let code ship switched off, be turned on later and be turned off again without a redeploy. Keep them short-lived: remove the flag and its dead branch once the rollout is done.

Source: https://martinfowler.com/articles/feature-toggles.html

## Plan to write (plugin rules)

These are the plugin's own rules, derived from the guidance above. Thresholds, environments and owners are the user's: ask, never invent numbers.

Before the deploy:

- Tests and the dependency audit pass in CI on the exact commit that will ship.
- The release is one identified artifact (tag, image digest or build id) that can be redeployed later.
- Migrations follow expand-then-contract and ran on a non-production copy.
- Flags and config for the new code exist in every target environment.
- The rollback command or the previous release id is written down, with who runs it.
- Rollback triggers are numbers the user confirmed (error rate, latency, a named critical flow).

During the deploy:

- Deploy to staging first and run a smoke test: a few critical user flows against the deployed environment, not the whole suite.
- Roll out gradually when the platform supports it, holding at each step for the agreed time.
- Watch the metrics named in the triggers; if one trips, roll back first and investigate after.

After the deploy:

- Metrics are back to baseline for the agreed time and the smoke test passes in production.
- The changelog or release notes are updated and the people who depend on the change were told.
- Temporary flags and old compatibility code have a removal ticket or date.

Source: https://sre.google/workbook/canarying-releases/
