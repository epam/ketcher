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
// eslint-disable no-unused-vars
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PolymerBond } from 'domain/entities/PolymerBond';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';

export class PolymerBondAddOperation implements Operation {
  public polymerBond;
  constructor(
    private addPolymerBondChangeModel: (
      polymerBond?: PolymerBond,
    ) => PolymerBond,
    private deletePolymerBondChangeModel: (polymerBond) => void,
  ) {
    this.polymerBond = this.addPolymerBondChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.polymerBond = this.addPolymerBondChangeModel(this.polymerBond);
    renderersManager.addPolymerBond(this.polymerBond);
  }

  public invert(renderersManager: RenderersManager) {
    this.deletePolymerBondChangeModel(this.polymerBond);
    renderersManager.deletePolymerBond(this.polymerBond);
    console.log('invert PolymerBondAddOperation');
  }
}

export class PolymerBondDeleteOperation implements Operation {
  constructor(
    public polymerBond: PolymerBond,
    private deletePolymerBondChangeModel: () => void,
    private finishPolymerBondCreationModelChange: (
      polymerBond?: PolymerBond,
    ) => PolymerBond,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deletePolymerBondChangeModel();
    renderersManager.deletePolymerBond(this.polymerBond);
    console.log('execute PolymerBondDeleteOperation');
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert PolymerBondDeleteOperation');
    this.polymerBond = this.finishPolymerBondCreationModelChange(
      this.polymerBond,
    );
    renderersManager.addPolymerBond(this.polymerBond);
  }
}

export class PolymerBondMoveOperation implements Operation {
  constructor(public polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.movePolymerBond(this.polymerBond);
  }

  public invert(_renderersManager: RenderersManager) {
    console.log('invert PolymerBondMoveOperation');
  }
}

export class PolymerBondShowInfoOperation implements Operation {
  constructor(public polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.showPolymerBondInformation(this.polymerBond);
  }

  public invert(_renderersManager: RenderersManager) {
    console.log('invert PolymerBondShowInfoOperation');
  }
}

export class PolymerBondCancelCreationOperation implements Operation {
  constructor(public polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.cancelPolymerBondCreation(this.polymerBond);
  }

  public invert(_renderersManager: RenderersManager) {
    console.log('invert PolymerBondCancelCreationOperation');
  }
}

export class PolymerBondFinishCreationOperation implements Operation {
  public polymerBond;
  constructor(
    private finishPolymerBondCreationModelChange: (
      polymerBond?: PolymerBond,
    ) => PolymerBond,
    private deletePolymerBondCreationModelChange: (polymerBond) => void,
  ) {
    this.polymerBond = this.finishPolymerBondCreationModelChange();
  }

  public execute(renderersManager: RenderersManager) {
    this.polymerBond = this.finishPolymerBondCreationModelChange(
      this.polymerBond,
    );
    renderersManager.finishPolymerBondCreation(this.polymerBond);
    console.log('execute PolymerBondFinishCreationOperation');
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert PolymerBondFinishCreationOperation');
    this.deletePolymerBondCreationModelChange(this.polymerBond);
    renderersManager.deletePolymerBond(this.polymerBond);
  }
}
