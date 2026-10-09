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

import type { IKetConnection } from 'application/formatters/types/ket';
import type { Point } from 'domain/entities/vec2';

export type KetAtomLocation = {
  moleculeId: string;
  atomId: string;
};

export type KetAttachmentGroup = {
  id: string;
  atoms: number[];
};

export type KetMolecule = {
  stereoFlagPosition?: Point;
  attachmentGroups?: KetAttachmentGroup[];
};

export type HapticKet = {
  root: {
    connections?: IKetConnection[];
  };
  [key: string]: unknown;
};

export type HapticConnectionEndpoint =
  | {
      type: 'atom';
      moleculeId: string;
      atomId: number;
    }
  | {
      type: 'attachmentGroup';
      moleculeId: string;
      attachmentGroupId: string;
      attachmentGroupEntityId: number;
      atomIds: number[];
    };

export type AttachmentGroupLocation = {
  moleculeId: string;
  attachmentGroupId: string;
};
