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

import { PolymerBond } from 'domain/entities/PolymerBond';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';

export class PolymerBondAddOperation implements Operation {
  constructor(private polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.addPolymerBond(this.polymerBond);
  }
}

export class PolymerBondDeleteOperation implements Operation {
  constructor(private polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.deletePolymerBond(this.polymerBond);
  }
}

export class PolymerBondMoveOperation implements Operation {
  constructor(private polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.movePolymerBond(this.polymerBond);
  }
}

export class PolymerBondShowInfoOperation implements Operation {
  constructor(private polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.showPolymerBondInformation(this.polymerBond);
  }
}

export class PolymerBondCancelCreationOperation implements Operation {
  constructor(private polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.cancelPolymerBondCreation(this.polymerBond);
  }
}

export class PolymerBondFinishCreationOperation implements Operation {
  constructor(private polymerBond: PolymerBond) {}

  public execute(renderersManager: RenderersManager) {
    renderersManager.finishPolymerBondCreation(this.polymerBond);
  }
}
