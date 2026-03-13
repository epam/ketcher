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
import type { SerializedRootNode } from 'lexical/nodes/LexicalRootNode';
import type { SerializedParagraphNode } from 'lexical/nodes/LexicalParagraphNode';
import type { SerializedTextNode } from 'lexical/nodes/LexicalTextNode';

interface KETTextPart {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  font?: string;
}

interface KETParagraph {
  alignment?: string;
  indent?: number;
  font?: string;
  parts: KETTextPart[];
}

interface KETText {
  type: 'text';
  boundingBox: { x: number; y: number; width: number; height: number };
  alignment?: string;
  indent?: number;
  font?: string;
  paragraphs: KETParagraph[];
}

interface TextNode {
  selected: boolean;
  data: {
    pos: { x: number; y: number }[];
    content: string;
  };
}

export function textToKet(textNode) {
  const convertToKET20Text = (source: TextNode['data']): KETText => {
    // Calculate boundingBox from pos array
    const pos = source.pos;
    const x = pos[0].x;
    const y = pos[0].y;
    const width = pos[2].x - pos[0].x;
    const height = Math.abs(pos[1].y - pos[0].y);

    // Parse content
    const textContent = JSON.parse(source.content) as {
      root: SerializedRootNode<SerializedParagraphNode | SerializedTextNode>;
    };
    const root = textContent.root;
    const ketText: KETText = {
      type: 'text',
      boundingBox: { x, y, width, height },
      paragraphs: [],
    };

    // Copy optional root properties if present
    if ((root as any).alignment !== undefined)
      ketText.alignment = (root as any).alignment;
    if ((root as any).indent !== undefined)
      ketText.indent = (root as any).indent;
    if ((root as any).font !== undefined) ketText.font = (root as any).font;

    // Build paragraphs array
    ketText.paragraphs = (root.children as SerializedParagraphNode[]).map(
      (paragraph) => {
        const paraObj: KETParagraph = { parts: [] };
        if ((paragraph as any).alignment !== undefined)
          paraObj.alignment = (paragraph as any).alignment;
        if ((paragraph as any).indent !== undefined)
          paraObj.indent = (paragraph as any).indent;
        if ((paragraph as any).font !== undefined)
          paraObj.font = (paragraph as any).font;
        // Build parts array from text children
        paraObj.parts = (paragraph.children as SerializedTextNode[])
          .map((child) => {
            // Only handle text nodes
            if ((child as any).text !== undefined) {
              const part: KETTextPart = { text: (child as any).text };
              // Copy formatting if present
              if ((child as any).format && (child as any).format & 1)
                part.bold = true;
              if ((child as any).format && (child as any).format & 2)
                part.italic = true;
              if ((child as any).format && (child as any).format & 4)
                part.underline = true;
              if ((child as any).superscript) part.superscript = true;
              if ((child as any).subscript) part.subscript = true;
              if ((child as any).font !== undefined)
                part.font = (child as any).font;
              return part;
            }
            return null;
          })
          .filter((p): p is KETTextPart => Boolean(p));
        return paraObj;
      },
    );

    return ketText;
  };

  return {
    selected: textNode.selected,
    ...convertToKET20Text(getNodeWithInvertedYCoord(textNode.data)),
  };
}
