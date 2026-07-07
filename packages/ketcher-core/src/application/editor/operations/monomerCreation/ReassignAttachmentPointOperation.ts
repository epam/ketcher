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
import type {
  AttachmentPointId,
  MonomerCreationState,
} from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import assert from 'assert';
import type { AttachmentPointName } from 'domain/types';
import type Restruct from 'application/render/restruct/restruct';

export class ReassignAttachmentPointOperation extends BaseOperation {
  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentPointId: AttachmentPointId,
    private readonly newName: AttachmentPointName,
    private previousName?: AttachmentPointName,
  ) {
    super(OperationType.MONOMER_CREATION_REASSIGN_AP);

    assert(this.monomerCreationState);
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { assignedAttachmentPoints, problematicAttachmentPoints } =
      this.monomerCreationState;

    problematicAttachmentPoints.delete(this.attachmentPointId);

    const attachmentPoint = assignedAttachmentPoints.get(
      this.attachmentPointId,
    );
    assert(attachmentPoint);

    this.previousName = attachmentPoint.name;
    attachmentPoint.name = this.newName;

    BaseOperation.invalidateAtom(restruct, attachmentPoint.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, attachmentPoint.leavingAtomId);
  }

  invert() {
    assert(this.previousName);

    return new ReassignAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointId,
      this.previousName,
      this.newName,
    );
  }

  isDummy() {
    return this.previousName === this.newName;
  }
}
