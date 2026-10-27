// Renders Codex subagent roles (.codex/agents/<name>.toml) from the Claude
// Code subagents in .claude/agents/<name>.md. Pure: text in, text out. No file
// or process access.

import { posix } from 'node:path';

export const CLAUDE_AGENTS_DIR = '.claude/agents';
export const CODEX_AGENTS_DIR = '.codex/agents';

// A subagent with any of these tools can change files or run commands.
const WRITE_TOOLS = ['Write', 'Edit', 'Bash', 'NotebookEdit'];

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;
const FIELD = /^([A-Za-z][\w-]*):\s*(.*?)\s*$/;
const MARKDOWN_LINK = /\]\(([^)\s]+)\)/g;
const EXTERNAL_TARGET = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/|\/)/i;

/**
 * Splits a subagent file into frontmatter fields and body.
 * @param {string} text
 * @returns {{fields: Record<string, string>, body: string}}
 */
export function parseAgent(text) {
  const match = FRONTMATTER.exec(text);
  if (!match) throw new Error('no frontmatter');
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = FIELD.exec(line);
    if (field) fields[field[1]] = field[2];
  }
  return { fields, body: text.slice(match[0].length).replace(/^\n+/, '') };
}

/** True when the comma-separated `tools` value has no write-capable tool. */
export function isReadOnly(tools) {
  if (tools === undefined) return false;
  const names = tools.split(',').map((name) => name.trim());
  return !names.some((name) => WRITE_TOOLS.includes(name));
}

/**
 * Rewrites relative Markdown links from "relative to .claude/agents/" to
 * "relative to the repo root". URLs and anchors stay as they are.
 */
export function rewriteLinks(body) {
  return body.replace(MARKDOWN_LINK, (whole, target) => {
    if (EXTERNAL_TARGET.test(target)) return whole;
    const [path, anchor] = splitAnchor(target);
    const resolved = posix.normalize(posix.join(CLAUDE_AGENTS_DIR, path));
    return `](${resolved}${anchor})`;
  });
}

function splitAnchor(target) {
  const at = target.indexOf('#');
  return at === -1 ? [target, ''] : [target.slice(0, at), target.slice(at)];
}

/** A single-line TOML basic string. */
export function tomlString(value) {
  return `"${escapeBasic(value)}"`;
}

/** A multi-line TOML basic string. Backslashes and quote runs are escaped. */
export function tomlMultiline(value) {
  const escaped = escapeBasic(value, { keepNewlines: true }).replace(
    /"{3,}/g,
    (run) => run.replace(/"/g, '\\"'),
  );
  // A quote at the very end would merge with the closing delimiter.
  const safe = escaped.endsWith('"') ? `${escaped.slice(0, -1)}\\"` : escaped;
  return `"""\n${safe}"""`;
}

function escapeBasic(value, { keepNewlines = false } = {}) {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0);
    if (char === '\\') out += '\\\\';
    else if (char === '"' && !keepNewlines) out += '\\"';
    else if (char === '\n') out += keepNewlines ? '\n' : '\\n';
    else if (char === '\t') out += keepNewlines ? '\t' : '\\t';
    else if (char === '\r') out += '\\r';
    else if (code < 0x20 || code === 0x7f) {
      out += `\\u${code.toString(16).padStart(4, '0')}`;
    } else out += char;
  }
  return out;
}

/**
 * Renders one Codex role file from one subagent file.
 * @param {string} text contents of .claude/agents/<name>.md
 * @param {string} source repo-relative path of that file
 * @returns {string}
 */
export function renderCodexAgent(text, source) {
  const { fields, body } = parseAgent(text);
  for (const key of ['name', 'description']) {
    if (!fields[key]) throw new Error(`${source}: frontmatter has no ${key}`);
  }
  const lines = [
    `# Generated from ${source} by \`npm run generate:codex-agents\`. Do not edit.`,
    `name = ${tomlString(fields.name)}`,
    `description = ${tomlString(fields.description)}`,
  ];
  if (isReadOnly(fields.tools)) lines.push('sandbox_mode = "read-only"');
  lines.push(
    `developer_instructions = ${tomlMultiline(rewriteLinks(body))}`,
    '',
  );
  return lines.join('\n');
}

/**
 * Renders every role for the given subagent files.
 * @param {Map<string,string>|Record<string,string>} agents path -> text, for
 *   files in .claude/agents/
 * @returns {Map<string,string>} output path -> TOML text
 */
export function renderCodexAgents(agents) {
  const entries = agents instanceof Map ? [...agents] : Object.entries(agents);
  const out = new Map();
  for (const [path, text] of entries.sort(([a], [b]) => a.localeCompare(b))) {
    if (posix.dirname(path) !== CLAUDE_AGENTS_DIR || !path.endsWith('.md')) {
      continue;
    }
    const name = posix.basename(path, '.md');
    out.set(`${CODEX_AGENTS_DIR}/${name}.toml`, renderCodexAgent(text, path));
  }
  return out;
}
