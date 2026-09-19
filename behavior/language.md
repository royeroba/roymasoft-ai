# Language

Load when: writing anything that persists — code, specs, commits, PR bodies, comments on tickets.

---

## Conversation

Reply in the language the human wrote in. Spanish prompt → Spanish reply. Do not switch languages
mid-thread because the code is in English.

## Technical artifacts — English by default

Regardless of conversation language:

| Artifact | Language |
|---|---|
| Code, identifiers, types | English |
| Docstrings (JSDoc / Python / KDoc) | English |
| Commit messages, branch names | English |
| Specs under `specs/` | English |
| PR titles and descriptions | English |
| Test names and fixtures | English |
| Repository documentation | English |

**Override only when:** the human explicitly asks for another language for that artifact, or the
repository's existing convention is non-English. Follow the repository — if the existing specs and
commits are in Spanish, match them. Check before assuming; cite what you found.

## Human-facing messages — match the target context

Comments on GitHub issues, PR review replies, Slack or Jira messages follow **the language of the
thread you are writing into**, not the conversation language.

- Spanish issue → Spanish comment.
- English thread → English comment.
- Mixed → the language of the message you are answering.

An explicit instruction from the human always wins. Default to neutral, professional register.

## This harness

The harness's own files (`behavior/`, `agents/`, `contracts/`, `skills/`) are written in English:
model instructions perform better in English, and it matches every reference implementation. The
human maintaining them reads Spanish — so **comments addressed to the maintainer**, in READMEs and
in this repository's own documentation, may be Spanish.
