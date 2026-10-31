// Conversion helpers for Draft.js to Lexical format
// Copyright 2021 EPAM Systems

import type {
  SerializedEditorState,
  SerializedParagraphNode,
  SerializedTextNode,
} from './retext';

const BOLD_FLAG = 1;
const ITALIC_FLAG = 2;
const SUBSCRIPT_FLAG = 32;
const SUPERSCRIPT_FLAG = 64;

export interface DraftInlineStyleRange {
  offset: number;
  length: number;
  style: string;
}

export interface DraftBlock {
  text: string;
  type: string;
  inlineStyleRanges?: DraftInlineStyleRange[];
  // Draft.js entityRanges have this shape: { offset, length, key }
  entityRanges?: Array<{ offset: number; length: number; key: number }>;
  // Data can be arbitrary but prefer unknown over any for stricter typing
  data?: Record<string, unknown>;
}

export interface DraftEditorState {
  blocks?: DraftBlock[];
  // entityMap keys map to entity definitions; use unknown for values
  entityMap?: Record<string, unknown>;
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

  const children: SerializedParagraphNode[] = draftState.blocks.flatMap(
    (block) => blockToParagraphs(block),
  );

  return {
    root: {
      type: 'root',
      children,
      version: 1,
    },
  };
}

function createTextNode(
  text: string,
  format: number,
  style: string,
): SerializedTextNode {
  return { type: 'text', text, format, style, version: 1 };
}

/**
 * A Draft.js block may contain line breaks ("\n") inside its text, e.g. a
 * multi-line caption converted from CDXML by Indigo. The renderer places the
 * text nodes of a paragraph in one row, so every line has to be its own
 * paragraph; otherwise the text after a line break overlaps the other lines.
 * An empty line becomes a paragraph with an empty text node.
 */
function blockToParagraphs(block: DraftBlock): SerializedParagraphNode[] {
  return buildTextLines(block.text, block.inlineStyleRanges || []).map(
    (segments) => ({
      type: 'paragraph',
      // Lexical doesn't have a 'br' node type in serialized state. Emit an
      // empty text node instead so Lexical can parse it and the renderer will
      // treat it as an empty paragraph.
      children:
        segments.length > 0
          ? segments.map(({ text, format, style }) =>
              createTextNode(text, format, style),
            )
          : [createTextNode('', 0, '')],
      version: 1,
    }),
  );
}

interface TextSegment {
  text: string;
  format: number;
  style: string;
}

// Splits the text into lines, each one a list of segments of identical style.
// A line break is "\n", "\r" or "\r\n"; the pair counts once even when the
// two characters have different styles.
function buildTextLines(
  text: string,
  styleRanges: Array<{ offset: number; length: number; style: string }>,
): TextSegment[][] {
  // Create an array of style info for each character position
  const charStyles: Array<{ format: number; style: string }> = Array.from(
    { length: text.length },
    () => ({ format: 0, style: '' }),
  );

  // Apply each style range to the character positions it covers
  styleRanges.forEach((range) => {
    const startIdx = range.offset;
    const endIdx = Math.min(range.offset + range.length, text.length);

    for (let i = startIdx; i < endIdx; i++) {
      applyStyleToChar(charStyles[i], range.style);
    }
  });

  // Group consecutive characters with identical styles into segments
  const lines: TextSegment[][] = [[]];
  let currentSegment: TextSegment | null = null;

  for (let i = 0; i < text.length; i++) {
    const charStyle = charStyles[i];
    const char = text[i];

    if (char === '\n' || char === '\r') {
      // The "\n" of a "\r\n" pair ends the line, the "\r" before it is skipped
      if (!(char === '\r' && text[i + 1] === '\n')) {
        lines.push([]);
        currentSegment = null;
      }
      continue;
    }

    // Check if we need to start a new segment
    if (
      !currentSegment ||
      currentSegment.format !== charStyle.format ||
      currentSegment.style !== charStyle.style
    ) {
      currentSegment = {
        text: char,
        format: charStyle.format,
        style: charStyle.style,
      };
      lines[lines.length - 1].push(currentSegment);
    } else {
      // Continue current segment
      currentSegment.text += char;
    }
  }

  return lines;
}

function applyStyleToChar(
  charStyle: { format: number; style: string },
  styleString: string,
): void {
  switch (styleString) {
    case 'BOLD':
      charStyle.format |= BOLD_FLAG;
      break;
    case 'ITALIC':
      charStyle.format |= ITALIC_FLAG;
      break;
    case 'SUBSCRIPT':
      charStyle.format |= SUBSCRIPT_FLAG;
      break;
    case 'SUPERSCRIPT':
      charStyle.format |= SUPERSCRIPT_FLAG;
      break;
    default: {
      // Handle custom font-size styling
      const match = /^CUSTOM_FONT_SIZE_(\d+)px$/.exec(styleString);
      if (match) {
        const size = match[1];
        charStyle.style += `font-size:${size}px;`;
      }
      break;
    }
  }
}
