// JSON Schemas (draft-07) for the answers of the model runs. The hub passes
// one to `claude -p --json-schema`, and the runtime makes the answer match it.
// The fields follow the output contract in .memory-bank/review-workflow.md.
//
// Every property is required and no other property is allowed, so the hub
// never has to guess whether a field is missing. A field that does not apply
// holds an empty array.

export const SEVERITIES = ['blocker', 'major', 'nit'];

/** A rule (R5), an invariant (D1, A2, B3), or `none`. */
export const ID_PATTERN = '^(R[0-9]+|[A-Z][0-9]+|none)$';

/** A repo-relative path and a line number in the new version of the file. */
export const LOCATION_PATTERN = '^[^\\s:]+:[1-9][0-9]*$';

const text = { type: 'string', minLength: 1 };
const location = { type: 'string', pattern: LOCATION_PATTERN };

const finding = {
  type: 'object',
  additionalProperties: false,
  required: [
    'file',
    'line',
    'otherLocations',
    'severity',
    'id',
    'claim',
    'scenario',
    'references',
  ],
  properties: {
    file: { ...text, description: 'Repo-relative path of the file.' },
    line: {
      type: 'integer',
      minimum: 1,
      description: 'Line in the new version of the file.',
    },
    otherLocations: {
      type: 'array',
      items: location,
      description: 'file:line of each other place with the same mistake.',
    },
    severity: { enum: SEVERITIES },
    id: {
      type: 'string',
      pattern: ID_PATTERN,
      description: 'Rule or invariant ID, or none.',
    },
    claim: { ...text, description: 'One sentence: what is wrong.' },
    scenario: {
      ...text,
      description:
        'The input or sequence that gives the wrong result, or for a structural finding the concrete change it makes harder.',
    },
    references: {
      type: 'array',
      items: location,
      description:
        'file:line of existing code the finding names, such as the helper to reuse.',
    },
  },
};

/** Answer of a finder pass: every finding of one lens. */
export const FINDINGS_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: { type: 'array', items: finding },
  },
};

/** Answer of a verifier run: the verdict on one finding. */
export const VERDICT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'reason', 'line', 'severity', 'id', 'scenario'],
  properties: {
    verdict: { enum: ['confirmed', 'dropped'] },
    reason: {
      ...text,
      description: 'One sentence, quoting the line the verdict rests on.',
    },
    line: {
      type: 'integer',
      minimum: 1,
      description: 'The checked line, corrected when the finding was off.',
    },
    severity: { enum: SEVERITIES },
    id: { type: 'string', pattern: ID_PATTERN },
    scenario: {
      ...text,
      description: 'The failing scenario as checked, rewritten when corrected.',
    },
  },
};

/** Answer of the linked-issue run: does the diff fix the issue? */
export const LINKED_ISSUE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: false,
  required: ['fixesIssue', 'reason'],
  properties: {
    fixesIssue: { enum: ['yes', 'partly', 'no'] },
    reason: {
      ...text,
      description:
        'One or two sentences. For partly or no, name what the diff does not cover.',
    },
  },
};
