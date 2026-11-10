---
name: browser-test-roy
description: "Tests in the browser that a feature or user story (HU) works, using the Playwright MCP by default and Claude in Chrome when the test needs the user's signed-in session, with a fallback between the two. Trigger: the user asks 'run the e2e tests', 'let's test it in the browser', 'verify it works in the browser', 'test the feature/the story' or 'test what we just did'. Starts the server if it is not running, walks through the acceptance criteria, reports the evidence in the chat and cleans up what it left."
disable-model-invocation: false
argument-hint: "feature or story to test (optional: if omitted, what we just did)"
---

# /browser-test-roy — Test in the browser

Live verification with the Playwright MCP or Claude in Chrome (section 2 says which). **It does not write test
files in the repo, does not commit and does not touch the code under test.** The evidence is shown in the chat and,
with Playwright, also kept in a git-ignored folder.

## 1. What is tested

Source of the criteria, in this order: what the user indicated → the story's criteria if one was passed →
what we just did in the session (diff and conversation).

List the criteria as a checklist, each with its test step and the expected observable result (text, URL,
state). If it is not clear what must be met, **do not invent it**: "I'm not clear on X. Give me more
context." with closed options.

## 2. Prepare

- **Pick the tool** and say which one in one line before acting. Default: **Playwright MCP** (clean, isolated
  browser, evidence in `.playwright-mcp/`). Use **Claude in Chrome** (`mcp__claude-in-chrome__*`) only when the
  test needs the user's already signed-in session or their extensions, or when the user asks for it.
- **Fallback.** Switch to the other tool only when the chosen one is unavailable: its tools are missing, it
  cannot connect (Chrome extension not connected) or it dies mid-run. Say so in one line and resume from the
  criterion in progress; the page state is lost. A feature or selector failure never triggers the switch (see
  section 5). If neither tool responds, say so and report what could not be verified; never invent a result.
- Playwright tools are deferred: load them with a **single** `ToolSearch`
  (`select:mcp__plugin_playwright_playwright__browser_navigate,…_browser_snapshot,…_browser_click,…_browser_type,…_browser_fill_form,…_browser_take_screenshot,…_browser_console_messages,…_browser_network_requests,…_browser_wait_for,…_browser_close`).
- Chrome tools are deferred too: read the `chrome-browser` skill first if the environment provides it, then load what you need with a
  **single** `ToolSearch` (`select:mcp__claude-in-chrome__tabs_context_mcp,…__navigate,…__read_page,…__find,…__computer,…__read_console_messages,…__read_network_requests,…__tabs_create_mcp,…__tabs_close_mcp`). Work in a new tab, not in the user's open ones.
- **Server.** Find out how it is started and at which URL from the repo (`package.json` scripts, README,
  `.claude/launch.json`); do not assume it. If you cannot determine it, ask.
  Check whether it already responds (e.g. `curl -sI <url>`). If not, start it in the background and wait for it to
  respond before continuing. Note whether you started it: only that one do you shut down at the end.
- Local test URL by default. If the environment is not local (staging, production), confirm with the user
  before operating and do not create or delete real data without their go-ahead.

## 3. Execute

- Act with `browser_snapshot` (accessibility), not with screenshots. With Chrome, `read_page` and `find` play that role.
- Per criterion: action → observable result → explicit assertion against what was expected.
- After each flow, check `browser_console_messages` (level `error`) and `browser_network_requests` (relevant
  4xx/5xx). With Chrome: `read_console_messages` (errors only) and `read_network_requests`.
- **Credentials.** If a login appears or anything that asks for credentials: **stop**. Say "Enter the credentials in the browser window and let me know so I can continue." Do not type them, do not look them up and do not read cookies or storage. When they are back, confirm the session is active before continuing (Playwright: `browser_snapshot`; Chrome: `read_page`). With Chrome, use the session that is already signed in; if a login still appears, the same stop applies.

## 4. Evidence: shown in the chat, and with Playwright also saved git-ignored

**Playwright.** The MCP only writes inside the repo (workspace root and `.playwright-mcp/`); a path outside gives "outside allowed roots". That is why the evidence lives in `.playwright-mcp/`, git-ignored, and is kept.

- **Playwright, before the first capture:** if `.playwright-mcp/` is not ignored (`git check-ignore .playwright-mcp`), add it to `.git/info/exclude` (local to this clone; it touches neither the repo's `.gitignore` nor the history).
- **Playwright screenshots:** `browser_take_screenshot` with `filename` = `.playwright-mcp/e2e-<YYYYMMDD-HHmm>/NN-<criterion>.png`, one per key criterion. Without `filename` the MCP also saves them in that folder, but with a timestamp name.
- **Showing Playwright screenshots to the user:** with `filename` the image does not arrive inline. When done, send the screenshots with `SendUserFile` (`display: "render"`); without that the user does not see them.
- **Chrome evidence.** Chrome cannot write to `.playwright-mcp/`: take the screenshots with `computer` (`screenshot`) so they show inline in the chat, and state in the table "no evidence folder on disk" for that run.
- Console and network: without `filename`, so they come back as text.
- Report a table: criterion · ✅/❌ · what was observed, and the path of the evidence folder.
- Final verdict: "Meets N of M criteria", and what you **could not** verify.
- If every criterion passed, the work has a Jira key and Playwright left screenshots on disk, offer in **one line**: "Shall I leave this evidence in the Jira ticket?". Run `/ticket-evidence-roy` only if they accept.

## 5. Failures

A failure is reported as is, with the evidence. Do not change the feature or the test to make it pass and do not
fix code unless the user asks. Tell a feature failure from a test failure (selector,
timing); if it is a timing one, retry once and say so.

## 6. Close (always, also if it failed)

1. Playwright: `browser_close`. Chrome: close only the tab you opened with `tabs_close_mcp`, never the user's own tabs.
2. Shut down the server only if you started it.
3. **Do not delete `.playwright-mcp/`**: it is the evidence. Tell the user they can delete it whenever they want; it is not part of the repo.
