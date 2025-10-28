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

import { BaseOperation } from 'application/editor/operations/base';
import { MonomerCreationState } from 'application/render';
import { OperationType } from 'application/editor';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';
import Restruct from 'application/render/restruct/restruct';

export class ReassignAttachmentPointOperation extends BaseOperation {
  constructor(
    private monomerCreationState: MonomerCreationState,
    private currentName: AttachmentPointName,
    private newName: AttachmentPointName,
  ) {
    super(OperationType.MONOMER_CREATION_REASSIGN_AP);

    assert(this.monomerCreationState);
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { assignedAttachmentPoints, problematicAttachmentPoints } =
      this.monomerCreationState;

    problematicAttachmentPoints.delete(this.currentName);

    const atomPair = assignedAttachmentPoints.get(this.currentName);
    assert(atomPair);

    if (assignedAttachmentPoints.has(this.newName)) {
      const existingAtomPair = assignedAttachmentPoints.get(this.newName);
      assert(existingAtomPair);

      assignedAttachmentPoints.set(this.newName, atomPair);
      assignedAttachmentPoints.set(this.currentName, existingAtomPair);

      BaseOperation.invalidateAtom(restruct, atomPair[0]);
      BaseOperation.invalidateAtom(restruct, atomPair[1]);
      BaseOperation.invalidateAtom(restruct, existingAtomPair[0]);
      BaseOperation.invalidateAtom(restruct, existingAtomPair[1]);
    } else {
      assignedAttachmentPoints.set(this.newName, atomPair);
      assignedAttachmentPoints.delete(this.currentName);

      BaseOperation.invalidateAtom(restruct, atomPair[0]);
      BaseOperation.invalidateAtom(restruct, atomPair[1]);
    }
  }

  invert() {
    return new ReassignAttachmentPointOperation(
      this.monomerCreationState,
      this.newName,
      this.currentName,
    );
  }
}
