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

export class MonomerAddOperation implements Operation {
  monomer: BaseMonomer | undefined;
  constructor(
    public addMonomerChangeModel: () => BaseMonomer,
    public deleteMonomerChangeModel: (monomer: BaseMonomer) => void,
    private callback?: () => void,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.monomer = this.addMonomerChangeModel();
    renderersManager.addMonomer(this.monomer, this.callback);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.monomer) {
      this.deleteMonomerChangeModel(this.monomer);
      renderersManager.deleteMonomer(this.monomer);
      console.log('invert MonomerAddOperation');
    }
  }
}

export class MonomerMoveOperation implements Operation {
  constructor(private peptide: BaseMonomer) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.moveMonomer(this.peptide);
  }

  public invert() {
    console.log('invert MonomerMoveOperation');
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

  public invert() {
    console.log('invert MonomerHoverOperation');
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
  monomer: BaseMonomer;
  constructor(
    monomer: BaseMonomer,
    public addMonomerChangeModel: () => BaseMonomer,
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
    console.log(this.monomer);
    this.monomer = this.addMonomerChangeModel();
    renderersManager.addMonomer(this.monomer, this.callback);
    console.log('invert MonomerDeleteOperation');
  }
}
