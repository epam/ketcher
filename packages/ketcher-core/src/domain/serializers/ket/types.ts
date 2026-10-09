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

import type {
  AtomQueryProperties,
  AttachmentPoints,
} from 'domain/entities/atom';
import type { AtomCIP, BondCIP } from 'domain/entities/types';
import type { RxnArrowAttributes } from 'domain/entities/rxnArrow';
import type { StructProperty } from 'domain/entities/struct';
import type { Point, Vec2 } from 'domain/entities/vec2';

export interface KetHeader {
  moleculeName?: string;
}

export interface KetAtomNode {
  type?: 'atom-list';
  label?: string;
  mapping?: number;
  elements?: string[];
  notList?: boolean;
  alias?: string | null;
  location?: [number, number, number];
  charge?: number | null;
  explicitValence?: number;
  isotope?: number | null;
  radical?: number;
  attachmentPoints?: AttachmentPoints | null;
  cip?: AtomCIP | null;
  selected?: boolean;
  stereoLabel?: string | null;
  stereoParity?: number;
  ringBondCount?: number;
  substitutionCount?: number;
  unsaturatedAtom?: boolean;
  hCount?: number;
  queryProperties?: AtomQueryProperties;
  invRet?: number;
  exactChangeFlag?: boolean;
  implicitHCount?: number | null;
}

export interface KetRgLabelNode {
  type: 'rg-label';
  location?: [number, number, number];
  attachmentPoints?: AttachmentPoints | null;
  $refs?: string[];
  selected?: boolean;
}

export interface KetBondNode {
  type?: number;
  atoms?: [number, number];
  stereo?: number;
  topology?: number | null;
  center?: number | null;
  cip?: BondCIP | null;
  customQuery?: string | null;
  selected?: boolean;
}

export interface KetSGroupAttachmentPointNode {
  attachmentAtom?: number;
  leavingAtom?: number;
  attachmentId?: string;
}

export interface KetSGroupNode {
  type?: string;
  atoms?: number[];
  mul?: number;
  subscript?: string;
  connectivity?: string;
  subtype?: string | null;
  name?: string;
  expanded?: boolean;
  id?: number;
  class?: string;
  attachmentPoints?: KetSGroupAttachmentPointNode[];
  placement?: boolean;
  display?: boolean;
  context?: string;
  fieldName?: string;
  fieldData?: string;
  bonds?: number[];
}

export interface KetMoleculeNode {
  type: 'molecule';
  atoms: (KetAtomNode | KetRgLabelNode)[];
  bonds?: KetBondNode[];
  sgroups?: KetSGroupNode[];
  stereoFlagPosition?: Vec2;
  properties?: Array<StructProperty>;
}

export interface KetArrowNode {
  type: 'arrow';
  data: RxnArrowAttributes;
  selected?: boolean;
}

export interface KetPlusNode {
  type: 'plus';
  location: [number, number, number?];
  selected?: boolean;
}

export type KetReactionNode = KetArrowNode | KetPlusNode;

export interface KetTextFont {
  family?: string;
  size?: number;
}

export type KetTextIndent =
  number | { first_line?: number; left?: number; right?: number };

export interface KetTextStyleOverrides {
  font?: KetTextFont;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

export interface KetTextPart extends KetTextStyleOverrides {
  text: string;
}

export interface KetTextParagraph extends KetTextStyleOverrides {
  alignment?: string;
  indent?: KetTextIndent;
  parts: KetTextPart[];
}

export interface KetTextV2Node extends KetTextStyleOverrides {
  type: 'text';
  boundingBox: {
    x: number;
    y: number;
    z?: number;
    width: number;
    height: number;
  };
  alignment?: string;
  indent?: KetTextIndent;
  paragraphs: KetTextParagraph[];
  selected?: boolean;
}

export interface KetTextData {
  content: string;
  position: Point;
  pos: Point[];
}

export interface KetLegacyTextNode {
  type: 'text';
  data: KetTextData;
  selected?: boolean;
}

export type KetTextNode = KetTextV2Node | KetLegacyTextNode;

export interface KetFragment {
  atoms?: KetAtomNode[];
  bonds?: KetBondNode[];
}

export interface KetRGroupLogic {
  number: number;
  range?: string;
  resth?: boolean;
  ifthen?: number;
}

export interface KetItem {
  type?: string;
  fragments?: KetFragment[];
  rlogic?: KetRGroupLogic;
}
