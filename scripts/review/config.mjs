// Settings of the review hub. Data only: no file or process access.
// The hub never changes these values. An override, such as the Opus label,
// builds a new object: `{ ...MODELS, finder: MODELS.strong }`.
//
// The isolation options of the model runs (safe or bare mode, the read-only
// tool list, the permission mode) are not settings. They are fixed in the
// runner, so that no change here can turn them off.

/** Folder of the lens and role prompts, relative to the base checkout. */
export const PROMPT_DIR = '.agents/skills/code-review';

/** Lenses of a Standard review, in the order they are started. */
export const STANDARD_LENSES = [
  'functional-correctness',
  'reuse',
  'code-quality',
  'security',
  'performance',
  'documentation-accuracy',
];

/** Lenses of a Quick review. */
export const QUICK_LENSES = ['functional-correctness'];

/** Prompt file of the verifier role, in PROMPT_DIR. */
export const VERIFIER_ROLE = 'verifier';

/** Labels that start a review. The hub removes the one that started the run. */
export const LABELS = {
  standard: 'Run Claude Review',
  quick: 'Claude Review: Quick',
  opus: 'Claude Review: Opus',
};

/**
 * Model IDs per role. Defaults until the evaluation (tasks 6.3, 6.4) gives
 * better ones. The Opus label sets both roles to `strong`.
 */
export const MODELS = {
  finder: 'claude-sonnet-5-5',
  verifier: 'claude-sonnet-5-5',
  strong: 'claude-opus-5-5',
};

/**
 * `oauth` runs `claude -p --safe-mode` with CLAUDE_CODE_OAUTH_TOKEN.
 * `api-key` runs `claude -p --bare` with ANTHROPIC_API_KEY.
 */
export const AUTH_MODE = 'oauth';

/** A diff at or below this many changed lines gets a Quick review, unless it touches a sensitive path. */
export const QUICK_MAX_CHANGED_LINES = 100;

/** A diff that touches one of these paths always gets a Standard review. */
export const SENSITIVE_PATHS = [
  'packages/ketcher-core/src/application/editor/**',
  'packages/ketcher-core/src/application/formatters/**',
  'packages/ketcher-core/src/domain/serializers/**',
];

/** Files the finder passes never see. They do not count toward the changed lines. */
export const SKIP_PATHS = [
  'ketcher-autotests/**',
  '**/package-lock.json',
  '**/__snapshots__/**',
  '**/*.snap',
  '**/dist/**',
  '**/build/**',
  'packages/ketcher-core/docs/**',
  '.github/instructions/**',
];

/** At most this many merged findings go to verification, blockers first. */
export const MAX_VERIFIED_FINDINGS = 10;

/** At most this many inline comments per round. Set by the output contract. */
export const MAX_INLINE_COMMENTS = 10;

/** Model runs at the same time. */
export const CONCURRENCY = 3;

/** Findings of the same file and rule at most this many lines apart are merged. */
export const MERGE_LINE_DISTANCE = 3;

/** After this many rounds the hub posts the limit comment and runs no model. */
export const MAX_ROUNDS = 3;

/**
 * Limits per model run, passed as `--max-turns` and `--max-budget-usd`.
 * First values; tune them after the local dry runs (task 5.4).
 */
export const RUN_LIMITS = {
  finder: { maxTurns: 30, maxBudgetUsd: 2 },
  verifier: { maxTurns: 15, maxBudgetUsd: 0.5 },
  linkedIssue: { maxTurns: 10, maxBudgetUsd: 0.5 },
};

/** Account that posts the brief. The hub reads round state only from its comments. */
export const BOT_LOGIN = 'github-actions[bot]';

/** Start of the hidden state marker in the brief. */
export const MARKER_PREFIX = '<!-- claude-review:v1 ';