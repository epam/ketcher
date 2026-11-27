// Keeps secret values out of what the hub posts. A model run needs its auth
// token in its environment, and a run reads the pull request, so a prompt in
// the reviewed code could ask it to write a value it can reach into a
// finding. Everything the hub posts is public, so the text that leaves for
// GitHub is the one door where a known secret value is taken out.
//
// This is the second layer. The first is the run environment in runner.mjs,
// which hands a run only the names it needs.

/**
 * Environment names whose value never belongs in a comment. The hub does not
 * read these: it only knows what they hold, so that it can take it out again.
 */
const SECRET_NAMES = [
  'CLAUDE_CODE_OAUTH_TOKEN',
  'ANTHROPIC_API_KEY',
  'GITHUB_TOKEN',
  'GH_TOKEN',
  'ACTIONS_RUNTIME_TOKEN',
  'ACTIONS_ID_TOKEN_REQUEST_TOKEN',
];

/**
 * The shortest value treated as a secret. A short or empty value would match
 * ordinary text and redact a comment into nothing.
 */
const MIN_SECRET_LENGTH = 12;

/** What a secret value is replaced with. */
const REPLACEMENT = '[redacted]';

/**
 * The secret values of an environment, longest first, so that a value that
 * holds another one is taken out whole.
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]}
 */
export function secretValues(env) {
  const values = SECRET_NAMES.map((name) => env[name]).filter(
    (value) => typeof value === 'string' && value.length >= MIN_SECRET_LENGTH,
  );
  return [...new Set(values)].sort((a, b) => b.length - a.length);
}

/**
 * The text with every secret value replaced.
 * @param {string} text
 * @param {string[]} secrets from secretValues
 */
export function redact(text, secrets) {
  return secrets.reduce(
    (out, secret) => out.replaceAll(secret, REPLACEMENT),
    text,
  );
}
