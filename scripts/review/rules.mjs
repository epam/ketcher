// Picks the review rules that the finder passes and the verifier get, and
// writes them as prompt text. Parsing is done by parseRules, the parser that
// check:agent-docs and the Copilot instructions use. Pure: text in, data out.

import { globToRegExp } from '../agent-docs/paths.mjs';
import { parseRules, RULE_FILE } from '../agent-docs/rules.mjs';

/** @typedef {import('../agent-docs/rules.mjs').Rule} Rule */

/** Statuses of rules that no longer apply to a review. */
const CLOSED_STATUSES = ['retired', 'moved-to-lint'];

/**
 * Whether the AI review checks this rule. Rules that lint, tsc, Danger or a
 * person enforce are left out, and so are retired rules. Proposed rules are
 * kept, and the prompt names their status.
 * @param {Rule} rule
 */
export function isReviewRule(rule) {
  return (
    rule.enforcedBy.kind === 'AI' && !CLOSED_STATUSES.includes(rule.status)
  );
}

/**
 * Whether the rule's `Scope` matches at least one of the paths.
 * @param {Rule} rule
 * @param {string[]} paths repo-relative paths of the changed files
 */
export function ruleMatches(rule, paths) {
  const scope = rule.scope.map(globToRegExp);
  return paths.some((path) => scope.some((re) => re.test(path)));
}

/**
 * The review rules for a set of changed files, from the text of the rules
 * file. Blocks that do not parse are left out and come back as findings, so
 * the hub can log them; the other rules still apply.
 * @param {string} text contents of `.memory-bank/review-rules.md`
 * @param {string[]} paths repo-relative paths of the changed files
 */
export function selectRules(text, paths) {
  const { rules, findings } = parseRules(text, RULE_FILE);
  return {
    rules: rules.filter(
      (rule) => isReviewRule(rule) && ruleMatches(rule, paths),
    ),
    findings,
  };
}

/**
 * The rules as Markdown for a prompt, one block per rule, with its ID,
 * severity and status.
 * @param {Rule[]} rules
 */
export function rulesText(rules) {
  return rules
    .map((rule) => {
      const lines = [
        `### ${rule.id}: ${rule.title}`,
        '',
        `Severity: ${rule.severity}. Status: ${rule.status}.`,
        `Why: ${rule.why}`,
      ];
      if (rule.bad !== undefined) {
        lines.push(`Bad: ${rule.bad}`, `Good: ${rule.good}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}
