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

import { Vec2, Point } from './vec2';
import {
  BaseMicromoleculeEntity,
  initiallySelectedType,
} from 'domain/entities/BaseMicromoleculeEntity';

// TODO: move to infrastructure
export enum TextCommand {
  Bold = 'BOLD',
  Italic = 'ITALIC',
  Subscript = 'SUBSCRIPT',
  Superscript = 'SUPERSCRIPT',
  FontSize = 'CUSTOM_FONT_SIZE',
}

export interface TextAttributes {
  /**
   * Serialized editor state stored as a JSON string in Lexical format.
   * Previously this could contain Draft.js serialized state; after
   * the import-time conversion change `content` MUST be a stringified
   * Lexical `SerializedEditorState` (or an empty string).
   */
  content: string;
  position: Point;
  pos: Array<Point>;
  initiallySelected?: initiallySelectedType;
}

function preparePositions(positions?: Array<Point>) {
  if (!positions?.length) {
    return [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
  }

  return positions.map((position) => new Vec2(position));
}

export class Text extends BaseMicromoleculeEntity {
  /**
   * Stringified Lexical editor state. Parsable JSON with a `root` node.
   */
  content: string;
  position: Vec2;
  pos: Array<Vec2>;

  constructor(attributes?: TextAttributes) {
    super(attributes?.initiallySelected);
    this.pos = preparePositions(attributes?.pos);
    this.content = attributes?.content ?? '';
    this.position = attributes?.position
      ? new Vec2(attributes.position)
      : new Vec2();
  }

  setPos(coords: Array<Vec2>): void {
    this.pos = coords ?? [];
  }

  clone(): Text {
    return new Text(this);
  }
}
