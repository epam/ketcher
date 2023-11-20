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
import assert from 'assert';
import { Command } from 'domain/entities/Command';

export class PolymerBondAddOperation implements Operation {
  public polymerBond;
  constructor(
    private addPolymerBondChangeModel: () => PolymerBond,
    private deletePolymerBondChangeModel: (polymerBond) => void,
  ) {
    this.polymerBond = this.addPolymerBondChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
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
    private addPolymerBondChangeModel: (polymerBondExists) => PolymerBond,
    private finishPolymerBondCreationModelChange: () => PolymerBond,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deletePolymerBondChangeModel();
    renderersManager.deletePolymerBond(this.polymerBond);
    console.log('execute PolymerBondDeleteOperation');
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert PolymerBondDeleteOperation');
    this.polymerBond = this.finishPolymerBondCreationModelChange();
    this.addPolymerBondChangeModel(this.polymerBond);
    renderersManager.addPolymerBond(this.polymerBond);

    console.log('this.polymerBond: ', this.polymerBond);
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
    private finishPolymerBondCreationModelChange: () => PolymerBond,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.polymerBond = this.finishPolymerBondCreationModelChange();
    renderersManager.finishPolymerBondCreation(this.polymerBond);
    console.log('execute PolymerBondFinishCreationOperation');
  }

  public invert(renderersManager: RenderersManager) {
    console.log('invert PolymerBondFinishCreationOperation');
    renderersManager.deletePolymerBond(this.polymerBond);
  }
}

export class PolymerBondAddAttachmentPointsOperation implements Operation {
  constructor(
    public polymerBond: PolymerBond,
    private secondMonomer,
    private firstMonomerAttachmentPoint,
    private secondMonomerAttachmentPoint,
  ) {
    this.polymerBond = polymerBond;
  }

  public execute() {
    this.polymerBond.setSecondMonomer(this.secondMonomer);
    this.polymerBond.firstMonomer.setBond(
      this.firstMonomerAttachmentPoint,
      this.polymerBond,
    );
    assert(this.polymerBond.secondMonomer);
    assert(this.secondMonomer.renderer);
    this.polymerBond.secondMonomer.setBond(
      this.secondMonomerAttachmentPoint,
      this.polymerBond,
    );
    this.polymerBond.firstMonomer.removePotentialBonds();
    this.polymerBond.secondMonomer.removePotentialBonds();

    this.polymerBond.moveToLinkedMonomers();
    this.polymerBond.firstMonomer.turnOffSelection();
    this.polymerBond.firstMonomer.turnOffHover();
    this.polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();
    this.polymerBond.secondMonomer.turnOffSelection();
    this.polymerBond.secondMonomer.turnOffHover();
    this.polymerBond.secondMonomer.turnOffAttachmentPointsVisibility();
    this.polymerBond.turnOffHover();

    console.log('execute PolymerBondAddAttachmentPointsOperation');
  }

  public invert() {
    const cleanAttachmentPoints = new PolymerBondCleanAttachmentPointsOperation(
      this.polymerBond,
    );
    cleanAttachmentPoints.execute();
    console.log('invert PolymerBondAddAttachmentPointsOperation');
  }
}

export class PolymerBondCleanAttachmentPointsOperation implements Operation {
  private secondMonomer;
  private firstMonomerAttachmentPoint;
  private secondMonomerAttachmentPoint;

  constructor(public polymerBond: PolymerBond) {
    this.polymerBond = polymerBond;
  }

  public execute() {
    this.firstMonomerAttachmentPoint =
      this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond);
    this.secondMonomerAttachmentPoint =
      this.polymerBond.secondMonomer?.getAttachmentPointByBond(
        this.polymerBond,
      );
    this.secondMonomer = this.polymerBond.secondMonomer;
    this.polymerBond.firstMonomer.removePotentialBonds();
    this.polymerBond.secondMonomer?.removePotentialBonds();
    this.polymerBond.firstMonomer.turnOffSelection();
    this.polymerBond.secondMonomer?.turnOffSelection();
    if (this.firstMonomerAttachmentPoint) {
      this.polymerBond.firstMonomer.unsetBond(this.firstMonomerAttachmentPoint);
    }
    if (this.secondMonomerAttachmentPoint) {
      this.polymerBond.secondMonomer?.unsetBond(
        this.secondMonomerAttachmentPoint,
      );
    }
    console.log('execute PolymerBondCleanAttachmentPointsOperation');
  }

  public invert() {
    const addAttachmentPoints = new PolymerBondAddAttachmentPointsOperation(
      this.polymerBond,
      this.secondMonomer,
      this.firstMonomerAttachmentPoint,
      this.secondMonomerAttachmentPoint,
    );
    addAttachmentPoints.execute();
    console.log('invert PolymerBondCleanAttachmentPointsOperation');
  }
}
