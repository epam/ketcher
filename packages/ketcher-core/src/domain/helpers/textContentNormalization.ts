const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

export interface DraftInlineStyleRange {
  offset: number;
  length: number;
  style: string;
}

export interface DraftBlock {
  text: string;
  type: string;
  inlineStyleRanges?: DraftInlineStyleRange[];
  entityRanges?: Array<unknown>;
  data?: Record<string, unknown>;
}

export interface DraftEditorState {
  blocks?: DraftBlock[];
  entityMap?: Record<string, unknown>;
}

export interface SerializedTextNode {
  detail?: number;
  format: number;
  mode?: string;
  style: string;
  text: string;
  type: string;
  version?: number;
}

export interface SerializedParagraphNode {
  children: Array<SerializedTextNode | { type: string }>;
  direction?: string;
  format?: string | number;
  indent?: number;
  type: string;
  version?: number;
}

export interface SerializedRootNode {
  children: Array<SerializedParagraphNode>;
  direction?: string;
  format?: string | number;
  indent?: number;
  type: string;
  version?: number;
}

export interface SerializedEditorState {
  root: SerializedRootNode;
}

function isLexicalEditorState(value: unknown): value is SerializedEditorState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const root = (value as SerializedEditorState).root;
  return !!root && typeof root === 'object' && root.type === 'root';
}

function isDraftEditorState(value: unknown): value is DraftEditorState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const blocks = (value as DraftEditorState).blocks;
  return Array.isArray(blocks);
}

interface TextSegment {
  text: string;
  format: number;
  style: string;
}

function buildTextSegments(
  text: string,
  styleRanges: Array<{ offset: number; length: number; style: string }>,
): TextSegment[] {
  const charStyles: Array<{ format: number; style: string }> = Array.from(
    { length: text.length },
    () => ({ format: 0, style: '' }),
  );

  styleRanges.forEach((range) => {
    const startIdx = range.offset;
    const endIdx = Math.min(range.offset + range.length, text.length);

    for (let index = startIdx; index < endIdx; index++) {
      applyStyleToChar(charStyles[index], range.style);
    }
  });

  const segments: TextSegment[] = [];
  let currentSegment: TextSegment | null = null;

  for (let index = 0; index < text.length; index++) {
    const charStyle = charStyles[index];
    const character = text[index];

    if (
      !currentSegment ||
      currentSegment.format !== charStyle.format ||
      currentSegment.style !== charStyle.style
    ) {
      if (currentSegment) {
        segments.push(currentSegment);
      }

      currentSegment = {
        text: character,
        format: charStyle.format,
        style: charStyle.style,
      };
    } else {
      currentSegment.text += character;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

function applyStyleToChar(
  charStyle: { format: number; style: string },
  styleString: string,
): void {
  switch (styleString) {
    case 'BOLD':
      charStyle.format |= IS_BOLD;
      break;
    case 'ITALIC':
      charStyle.format |= IS_ITALIC;
      break;
    case 'SUBSCRIPT':
      charStyle.format |= IS_SUBSCRIPT;
      break;
    case 'SUPERSCRIPT':
      charStyle.format |= IS_SUPERSCRIPT;
      break;
    default: {
      const match = /^CUSTOM_FONT_SIZE_(\d+)px$/.exec(styleString);
      if (match) {
        const size = match[1];
        charStyle.style += `font-size:${size}px;`;
      }
      break;
    }
  }
}

export function convertDraftToLexical(
  draftState: DraftEditorState,
): SerializedEditorState {
  if (!draftState.blocks || draftState.blocks.length === 0) {
    return {
      root: {
        type: 'root',
        children: [],
      },
    };
  }

  const children: SerializedParagraphNode[] = draftState.blocks.map((block) => {
    const textChildren: (SerializedTextNode | { type: string })[] = [];

    if (block.text.length === 0) {
      textChildren.push({ type: 'br' });
    } else {
      const segments = buildTextSegments(
        block.text,
        block.inlineStyleRanges || [],
      );

      segments.forEach((segment) => {
        textChildren.push({
          type: 'text',
          text: segment.text,
          format: segment.format,
          style: segment.style,
          version: 1,
        });
      });
    }

    return {
      type: 'paragraph',
      children: textChildren,
      version: 1,
    };
  });

  return {
    root: {
      type: 'root',
      children,
      version: 1,
    },
  };
}

export function parseTextContentAsLexical(
  content?: string | null,
): SerializedEditorState | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content);

    if (isLexicalEditorState(parsed)) {
      return parsed;
    }

    if (isDraftEditorState(parsed)) {
      return convertDraftToLexical(parsed);
    }
  } catch (_error) {
    return null;
  }

  return null;
}

export function normalizeTextContentToLexical(content?: string | null): string {
  const lexicalState = parseTextContentAsLexical(content);
  return lexicalState ? JSON.stringify(lexicalState) : '';
}
