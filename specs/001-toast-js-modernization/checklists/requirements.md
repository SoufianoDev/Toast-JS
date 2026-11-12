# Requirements Quality Checklist

> Reviewer-owned checklist. All items are intentionally unchecked. `[x]` means the reviewer has confirmed the requirement itself is complete, clear, consistent, and testable; it does not mean implementation is complete.

## Scope and Outcomes

- [ ] The problem statement describes the existing implementation and why the modernization is needed.
- [ ] Goals and non-goals prevent unrelated framework, repository-cleanup, or release work from entering the feature.
- [ ] Each user story has a clear actor, outcome, and reason.
- [ ] Each P1 story has independent acceptance criteria.
- [ ] Each success criterion is observable and can be verified without guessing.

## Compatibility

- [ ] The exact current-`main` baseline is identified and re-audit rules are explicit.
- [ ] The complete current public API inventory is required before refactoring.
- [ ] Historical `libs/js/` artifacts and their URLs are explicitly protected.
- [ ] Selective historical compatibility is distinct from strict current-`main` compatibility.
- [ ] Existing deep package exports and aliases cannot disappear accidentally.

## Runtime Behavior

- [ ] Queue ordering, per-position capacity, and default limit are deterministic.
- [ ] Timer start, pause reasons, action settlement, and remaining-time behavior are defined.
- [ ] Persistent and async notification behavior is distinguishable from the display lifecycle.
- [ ] Animation completion, cancellation, fallback, and resource cleanup are testable.
- [ ] Failure paths do not leak queue capacity or runtime resources.

## Accessibility and Presentation

- [ ] Status vs alert semantics are defined by urgency.
- [ ] Focus movement and keyboard operation are defined.
- [ ] Reduced motion, RTL, zoom, responsiveness, and long content have acceptance coverage.
- [ ] Style preset data and CSS structure have clear compatibility boundaries.

## Packaging and Quality

- [ ] Node module loading is distinguished from the browser DOM runtime.
- [ ] Exact support versions are deferred to evidence-based research, not assumed.
- [ ] CSS import default and opt-in injection are unambiguous.
- [ ] Type checking and declaration generation are not conflated.
- [ ] Build tool and CommonJS decisions have explicit evidence criteria.
- [ ] Tests cover the packed artifact and actual package exports.
