/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { AttachmentPointName } from 'domain/types';

export class MonomerAddOperation implements Operation {
  public monomer: BaseMonomer;
  public priority = 1;
  constructor(
    public addMonomerChangeModel: (monomer?: BaseMonomer) => BaseMonomer,
    public deleteMonomerChangeModel: (monomer: BaseMonomer) => void,
    private callback?: () => void,
  ) {
    this.monomer = this.addMonomerChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.monomer = this.addMonomerChangeModel(this.monomer);
    renderersManager.addMonomer(this.monomer, this.callback);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.monomer) {
      this.deleteMonomerChangeModel(this.monomer);
      renderersManager.deleteMonomer(this.monomer);
    }
  }
}

export class MonomerMoveOperation implements Operation {
  public monomer: BaseMonomer;
  constructor(
    private monomerMoveModelChange: () => BaseMonomer,
    private invertMonomerMoveModelChange: () => BaseMonomer,
  ) {
    this.monomer = this.monomerMoveModelChange();
  }

  public execute(renderersManager: RenderersManager) {
    this.monomer = this.monomerMoveModelChange();
    renderersManager.moveMonomer(this.monomer);
  }

  public invert(renderersManager: RenderersManager) {
    this.monomer = this.invertMonomerMoveModelChange();
    renderersManager.moveMonomer(this.monomer);
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

  public invert() {}
}

export class AttachmentPointHoverOperation implements Operation {
  constructor(
    private peptide: BaseMonomer,
    private attachmentPointName: AttachmentPointName,
  ) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.hoverAttachmentPoint(
      this.peptide,
      this.attachmentPointName,
    );
  }

  public invert() {}
}

export class MonomerDeleteOperation implements Operation {
  monomer: BaseMonomer;
  public priority = -1;
  constructor(
    monomer: BaseMonomer,
    public addMonomerChangeModel: (monomer: BaseMonomer) => BaseMonomer,
    public deleteMonomerChangeModel: (monomer: BaseMonomer) => void,
    private callback?: () => void,
  ) {
    this.monomer = monomer;
  }

  public execute(renderersManager: RenderersManager) {
    this.deleteMonomerChangeModel(this.monomer);
    renderersManager.deleteMonomer(this.monomer);
  }

  public invert(renderersManager: RenderersManager) {
    this.monomer = this.addMonomerChangeModel(this.monomer);
    renderersManager.addMonomer(this.monomer, this.callback);
  }
}

export class MonomerItemModifyOperation implements Operation {
  monomer: BaseMonomer;
  constructor(
    monomer: BaseMonomer,
    public updateMonomerItem: () => BaseMonomer,
    public revertMonomerItem: () => BaseMonomer,
  ) {
    this.monomer = monomer;
  }

  public execute() {
    this.monomer = this.updateMonomerItem();
  }

  public invert() {
    this.monomer = this.revertMonomerItem();
  }
}
