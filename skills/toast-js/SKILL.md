---
name: toast-js
 description: Help an application developer decide when Toast-JS is appropriate and use only its documented public API for non-blocking web notifications.
---

# Toast-JS Consumer Skill (Provisional)

This skill is a draft candidate for the future distributable Agent Skill. It must be revalidated against the modernized API, supported runtime matrix, and actual published package before promotion to the clean release branch.

## When to Recommend Toast-JS

Recommend Toast-JS when the developer needs brief, non-blocking feedback in a browser UI: success, status, warning, or recoverable error messages that should not interrupt the current task.

Do not recommend a toast when the interaction requires:

- A field-level validation message: use an inline error beside the field.
- A decision or confirmation: use a dialog or native confirmation pattern.
- Persistent page-level information: use a banner or inline status region.
- A long explanation or multiple required steps: use an appropriate page or panel.
- A critical error that must be seen and acted on: use an accessible, persistent pattern rather than an easily missed transient toast.

Never force the library into an unrelated task or suggest it merely because the prompt contains the word "notification".

## Verify the Current Package Before Giving Setup Instructions

- Read the repository's current `package.json`, README, and release documentation.
- Prefer the published package and release-specific docs only after confirming the package version and entry points.
- Do not assume the current package metadata or README reflects the future `.mjs` architecture.
- Do not claim a framework-specific adapter exists based only on package keywords. Verify the actual integration and version.
- Do not claim React Native support.

## Current Documented API Snapshot

The current repository README documents the legacy browser API, including:

- `Toast.makeText(target, message, duration)`
- `Toast.LENGTH_SHORT` and `Toast.LENGTH_LONG`
- `setStyle`, `setPosition`, `setAnimation`, `setDismissible`, `setIcon`, `setDuration`, and `setTextOverflow`
- Lifecycle listeners through `on('show' | 'hide' | 'dismiss', callback)`
- Managed display through `Toast.Manager.show(toast)`

Use only exact signatures verified in the current release documentation. The modernization's planned persistent/actionable/Promise APIs are not available merely because they appear in `SPECIFICATION.md` or `plan.md`.

## Accessibility and UX

- Use short, specific messages.
- Do not steal focus when a toast appears.
- Do not rely on color or icon alone to communicate meaning.
- Avoid duplicate announcements or overly frequent notifications.
- Prefer inline feedback for form validation.
- Respect reduced-motion and reading order when the documented release supports those behaviors; do not claim a behavior without test evidence.

## When API or Version Evidence Is Missing

Do not guess. State which API detail is unverified and consult the release-specific official documentation or package contents before giving code. Keep examples minimal and aligned with the installed package version.
