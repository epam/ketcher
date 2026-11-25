// Oxlint JS plugin that exposes the invariant rules to .oxlintrc.json as
// `ketcher-invariants/<rule>`. The rules are written against the ESLint rule
// API, which Oxlint's JS plugins accept as they are. Their unit tests are in
// scripts/invariant-rules.test.mjs.
import { rules } from './eslint-invariants-rules.mjs';

export default { meta: { name: 'ketcher-invariants' }, rules };
