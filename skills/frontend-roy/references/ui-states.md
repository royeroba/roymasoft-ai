# UI states and interface copy

Last verified: 2026-11-09

Scope: what a screen must show besides the happy path, and how to word what it says. Keep the product's existing voice, terms and language; these rules apply to English and Spanish strings alike.

## Every data view has its states

Before calling a component done, list which of these it handles: loading, empty (first use and no results), error, long or partial content, and populated. A design or mockup often shows only one of them: name the missing ones and ask for them instead of inventing the visuals.

Source: https://www.nngroup.com/articles/empty-state-interface-design/

## Loading

Response-time limits: about 0.1 s feels instant, about 1 s keeps the user's flow of thought, about 10 s is the limit of attention. So add nothing for instant results, show an indicator when the wait can pass about 1 s, and give a progress cue for longer waits. Reserve the space of the final content so the layout does not jump (see `performance.md`).

Source: https://www.nngroup.com/articles/response-times-3-important-limits/

## Empty states

An empty state should communicate what is going on, help the user understand the value of the screen and offer a direct path to the key task. Tell apart first use (invite the first action), no results (offer to clear the filters) and a failed load (that is an error, not an empty state).

Source: https://www.nngroup.com/articles/empty-state-interface-design/

## Error messages

Say what went wrong and how to fix it, in plain language and with specifics. Do not blame the user, do not show a bare code, keep what the user already typed and place the message next to the field it is about. Announcing it to assistive technology is covered in `accessibility.md`.

Source: https://www.nngroup.com/articles/error-message-guidelines/
Source: https://design-system.service.gov.uk/components/error-message/

## Buttons and confirmations

Name the outcome on a button, starting with a verb. Confirm only what is destructive or hard to undo, name the object and the consequence, and label the buttons with the actions. For reversible actions prefer an undo over a confirmation.

Source: https://www.nngroup.com/articles/confirmation-dialog/

## Long and translated text

Text can be longer than the mockup assumed (real names, other languages). Do not use fixed widths or heights that clip it; let it wrap, or truncate on purpose with a way to read the full text. Content must reflow without losing information.

Source: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html

## Wording pairs

| Element | Correct | Incorrect |
|---|---|---|
| Button | `Save changes`, `Create account` | `Submit`, `OK` |
| Error | `Payment declined. Your bank refused the card. Try another card or contact your bank.` | `Error 402` |
| Empty | `No projects yet. Create your first project to invite your team.` | `No data` |
| Confirm | `Delete 3 files? This can't be undone.` with `Delete files` / `Keep files` | `Are you sure?` with `OK` / `Cancel` |

These pairs are the plugin's own examples of the guidance above; keep them in the product's language.

Source: https://www.nngroup.com/articles/error-message-guidelines/
