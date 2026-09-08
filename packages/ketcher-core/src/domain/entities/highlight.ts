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

export interface HighlightAttributes {
  atoms: Array<number>;
  bonds: Array<number>;
  rgroupAttachmentPoints: Array<number>;
  color: string;
  // When true, the highlight is drawn as a stroked outline instead of a filled
  // shading. Used for RNA preset components whose tab is not currently active.
  outline?: boolean;
}

export class Highlight {
  atoms: Array<number>;
  bonds: Array<number>;
  rgroupAttachmentPoints: Array<number>;
  color: string;
  outline: boolean;

  constructor(attributes: HighlightAttributes) {
    const { atoms, bonds, rgroupAttachmentPoints, color, outline } = attributes;
    this.color = color;
    this.atoms = atoms;
    this.bonds = bonds;
    this.rgroupAttachmentPoints = rgroupAttachmentPoints;
    this.outline = outline ?? false;
  }
}
