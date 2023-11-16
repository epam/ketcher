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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class MonomerAddOperation implements Operation {
  constructor(public monomer: BaseMonomer, private callback?: () => void) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.addMonomer(this.monomer, this.callback);
  }
}

export class MonomerMoveOperation implements Operation {
  constructor(private peptide: BaseMonomer) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.moveMonomer(this.peptide);
  }
}

export class MonomerHoverOperation implements Operation {
  constructor(
    private peptide: BaseMonomer,
    private needRedrawAttachmentPoints: boolean,
  ) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverMonomer(
      this.peptide,
      this.needRedrawAttachmentPoints,
    );
  }
}

export class AttachmentPointHoverOperation implements Operation {
  constructor(
    private peptide: BaseMonomer,
    private attachmentPointName: string,
  ) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverAttachmentPoint(
      this.peptide,
      this.attachmentPointName,
    );
  }
}

export class MonomerDeleteOperation implements Operation {
  constructor(private peptide: BaseMonomer) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.deleteMonomer(this.peptide);
  }
}
