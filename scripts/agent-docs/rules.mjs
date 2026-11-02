// Parses the rule blocks in .memory-bank/review-rules.md and renders the
// GitHub Copilot instruction files generated from them. Pure: text in, data
// and findings out. No file or process access.

export const RULE_FILE = '.memory-bank/review-rules.md';
export const INSTRUCTIONS_DIR = '.github/instructions';

const SEVERITIES = ['blocker', 'major', 'nit'];
const STATUSES = ['proposed', 'approved', 'active', 'moved-to-lint', 'retired'];
const EMITTED_STATUSES = ['approved', 'active'];
const MACHINE_ENFORCERS = ['lint', 'tsc', 'Danger'];
const PLAIN_ENFORCERS = ['tsc', 'test', 'Danger', 'AI', 'human'];
const REQUIRED_FIELDS = [
  'Scope',
  'Severity',
  'Enforced by',
  'Status',
  'Why',
  'Source',
];
const KNOWN_FIELDS = [...REQUIRED_FIELDS, 'Bad', 'Good', 'Bans'];

const RULE_HEADING = /^### R(\d+): (.*\S)\s*$/;
const FIELD_LINE = /^([A-Za-z][A-Za-z -]*):(?: (.*))?$/;
const LINT_ENFORCER = /^lint\(([^()\s]+)\)$/;
const SOURCE = /^(agent-docs|PR #\d+(?:, PR #\d+)*)$/;
const NPM_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

const byNum = (a, b) => a.num - b.num;

/**
 * @typedef {{code:string, file:string, line?:number, message:string, fix:string}} Finding
 * @typedef {{id:string, num:number, title:string, line:number, scope:string[],
 *   severity:string, status:string, enforcedBy:{kind:string, rule?:string},
 *   sources:string[], why:string, bad?:string, good?:string, bans:string[]}} Rule
 */

/**
 * Parses rule blocks. Never throws: a block with errors is reported and left
 * out of `rules`, and the other blocks still parse.
 * @param {string} text contents of the rules file
 * @param {string} file repo-relative path, used in each finding
 * @returns {{rules: Rule[], findings: Finding[]}}
 */
export function parseRules(text, file) {
  const findings = [];
  const blocks = tokenize(text, file, findings);
  const seen = new Map();
  const rules = [];
  for (const block of blocks) {
    if (seen.has(block.num)) {
      findings.push({
        code: 'rule-id-duplicate',
        file,
        line: block.line,
        message: `R${block.num} repeats the ID from line ${seen.get(block.num)}`,
        fix: 'give this rule the next free number',
      });
      continue;
    }
    seen.set(block.num, block.line);
    const rule = toRule(block, file, findings);
    if (rule) rules.push(rule);
  }
  rules.sort(byNum);
  reportSlugCollisions(rules, file, findings);
  return { rules, findings };
}

/**
 * Renders the Copilot instruction files. Emits approved and active rules that
 * are not enforced by lint or tsc. One file per distinct Scope list.
 * @param {Rule[]} rules output of parseRules
 * @param {string} rulesPath repo-relative path, named in each file's header
 * @returns {Map<string, string>} repo path to exact file contents, sorted by path
 */
export function renderInstructions(rules, rulesPath) {
  const groups = new Map();
  for (const rule of [...rules].sort(byNum)) {
    if (!isEmitted(rule)) continue;
    const globs = [...rule.scope].sort();
    const slug = scopeSlug(globs);
    if (!groups.has(slug)) groups.set(slug, { globs, rules: [] });
    groups.get(slug).rules.push(rule);
  }
  const files = new Map();
  for (const slug of [...groups.keys()].sort()) {
    const group = groups.get(slug);
    files.set(
      `${INSTRUCTIONS_DIR}/${slug}.instructions.md`,
      renderFile(group, rulesPath),
    );
  }
  return files;
}

function isEmitted(rule) {
  return (
    EMITTED_STATUSES.includes(rule.status) &&
    !MACHINE_ENFORCERS.includes(rule.enforcedBy.kind)
  );
}

// Lowercase, `*` dropped, every other non-alphanumeric run becomes `-`.
// Sorted globs in, so the same scope always gives the same file name.
function scopeSlug(sortedGlobs) {
  return (
    sortedGlobs
      .join(',')
      .toLowerCase()
      .replace(/\*/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'all'
  );
}

function renderFile({ globs, rules }, rulesPath) {
  // Single quotes and the blank line after the front matter are what Prettier
  // writes under this repo's config, so generated files pass `prettier --check`.
  const out = [
    '---',
    `applyTo: '${globs.join(',')}'`,
    '---',
    '',
    `<!-- Generated from ${rulesPath}. Do not edit. -->`,
    '',
  ];
  for (const rule of rules) {
    out.push(`## ${rule.id}: ${rule.title} (${rule.severity})`, '');
    out.push(`Why: ${rule.why}`, '');
    if (rule.bad !== undefined)
      out.push(`Bad: ${rule.bad}`, '', `Good: ${rule.good}`, '');
  }
  return out.join('\n');
}

// Splits the file into rule blocks. A block runs from its `###` heading to the
// next heading of level 1 or 2, or to the end. Lines inside a code fence are
// never headings or fields.
function tokenize(text, file, findings) {
  const blocks = [];
  let block = null;
  let field = null;
  let fence = false;
  text.split(/\r?\n/).forEach((line, index) => {
    const lineNo = index + 1;
    if (line.startsWith('```')) {
      fence = !fence;
      field?.lines.push(line);
      return;
    }
    if (fence) {
      field?.lines.push(line);
      return;
    }
    const level = /^#+/.exec(line)?.[0].length ?? 0;
    if (
      level > 0 &&
      level <= 3 &&
      (line.length === level || line[level] === ' ')
    ) {
      field = null;
      block = null;
      if (level < 3) return;
      const match = RULE_HEADING.exec(line);
      if (!match) {
        findings.push({
          code: 'rule-heading-malformed',
          file,
          line: lineNo,
          message: 'this ### heading is not a rule block',
          fix: 'write the heading as `### R<number>: <title>`, or use `##` for a section',
        });
        return;
      }
      block = {
        num: Number(match[1]),
        title: match[2],
        line: lineNo,
        fields: new Map(),
      };
      blocks.push(block);
      return;
    }
    const fieldMatch = block && FIELD_LINE.exec(line);
    if (fieldMatch) {
      const key = fieldMatch[1];
      if (!KNOWN_FIELDS.includes(key)) {
        findings.push({
          code: 'rule-unknown-field',
          file,
          line: lineNo,
          message: `R${block.num} has an unknown field "${key}"`,
          fix: `use one of: ${KNOWN_FIELDS.join(', ')}`,
        });
        field = null;
        return;
      }
      if (block.fields.has(key)) {
        findings.push({
          code: 'rule-duplicate-field',
          file,
          line: lineNo,
          message: `R${block.num} repeats the "${key}" field`,
          fix: `keep one "${key}" line and delete the other`,
        });
        field = null;
        return;
      }
      field = { lines: [fieldMatch[2] ?? ''], line: lineNo };
      block.fields.set(key, field);
      return;
    }
    field?.lines.push(line);
  });
  return blocks;
}

function toRule(block, file, findings) {
  const id = `R${block.num}`;
  let failed = false;
  const fail = (code, line, message, fix) => {
    failed = true;
    findings.push({ code, file, line, message, fix });
  };
  const has = (key) => block.fields.has(key);
  const text = (key) => block.fields.get(key)?.lines.join('\n').trim();
  const at = (key) => block.fields.get(key)?.line ?? block.line;

  for (const key of REQUIRED_FIELDS) {
    if (!has(key)) {
      fail(
        'rule-missing-field',
        block.line,
        `${id} has no ${key} field`,
        `add a \`${key}:\` line under the heading`,
      );
    }
  }
  if (has('Bad') !== has('Good')) {
    const missing = has('Bad') ? 'Good' : 'Bad';
    fail(
      'rule-missing-field',
      block.line,
      `${id} has no ${missing} field`,
      `write Bad and Good together, or remove both`,
    );
  }

  let scope = [];
  if (has('Scope')) {
    scope = text('Scope')
      .split(',')
      .map((glob) => glob.trim());
    const badGlob = (glob) =>
      glob === '' ||
      glob.startsWith('/') ||
      glob.startsWith('./') ||
      glob.includes("'");
    if (scope.some(badGlob)) {
      fail(
        'rule-bad-value',
        at('Scope'),
        `${id} Scope must be comma-separated repo-relative globs`,
        'list globs such as `packages/*/src/**`, with no leading `/`, `./`, or quote',
      );
      scope = [];
    }
  }

  const severity = text('Severity');
  if (has('Severity') && !SEVERITIES.includes(severity)) {
    fail(
      'rule-bad-value',
      at('Severity'),
      `${id} Severity "${severity}" is not one of ${SEVERITIES.join(', ')}`,
      'use one of the listed severities',
    );
  }

  const status = text('Status');
  if (has('Status') && !STATUSES.includes(status)) {
    fail(
      'rule-bad-value',
      at('Status'),
      `${id} Status "${status}" is not one of ${STATUSES.join(', ')}`,
      'use one of the listed statuses',
    );
  }

  let enforcedBy = { kind: '' };
  if (has('Enforced by')) {
    const value = text('Enforced by');
    const lint = LINT_ENFORCER.exec(value);
    if (lint) enforcedBy = { kind: 'lint', rule: lint[1] };
    else if (PLAIN_ENFORCERS.includes(value)) enforcedBy = { kind: value };
    else
      fail(
        'rule-bad-value',
        at('Enforced by'),
        `${id} Enforced by "${value}" is not a known enforcer`,
        'write `lint(<eslint-rule-id>)`, `tsc`, `test`, `AI`, or `human`',
      );
  }

  let sources = [];
  if (has('Source')) {
    const value = text('Source');
    if (SOURCE.test(value)) sources = value.split(', ');
    else
      fail(
        'rule-bad-value',
        at('Source'),
        `${id} Source "${value}" is not a PR list or agent-docs`,
        'write `Source: PR #<n>[, PR #<n>]` or `Source: agent-docs`',
      );
  }

  if (has('Why') && !text('Why')) {
    fail(
      'rule-bad-value',
      at('Why'),
      `${id} has an empty Why`,
      'state why the rule matters',
    );
  }

  let bans = [];
  if (has('Bans')) {
    bans = text('Bans')
      .split(',')
      .map((name) => name.trim());
    if (!bans.every((name) => NPM_NAME.test(name))) {
      fail(
        'rule-bad-value',
        at('Bans'),
        `${id} Bans must be comma-separated npm package names`,
        'list package names such as `lodash, redux`',
      );
      bans = [];
    }
  }

  if (failed) return null;
  return {
    id,
    num: block.num,
    title: block.title,
    line: block.line,
    scope,
    severity,
    status,
    enforcedBy,
    sources,
    why: text('Why'),
    bad: text('Bad'),
    good: text('Good'),
    bans,
  };
}

// Two rules whose Scope lists differ but map to one instruction file would
// silently share it. Reported at the later rule.
function reportSlugCollisions(rules, file, findings) {
  const bySlug = new Map();
  for (const rule of rules) {
    const globs = [...rule.scope].sort();
    const slug = scopeSlug(globs);
    const key = globs.join(',');
    const prior = bySlug.get(slug);
    if (!prior) bySlug.set(slug, { key, id: rule.id });
    else if (prior.key !== key) {
      findings.push({
        code: 'scope-slug-collision',
        file,
        line: rule.line,
        message: `${rule.id} and ${prior.id} have different Scope lists that map to one instruction file (${slug})`,
        fix: 'reword one Scope so the two lists differ in more than punctuation or `*`',
      });
    }
  }
}
