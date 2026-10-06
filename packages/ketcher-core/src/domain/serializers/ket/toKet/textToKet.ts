/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { getNodeWithInvertedYCoord } from '../helpers';
import type {
  KetTextFont,
  KetTextIndent,
  KetTextParagraph,
  KetTextPart,
  KetTextStyleOverrides,
  KetTextV2Node,
} from '../types';

interface TextNode {
  selected: boolean;
  data: {
    pos: { x: number; y: number }[];
    content: string;
  };
}

interface LexicalTextChild {
  type?: string;
  text?: string;
  format?: number;
  font?: string;
  style?: string;
}

interface LexicalParagraph extends KetTextStyleOverrides {
  alignment?: string;
  indent?: KetTextIndent;
  children?: LexicalTextChild[];
}

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

/**
 * Extracts font style overrides from a Lexical text node and applies them
 * to the target KET object (part, paragraph, or root text).
 */
function applyFontStyleOverrides(
  target: KetTextStyleOverrides,
  child: LexicalTextChild,
): void {
  const format = child.format ?? 0;

  if (format & IS_BOLD) target.bold = true;
  if (format & IS_ITALIC) target.italic = true;
  if (format & IS_SUPERSCRIPT) target.superscript = true;
  if (format & IS_SUBSCRIPT) target.subscript = true;

  // Build font object from Lexical style string and font property
  const font: KetTextFont = {};
  let hasFont = false;

  if (child.font !== undefined) {
    font.family = child.font;
    hasFont = true;
  }

  if (child.style) {
    const fontSizeMatch = /font-size:\s*(\d+(?:\.\d+)?)px/.exec(child.style);
    if (fontSizeMatch) {
      font.size = Number.parseFloat(fontSizeMatch[1]);
      hasFont = true;
    }
  }

  if (hasFont) {
    target.font = font;
  }

  // Extract color from Lexical style string (e.g. "color:#FF0000;")
  if (child.style) {
    const colorMatch = /(?:^|;)\s*color:\s*(#[0-9A-Fa-f]+)/.exec(child.style);
    if (colorMatch) {
      target.color = colorMatch[1];
    }
  }
}

export function textToKet(textNode) {
  const convertToKET20Text = (source: TextNode['data']): KetTextV2Node => {
    // Calculate boundingBox from pos array
    const pos = source.pos;
    const x = pos[0].x;
    const y = pos[0].y;
    const width = pos[2].x - pos[0].x;
    const height = Math.abs(pos[1].y - pos[0].y);

    // Parse content – may be Lexical (has "root") or legacy Draft.js format
    const textContent = JSON.parse(source.content);
    const root = textContent.root;

    // If this is legacy Draft.js content (no root key), return raw data
    if (!root) {
      return {
        type: 'text',
        data: source,
      } as unknown as KetTextV2Node;
    }

    const ketText: KetTextV2Node = {
      type: 'text',
      boundingBox: { x, y, width, height },
      paragraphs: [],
    };

    // Copy optional root-level properties if present
    if (root.alignment !== undefined) ketText.alignment = root.alignment;
    if (root.indent !== undefined) ketText.indent = root.indent;
    if (root.font !== undefined) ketText.font = root.font;
    if (root.color !== undefined) ketText.color = root.color;
    if (root.bold !== undefined) ketText.bold = root.bold;
    if (root.italic !== undefined) ketText.italic = root.italic;
    if (root.superscript !== undefined) ketText.superscript = root.superscript;
    if (root.subscript !== undefined) ketText.subscript = root.subscript;

    // Build paragraphs array
    ketText.paragraphs = (root.children || []).map(
      (paragraph: LexicalParagraph) => {
        const paraObj: KetTextParagraph = { parts: [] };
        if (paragraph.alignment !== undefined)
          paraObj.alignment = paragraph.alignment;
        if (paragraph.indent !== undefined) paraObj.indent = paragraph.indent;
        if (paragraph.font !== undefined) paraObj.font = paragraph.font;
        if (paragraph.color !== undefined) paraObj.color = paragraph.color;
        if (paragraph.bold !== undefined) paraObj.bold = paragraph.bold;
        if (paragraph.italic !== undefined) paraObj.italic = paragraph.italic;
        if (paragraph.superscript !== undefined)
          paraObj.superscript = paragraph.superscript;
        if (paragraph.subscript !== undefined)
          paraObj.subscript = paragraph.subscript;

        // Build parts array from text children
        paraObj.parts = (paragraph.children || [])
          .map((child: LexicalTextChild) => {
            if (child.type !== 'text' || child.text === undefined) return null;

            const part: KetTextPart = { text: child.text };
            applyFontStyleOverrides(part, child);

            return part;
          })
          .filter(Boolean) as KetTextPart[];

        return paraObj;
      },
    );

    return ketText;
  };

  return {
    ...convertToKET20Text(getNodeWithInvertedYCoord(textNode.data)),
  };
}
