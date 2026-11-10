---
applyTo: 'ketcher-autotests/package.json,package.json,packages/*/package.json'
---

<!-- Generated from .memory-bank/review-rules.md. Do not edit. -->

## R4: New dependencies get a manual review before they are added (major)

Why: The agent instructions require a manual review of each new dependency. Check that the package is needed and maintained, and that an existing dependency does not already cover the job, as lodash does for many helpers.
