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

import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { MonomerCreationState } from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';
import Restruct from 'application/render/restruct/restruct';

export class ReassignAttachmentPointOperation extends BaseOperation {
  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly currentName: AttachmentPointName,
    private readonly newName: AttachmentPointName,
  ) {
    super(OperationType.MONOMER_CREATION_REASSIGN_AP);

    assert(this.monomerCreationState);
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { assignedAttachmentPoints, problematicAttachmentPoints } =
      this.monomerCreationState;

    problematicAttachmentPoints.delete(this.currentName);

    // Find the entry currently named currentName
    const entry = Array.from(assignedAttachmentPoints.entries()).find(
      ([, { name }]) => name === this.currentName,
    );
    assert(entry, `Attachment point "${this.currentName}" not found`);

    const [attachmentAtomId, { leavingAtomId }] = entry;

    // Simply rename — duplicate names are allowed transiently and will be
    // caught by the uniqueness validation before the monomer can be saved.
    assignedAttachmentPoints.set(attachmentAtomId, {
      name: this.newName,
      leavingAtomId,
    });

    BaseOperation.invalidateAtom(restruct, attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, leavingAtomId);
  }

  invert() {
    return new ReassignAttachmentPointOperation(
      this.monomerCreationState,
      this.newName,
      this.currentName,
    );
  }
}
