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

import { Struct } from 'domain/entities/struct';
import { Text } from 'domain/entities/text';
import { getNodeWithInvertedYCoord } from '../helpers';
import {
  convertDraftToLexical,
  DraftEditorState,
} from 'application/render/restruct/draftToLexical';

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

interface KETFont {
  family?: string;
  size?: number;
}

interface KETFontStyleOverrides {
  font?: KETFont;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

interface KETTextPart extends KETFontStyleOverrides {
  text: string;
}

interface KETParagraph extends KETFontStyleOverrides {
  alignment?: string;
  indent?: number | { first_line?: number; left?: number; right?: number };
  parts: KETTextPart[];
}

interface KETTextV2 extends KETFontStyleOverrides {
  type: 'text';
  boundingBox: {
    x: number;
    y: number;
    z?: number;
    width: number;
    height: number;
  };
  alignment?: string;
  indent?: number | { first_line?: number; left?: number; right?: number };
  paragraphs: KETParagraph[];
  selected?: boolean;
}

/**
 * Convert KET v2.0 format to internal format (pos array + Lexical content).
 */
function convertKetV2ToInternal(ketText: KETTextV2): {
  position: { x: number; y: number; z?: number };
  pos: Array<{ x: number; y: number; z?: number }>;
  content: string;
} {
  const { boundingBox, paragraphs } = ketText;
  const { x, y, z, width, height } = boundingBox;

  // Build pos array: 4 corners of bounding box (top-left, bottom-left, bottom-right, top-right)
  const pos = [
    { x, y, z },
    { x, y: y + height, z },
    { x: x + width, y: y + height, z },
    { x: x + width, y, z },
  ];

  // Convert paragraphs to Lexical format
  const lexicalRoot = {
    root: {
      children: paragraphs.map((para) => {
        const paragraphNode: any = {
          children: (para.parts || []).map((part) => {
            let format = 0;
            if (part.bold) format |= IS_BOLD;
            if (part.italic) format |= IS_ITALIC;
            if (part.subscript) format |= IS_SUBSCRIPT;
            if (part.superscript) format |= IS_SUPERSCRIPT;

            const textNode: any = {
              detail: 0,
              format,
              mode: 'normal',
              style: '',
              text: part.text,
              type: 'text',
              version: 1,
            };

            // Build style string
            const styles: string[] = [];
            if (part.font?.size) {
              styles.push(`font-size: ${part.font.size}px`);
            }
            if (part.color) {
              styles.push(`color: ${part.color}`);
            }
            if (styles.length > 0) {
              textNode.style = styles.join('; ');
            }
            if (part.font?.family) {
              textNode.font = part.font.family;
            }

            return textNode;
          }),
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: '',
        };

        // Apply paragraph-level alignment
        if (para.alignment) {
          paragraphNode.format = para.alignment;
        }

        return paragraphNode;
      }),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };

  return {
    position: { x, y, z },
    pos,
    content: JSON.stringify(lexicalRoot),
  };
}

/**
 * Check if the ketItem is in KET v2.0 format (has boundingBox and paragraphs directly).
 */
function isKetV2Format(ketItem: any): ketItem is KETTextV2 {
  return (
    ketItem &&
    ketItem.boundingBox !== undefined &&
    ketItem.paragraphs !== undefined
  );
}

export function textToStruct(ketItem: any, struct: Struct) {
  let node: any;

  if (isKetV2Format(ketItem)) {
    // KET v2.0 format: convert to internal format
    const internal = convertKetV2ToInternal(ketItem);
    node = getNodeWithInvertedYCoord(internal);
  } else {
    // Old format with data wrapper
    node = getNodeWithInvertedYCoord(ketItem.data);

    // If the incoming node.content is Draft.js shape (stringified or object),
    // convert it to Lexical format at parse time so we store only Lexical JSON.
    if (node && node.content) {
      try {
        // If content is a JSON string, try to parse it
        const parsed =
          typeof node.content === 'string'
            ? JSON.parse(node.content)
            : node.content;

        if (parsed && Array.isArray((parsed as DraftEditorState).blocks)) {
          const lexical = convertDraftToLexical(parsed as DraftEditorState);
          node.content = JSON.stringify(lexical);
        }
      } catch (e) {
        // Leave content as-is if parsing/conversion fails
        // (content may already be Lexical or plain text)
      }
    }
  }

  const text = new Text(node);
  text.setInitiallySelected(ketItem.selected);
  struct.texts.add(text);
  return struct;
}
