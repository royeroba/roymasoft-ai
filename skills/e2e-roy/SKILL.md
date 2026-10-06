---
name: e2e-roy
description: "Tests in the browser that a feature or user story (HU) works, using the Playwright MCP. Trigger: the user asks 'run the e2e tests', 'let's test it in the browser', 'verify it works in the browser', 'test the feature/the story' or 'test what we just did'. Starts the server if it is not running, walks through the acceptance criteria, reports the evidence in the chat and cleans up what it left."
disable-model-invocation: false
argument-hint: "feature or story to test (optional: if omitted, what we just did)"
---

# /e2e-roy — Test in the browser

Live verification with the Playwright MCP. **It does not write test files in the repo, does not commit and
does not touch the code under test.** The evidence is kept in a git-ignored folder and shown in the chat.

## 1. What is tested

Source of the criteria, in this order: what the user indicated → the story's criteria if one was passed →
what we just did in the session (diff and conversation).

List the criteria as a checklist, each with its test step and the expected observable result (text, URL,
state). If it is not clear what must be met, **do not invent it**: "I'm not clear on X. Give me more
context." with closed options.

## 2. Prepare

- Playwright tools are deferred: load them with a **single** `ToolSearch`
  (`select:mcp__plugin_playwright_playwright__browser_navigate,…_browser_snapshot,…_browser_click,…_browser_type,…_browser_fill_form,…_browser_take_screenshot,…_browser_console_messages,…_browser_network_requests,…_browser_wait_for,…_browser_close`).
- **Server.** Find out how it is started and at which URL from the repo (`package.json` scripts, README,
  `.claude/launch.json`); do not assume it. If you cannot determine it, ask.
  Check whether it already responds (e.g. `curl -sI <url>`). If not, start it in the background and wait for it to
  respond before continuing. Note whether you started it: only that one do you shut down at the end.
- Local test URL by default. If the environment is not local (staging, production), confirm with the user
  before operating and do not create or delete real data without their go-ahead.

## 3. Execute

- Act with `browser_snapshot` (accessibility), not with screenshots.
- Per criterion: action → observable result → explicit assertion against what was expected.
- After each flow, check `browser_console_messages` (level `error`) and `browser_network_requests` (relevant
  4xx/5xx).
- **Credentials.** If a login appears or anything that asks for credentials: **stop**. Say "Enter the credentials in the browser window and let me know so I can continue." Do not type them, do not look them up and do not read cookies or storage. When they are back, take a `browser_snapshot` and confirm the session is active before continuing.

## 4. Evidence: saved git-ignored and shown in the chat

The MCP only writes inside the repo (workspace root and `.playwright-mcp/`); a path outside gives "outside allowed roots". That is why the evidence lives in `.playwright-mcp/`, git-ignored, and is kept.

- **Before the first capture:** if `.playwright-mcp/` is not ignored (`git check-ignore .playwright-mcp`), add it to `.git/info/exclude` (local to this clone; it touches neither the repo's `.gitignore` nor the history).
- **Screenshots:** `browser_take_screenshot` with `filename` = `.playwright-mcp/e2e-<YYYYMMDD-HHmm>/NN-<criterion>.png`, one per key criterion. Without `filename` the MCP also saves them in that folder, but with a timestamp name.
- **Showing them to the user:** with `filename` the image does not arrive inline. When done, send the screenshots with `SendUserFile` (`display: "render"`); without that the user does not see them.
- Console and network: without `filename`, so they come back as text.
- Report a table: criterion · ✅/❌ · what was observed, and the path of the evidence folder.
- Final verdict: "Meets N of M criteria", and what you **could not** verify.

## 5. Failures

A failure is reported as is, with the evidence. Do not change the feature or the test to make it pass and do not
fix code unless the user asks. Tell a feature failure from a test failure (selector,
timing); if it is a timing one, retry once and say so.

## 6. Close (always, also if it failed)

1. `browser_close`.
2. Shut down the server only if you started it.
3. **Do not delete `.playwright-mcp/`**: it is the evidence. Tell the user they can delete it whenever they want; it is not part of the repo.
