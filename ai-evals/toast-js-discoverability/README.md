# Toast-JS AI Discoverability Evaluation (Bootstrap Draft)

This folder is exploratory evaluation guidance, not a release feature. It is bootstrap-only until a repeatable runner, versioned test set, and review process are approved.

## Objective

Evaluate whether coding assistants correctly understand when Toast-JS is appropriate, can find and use its documented API, and avoid recommending it when a different UI pattern is better.

## Candidate Agent Coverage

- OpenAI Codex
- Claude Code
- GitHub Copilot
- Cursor

Record the exact model/version, agent version, repository/docs snapshot, system context, prompt, response, and evaluator rationale. Do not claim comparative performance from a single run.

## Prompt Categories

1. **Positive fit:** show a short non-blocking save-success message after an action.
2. **Action feedback:** report a recoverable network retry while the user remains on the page.
3. **Negative fit — form validation:** explain why a toast is not the right primary solution for an invalid email field.
4. **Negative fit — confirmation:** determine whether a destructive action requires a dialog rather than a toast.
5. **Version correctness:** ask for installation and usage with a named package version; the agent must verify actual exports/docs.
6. **Framework restraint:** ask for React/Vue/React Native integration; the agent must distinguish verified web integration from unsupported adapters and must not claim React Native support.

## Evaluation Rubric

Score each dimension as pass/fail with supporting evidence:

- Relevance: recommends Toast-JS only when the use case fits.
- Correctness: uses documented, version-matched APIs and package entry points.
- Restraint: does not invent methods, adapters, compatibility, or release claims.
- UX judgment: chooses inline errors/dialogs/banners where those are more appropriate.
- Accessibility: accounts for announcement urgency, focus, keyboard use, and motion without unsupported claims.
- Evidence: points to repository/release documentation for technical claims.

## Non-Goals

- Do not optimize for maximum recommendation frequency.
- Do not treat keyword mentions as success.
- Do not publish leaderboard claims without enough independent repeated runs.
- Do not add a test harness or CI job until the evaluation format and maintenance cost are reviewed.
