# Shared connectors: sweep the official ones, never stop at the first

Used by `create-pr-roy` (GitHub, Jira), `consult-ticket-roy` (Jira), `consult-figma-roy` (Figma) and `consult-docs-roy` (Notion, Google Drive, Docs, Gmail). It is not a skill.

Last verified: 2026-10-09

## 1. Sweep

1. **Find candidates.** A single `ToolSearch` per service with several keywords (table in section 3), plus the shell check where there is one (`gh auth status`). Do not assume tool names: use what comes back.
2. **Keep only official ones** (section 2). A connected server that is not official is not used, even if it works: say which one you ignored and why.
3. **Try them in the table's order** with one cheap read-only identity call (for example `get_me`, `atlassianUserInfo`, `whoami`, `notion-get-self`, a profile or "recent files" call). The first one that answers is the one you use; say which.
4. **A failure is not a stop.** If one asks for authentication, errors or lacks the operation you need, note it in one line and try the next. Never ask the user to do anything while candidates remain.
5. **Only when all fail**, go to section 4 with a single message that lists what you tried and why each failed.

Never ask for tokens, passwords, codes or callback URLs, and never write them to a file: authentication is done by the user (`/mcp`, the claude.ai connector settings or the official CLI login).

## 2. What counts as official

A server is official when one of these holds:

- It comes from a plugin of Anthropic's marketplaces (`claude-plugins-official`, or Anthropic's knowledge-work plugins such as `engineering` or `design`) that points to the vendor's own server.
- It is a connector from the claude.ai connectors directory (in the desktop app their tool names may carry an id instead of a name; the server's own instructions name the vendor).
- It is an MCP the user added by hand whose URL is the vendor's official endpoint in section 3 (check it with `claude mcp get <name>` if in doubt).
- It is the vendor's official CLI (`gh`).

If you cannot establish where a server comes from, ask before using it, with closed options.

## 3. Official sources per service

Source: https://github.com/anthropics/claude-plugins-official

| Service | Official, in order of preference | ToolSearch keywords | Excluded |
|---|---|---|---|
| GitHub | GitHub MCP (`github@claude-plugins-official`, `https://api.githubcopilot.com/mcp/`); GitKraken MCP (`gitkraken@claude-plugins-official`, has `pull_request_create`); `gh` CLI; the claude.ai GitHub connector only if it exposes PR creation | `pull request create`, `github`, `gitkraken` | Community GitHub MCPs |
| Jira | Atlassian Rovo MCP (`https://mcp.atlassian.com/...`) through the `atlassian@claude-plugins-official` plugin, the claude.ai Atlassian connector or a manual `claude mcp add` | `jira issue`, `atlassian` | `sooperset/mcp-atlassian` and other community servers |
| Figma | Figma remote MCP (`https://mcp.figma.com/mcp`) through `figma@claude-plugins-official` or the claude.ai Figma connector; Figma desktop MCP (local, from the Figma app) | `figma`, `design context` | Framelink (`Figma-Context-MCP`) and other community servers |
| Notion | Notion MCP (`https://mcp.notion.com/mcp`) through `notion@claude-plugins-official` (by Notion) or the claude.ai Notion connector | `notion` | Community servers; the local `@notionhq/notion-mcp-server` is not suggested (it needs an integration token) |
| Google Drive, Docs, Gmail | The claude.ai Google Drive and Gmail connectors; Google's Workspace MCP servers (developer preview: they need a Google Cloud project and OAuth set up by the user, so only as an advanced option) | `google drive`, `drive file`, `gmail` | `google_workspace_mcp` and other community servers |

## 4. None connected: suggest the most adequate and secure

One message, one recommended option per missing service, with the reason (official, OAuth in the browser, no token in a config file):

- If a `suggest_connectors` or `search_mcp_registry` tool exists (desktop app), use it to show the official connector to connect.
- Desktop or web app: the claude.ai connector (Settings → Connectors) for Atlassian, Figma, Notion, Google Drive and Gmail.
- CLI: `claude plugin install <name>@claude-plugins-official` (`atlassian`, `figma`, `notion`, `github`) and then `/mcp` to sign in. For GitHub PRs the simplest secure option is `gh auth login`, run by the user (browser OAuth, no token in files).

Then offer the manual fallback of the calling skill (paste the text, screenshots or the PR body) so the work is not blocked.

Sources: https://support.atlassian.com/rovo/docs/getting-started-with-the-atlassian-remote-mcp-server/ · https://developers.figma.com/docs/figma-mcp-server/remote-server-installation · https://developers.notion.com/guides/mcp/overview · https://developers.google.com/workspace/guides/configure-mcp-servers · https://cli.github.com/manual/gh_auth_login
