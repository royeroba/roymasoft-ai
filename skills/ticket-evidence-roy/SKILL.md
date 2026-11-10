---
name: ticket-evidence-roy
description: "Posts a short, plain-language comment with 3 or 4 screenshots on a Jira ticket once the work is finished and tested, so QA and non-technical people can see the ticket was done and meets its acceptance criteria. Trigger: the user asks to 'leave the evidence in the ticket', 'comment on the Jira ticket', 'upload the screenshots to the ticket', 'post the test results in Jira' or 'document in the ticket that it works'. Never publishes without the user's yes and never claims success that was not observed."
disable-model-invocation: false
argument-hint: "Ticket key or URL (optional: if omitted, the ticket we just worked on)"
---

# /ticket-evidence-roy — Evidence in the Jira ticket

You turn a finished and tested piece of work into one short comment on the Jira ticket, with 3 or 4 screenshots, written so QA and non-technical readers understand it at a glance. **You only write what was observed.** Publishing is visible to the whole team, so it needs the user's explicit yes (section 5).

## When to use / when not

- Use it when the work is done, it was tested (usually with `/browser-test-roy`) and the user wants the result recorded in Jira.
- Do not use it to read a ticket (`/read-ticket-roy`), to run the test (`/browser-test-roy`), or to move, assign or edit the ticket. This skill only adds a comment and its images.
- If the tracker is not Jira (Linear, Asana, GitHub Issues), say so and ask what to do.

## 1. Gate: is there something true to report?

Do not go on unless all hold; otherwise say which one fails and stop:

- There is a ticket key or URL (from the argument or the session). If not, ask for it.
- The work was tested in this session and there is a result per criterion. If it was not tested, offer `/browser-test-roy` first.
- **Every criterion passed.** If any failed or could not be verified, do not write a success comment. Report what is pending and ask what to do (closed options: fix first, or post an honest comment that says what is still open).

## 2. What the ticket asks

Take the criteria **exactly as the ticket defines them**, reusing the context of `/read-ticket-roy` if it already ran; otherwise invoke it. If the ticket has no criteria, use what the ticket asks for in its description and say so in the comment ("the ticket did not list criteria; this follows its description"). Never invent a criterion.

## 3. Pick 3 or 4 screenshots

- Source: the latest `.playwright-mcp/e2e-<YYYYMMDD-HHmm>/` folder left by `/browser-test-roy` (`NN-<criterion>.png`).
- Choose 3 or 4 that together show the ticket works: ideally one per main criterion, the clearest first. Fewer than 3 is fine if the ticket is simple; never more than 4.
- If there is no folder (the test used Claude in Chrome, whose captures are not saved to disk, or nothing was captured), do not invent images: offer to repeat the key steps with Playwright through `/browser-test-roy`.
- Look at each image before choosing it. Screenshots may show real names, emails or tokens: point it out so the user reviews them before publishing.

## 4. Write the comment

Plain words, short, friendly, in the **same language as the ticket**. No file names, no stack traces, no commands, no framework names unless the ticket uses them. Structure:

1. One line: what the ticket asked for.
2. Two or three simple sentences: what was done.
3. One line per criterion: a check mark and what the reader can see in screenshot N.
4. Only if needed: what could not be verified, said plainly.

If the user chose to post an honest comment because something is still open, keep the same plain tone and structure: one line on what the ticket asked, what is already done and works (with its screenshots), and one clear line per pending item saying it is not finished yet. Never use a check mark for a criterion that did not pass, and never word it so the ticket looks complete.

Correct:
```
The ticket asked that a customer can reset their password from the login page.
Now the login page has a "Forgot password?" link, and the email arrives within a minute.
✅ The link shows on the login page (screenshot 1)
✅ After entering the email, a confirmation message appears (screenshot 2)
✅ The new password works to sign in (screenshot 3)
```

Incorrect:
```
Refactored AuthController, added POST /reset endpoint, all unit tests green (see attachments).
```
It fails because QA cannot see what changed for the user, it is technical, and it does not tie the evidence to the criteria.

## 5. Confirm before writing anything

Show the comment and the chosen screenshots (send them with `SendUserFile`, `display: "render"`; if that tool is not available, give the folder path and the file names). Say which ticket and site it goes to, that everyone with access to the ticket will read it, and that the images may carry personal data. **Wait for an explicit yes.** If they ask for changes, adjust and show it again. Silence, an earlier approval or "go ahead with the rest" is not a yes for this.

## 6. Connect to Jira

Follow `../_shared/connectors.md` to sweep the official Atlassian options (its identity check is read-only, so also confirm the one you pick exposes comment and attachment operations). The tools are deferred: load them with a **single** `ToolSearch` (keywords `jira comment`, `jira attachment`, `atlassian`); if an operation is not in the list, find it with the connector's `discover`. Never ask for tokens or codes.

If no official option can write, give the secure option from connectors.md section 4 and hand over the comment text ready to paste plus the folder with the screenshots, so the user attaches them by hand. Never claim you published.

## 7. Publish

1. **Upload each screenshot.** Call `uploadAttachmentToJiraIssue` with only `filePath`. It returns an `uploadCommand` to run in the shell. Before running it, check that it uploads only the chosen file to an Atlassian host over https; if it does anything else, do not run it and tell the user. Run it and keep the returned `fileId` and collection.
2. **Post one comment** with `addOrEditJiraIssueComment`, `contentFormat: html`, the screenshots embedded through `inlineFileId` and `inlineFileCollection` (or as media nodes next to the criterion they show).
3. **Fallback.** If the site rejects the HTML format or the inline images, attach each file with the second call of `uploadAttachmentToJiraIssue` (with `fileId`) and post a plain comment that names the attached files. Never run the attach call for a file already embedded: it would duplicate it.
4. Do not edit or delete other comments and do not move, assign or edit the ticket.

## 8. Verify

Read the comment back (`listJiraIssueComments` or `getJiraIssue`) and confirm the text is there and the images or attachments are present. Report the ticket link and what is now in Jira, in one short block. If you cannot confirm something, say so.

## If it fails

- **An upload fails:** say which file. Retry once or switch to the fallback; do not post a comment that points to images that did not upload.
- **The comment fails after the uploads:** the files may already be attached; say exactly what is in Jira and what is not.
- **No permission or the ticket does not exist:** state the cause and hand over the text and screenshots to publish by hand. Do not invent a result.

## Final checklist

- [ ] There is a ticket key and every criterion passed with observed evidence
- [ ] Criteria copied from the ticket, not invented
- [ ] 3 or 4 screenshots taken from the `browser-test-roy` folder, none invented
- [ ] Comment in plain words, in the ticket's language, one line per criterion
- [ ] I warned about personal data visible in the screenshots
- [ ] I wrote nothing in Jira without the user's explicit yes
- [ ] The `uploadCommand` was checked before running it
- [ ] Images embedded in the comment, or attached with the fallback, never both for the same file
- [ ] I read the comment back and reported what is really in Jira
- [ ] I changed nothing else in the ticket (status, assignee, description, other comments)
