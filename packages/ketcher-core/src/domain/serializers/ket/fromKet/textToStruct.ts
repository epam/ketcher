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

import { Struct, Text } from 'domain/entities';
import { getNodeWithInvertedYCoord } from '../helpers';
import {
  convertDraftToLexical,
  DraftEditorState,
} from 'application/render/restruct/draftToLexical';

export function textToStruct(ketItem: any, struct: Struct) {
  const node = getNodeWithInvertedYCoord(ketItem.data);

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

  const text = new Text(node);
  text.setInitiallySelected(ketItem.selected);
  struct.texts.add(text);
  return struct;
}
