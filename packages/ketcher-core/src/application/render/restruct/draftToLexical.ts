// Conversion helpers for Draft.js to Lexical format
// Copyright 2021 EPAM Systems

import {
  SerializedEditorState,
  SerializedParagraphNode,
  SerializedTextNode,
} from './retext';

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
  entityRanges?: Array<any>;
  data?: Record<string, any>;
}

export interface DraftEditorState {
  blocks?: DraftBlock[];
  entityMap?: Record<string, any>;
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
      // Empty block — Lexical doesn't have a 'br' node type in serialized state.
      // Emit an empty text node instead so Lexical can parse it and
      // the renderer will treat it as an empty paragraph.
      textChildren.push({
        type: 'text',
        text: '',
        format: 0,
        style: '',
        version: 1,
      });
    } else {
      // Build text segments with their respective styles
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

interface TextSegment {
  text: string;
  format: number;
  style: string;
}

function buildTextSegments(
  text: string,
  styleRanges: Array<{ offset: number; length: number; style: string }>,
): TextSegment[] {
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
  const segments: TextSegment[] = [];
  let currentSegment: TextSegment | null = null;

  for (let i = 0; i < text.length; i++) {
    const charStyle = charStyles[i];
    const char = text[i];

    // Check if we need to start a new segment
    if (
      !currentSegment ||
      currentSegment.format !== charStyle.format ||
      currentSegment.style !== charStyle.style
    ) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        text: char,
        format: charStyle.format,
        style: charStyle.style,
      };
    } else {
      // Continue current segment
      currentSegment.text += char;
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
