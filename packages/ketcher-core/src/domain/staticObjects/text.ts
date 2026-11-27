export type TextEditResolution = 'create' | 'update' | 'delete' | 'noop';

export function resolveTextEdit(edit: {
  isNew: boolean;
  originalContent: string;
  nextContent: string;
}): TextEditResolution {
  if (edit.isNew) {
    return edit.nextContent ? 'create' : 'noop';
  }
  if (!edit.nextContent) {
    return 'delete';
  }
  return edit.nextContent === edit.originalContent ? 'noop' : 'update';
}

export type TextScript = 'normal' | 'subscript' | 'superscript';

export interface TextRun {
  readonly text: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly script: TextScript;
  readonly fontSizePx?: number;
}

export type TextParagraph = ReadonlyArray<TextRun>;

const BOLD_FLAG = 1;
const ITALIC_FLAG = 2;
const SUBSCRIPT_FLAG = 32;
const SUPERSCRIPT_FLAG = 64;
const NON_BREAKING_SPACE = ' ';

interface LexicalTextNode {
  type: string;
  text?: string;
  format?: number;
  style?: string;
}

interface LexicalParagraphNode {
  type: string;
  children?: ReadonlyArray<LexicalTextNode>;
}

function normalizeWhitespace(text: string): string {
  return text
    .split(/([^\S\r\n]+)/)
    .map((part, index) =>
      index % 2 === 1 ? NON_BREAKING_SPACE.repeat(part.length) : part,
    )
    .join('');
}

function toScript(format: number): TextScript {
  if (format & SUBSCRIPT_FLAG) return 'subscript';
  if (format & SUPERSCRIPT_FLAG) return 'superscript';
  return 'normal';
}

function toRun(node: LexicalTextNode): TextRun {
  const format = node.format ?? 0;
  const fontSizeMatch = /font-size:\s*(\d+(?:\.\d+)?)px/.exec(node.style ?? '');

  return {
    text: normalizeWhitespace(node.text ?? '') || NON_BREAKING_SPACE,
    bold: Boolean(format & BOLD_FLAG),
    italic: Boolean(format & ITALIC_FLAG),
    script: toScript(format),
    fontSizePx: fontSizeMatch ? Number.parseFloat(fontSizeMatch[1]) : undefined,
  };
}

export function parseTextContent(content: string): TextParagraph[] | null {
  let parsed: { root?: { children?: ReadonlyArray<LexicalParagraphNode> } };
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const paragraphs = parsed?.root?.children;
  if (!paragraphs) {
    return null;
  }

  return paragraphs
    .filter((paragraph) => paragraph.type === 'paragraph')
    .map((paragraph) =>
      (paragraph.children ?? [])
        .filter((child) => child.type === 'text')
        .map(toRun),
    );
}
