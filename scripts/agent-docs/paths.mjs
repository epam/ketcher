// Which docs the agent-docs checks read, and how a path mentioned in a doc
// resolves against the repo. Pure: takes the file list, never touches disk.

import { posix } from 'node:path';

// Agent instruction files: what an AI tool reads as its orders.
const AGENT_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  '.github/copilot-instructions.md',
];
const AGENT_GLOBS = [
  '.claude/commands/*.md',
  '.agents/skills/**/*.md',
  '.claude/skills/**/*.md',
];
// Knowledge base: facts the agents read, checked for dangling paths only.
const MEMORY_BANK_GLOBS = ['.memory-bank/*.md'];

const TRAILING_LINE = /:\d+(?::\d+)?$/;
const NOT_A_PATH_CHAR = /[<>$(){}=|;'"\\,!?@&:]/;
const FILE_EXTENSION = /\.(?:md|mjs|cjs|js|ts|tsx|json|ya?ml|txt)$/;

/** Agent instruction files present in `files`, sorted. */
export function agentDocPaths(files) {
  return selectFiles(files, AGENT_FILES, AGENT_GLOBS);
}

/** Agent instruction files and knowledge-base files present in `files`, sorted. */
export function docPaths(files) {
  return selectFiles(files, AGENT_FILES, [
    ...AGENT_GLOBS,
    ...MEMORY_BANK_GLOBS,
  ]);
}

function selectFiles(files, names, globs) {
  const regexps = globs.map(globToRegExp);
  return files
    .filter(
      (file) => names.includes(file) || regexps.some((re) => re.test(file)),
    )
    .sort();
}

/**
 * Glob to RegExp. `**` crosses directories, `*` does not, `?` is one character.
 * A `**` followed by `/` also matches zero directories.
 */
export function globToRegExp(glob) {
  let source = '';
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === '*' && glob[i + 1] === '*') {
      i++;
      if (glob[i + 1] === '/') {
        i++;
        source += '(?:.*/)?';
      } else {
        source += '.*';
      }
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${source}$`);
}

/** Lookup structure over a repo file list: exact files and every directory above them. */
export function pathIndex(files) {
  const dirs = new Set();
  for (const file of files) {
    for (
      let dir = posix.dirname(file);
      dir !== '.' && !dirs.has(dir);
      dir = posix.dirname(dir)
    ) {
      dirs.add(dir);
    }
  }
  return { files, exact: new Set(files), dirs };
}

/**
 * True when `token` names something in the repo. A relative token is tried
 * against the doc's folder and against the repo root.
 */
export function refResolves(index, doc, token) {
  const bare = token.replace(/\/+$/, '');
  const bases = [posix.join(posix.dirname(doc), bare), bare];
  return bases.some((base) => {
    const path = posix.normalize(base);
    if (path === '..' || path.startsWith('../')) return false;
    if (path.includes('*')) {
      const re = globToRegExp(path);
      return index.files.some((file) => re.test(file));
    }
    return index.exact.has(path) || index.dirs.has(path);
  });
}

/**
 * Paths written in a doc, outside code fences: backtick spans (`span`) and
 * markdown link targets (`link`). Skips URLs, anchors, placeholders, shell
 * commands, and words that are not paths.
 * @returns {{token: string, line: number, kind: 'span'|'link'}[]}
 */
export function pathRefs(text) {
  const refs = [];
  let fence = false;
  text.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      fence = !fence;
      return;
    }
    if (fence) return;
    const spans = [...line.matchAll(/`([^`]+)`/g)].map((match) => ({
      raw: match[1],
      kind: 'span',
    }));
    const links = [...line.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => ({
      raw: match[1],
      kind: 'link',
    }));
    for (const { raw, kind } of [...spans, ...links]) {
      const token = cleanToken(raw);
      if (token) refs.push({ token, line: index + 1, kind });
    }
  });
  return refs;
}

/**
 * Which refs the path check resolves. Link targets always are: they name a file
 * by its place. A backtick span is checked when it starts with `./` or `../`, or
 * with a top-level repo entry. A bare name (`types.ts`) or a path relative to a
 * package or `src/` is a name, not a repo path, and is not checked.
 */
export function isCheckedRef(ref, topLevelNames) {
  if (ref.kind === 'link') return true;
  if (ref.token.startsWith('./') || ref.token.startsWith('../')) return true;
  return ref.token.includes('/') && topLevelNames.has(ref.token.split('/')[0]);
}

/** Names of the top-level entries in `files`, e.g. `packages`, `.memory-bank`. */
export function topLevelNames(files) {
  return new Set(files.map((file) => file.split('/')[0]));
}

function cleanToken(raw) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('#')) return null;
  const token = raw.split('#')[0].replace(TRAILING_LINE, '');
  if (!token || /\s/.test(token) || NOT_A_PATH_CHAR.test(token)) return null;
  if (token.startsWith('/') || token.startsWith('-')) return null;
  if (!token.includes('/') && !FILE_EXTENSION.test(token)) return null;
  return token;
}
