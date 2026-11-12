# Public API Contract

## 1. Compatibility Baseline

The mandatory API baseline is the public surface and supported observable behavior of `main` at `701371fd42423d034fc649aeac900f13b99b183d`, subject to a re-audit if `main` advances before implementation.

The initial audited inventory includes:

- Factory/context: `Toast.makeText(context, text, duration)`, `Toast.getWebAppContext()`, `Toast.getContextFor(container)`.
- Instance methods: `setDuration`, `setStyle`, `setPosition`, `setAnimation`, `setIcon`, `setIconShape`, `setDismissible`, `setTextOverflow`, `on`, `off`, `addCallback`, `show`, and `hide`.
- Static values: `LENGTH_SHORT`, `LENGTH_LONG`, position constants, icon constants, animation constants, `TextOverflow`, 21 frozen `STYLE_*` objects, and `Toast.Manager`.

This is an initial inventory, not a substitute for a complete export/property/method scan of the active source and package export map.

## 2. Contract Rules

- Preserve method names, argument forms, documented defaults, constants, accepted style aliases, event behavior, and supported observable lifecycle behavior.
- Record callback/event names, callback order, return values, error behavior, and invalid-input behavior where observable and part of the current contract.
- Preserve the shape, values, freezing, and alias map of the 21 style preset objects.
- Do not promote an accidental defect to a permanent contract without checking source, README, changelog, and actual usage.
- New functionality must be additive or explicitly versioned; do not silently redefine existing options.
- New public method/option names are not selected by this document. They require an API design based on the current API style and testability.

## 3. New Capability Contracts

The new API must support the following behaviors without prescribing unapproved signature names:

- Create, show, dismiss, and update a notification by stable ID.
- Represent transient and persistent notification modes.
- Attach one or more accessible actions.
- Represent async pending/success/failure states on the same notification identity.
- Configure a per-position visible limit with a default of three.
- Explicitly opt into CSS injection; explicit stylesheet import remains default.

## 4. Contract Test Requirements

`tests/contracts/public-api.contract.test.mjs` must verify the same baseline assertions against both implementations through adapters. Tests must include exported values, instance methods, argument forms, defaults, style data/aliases, events, callbacks, and supported lifecycle outcomes.
