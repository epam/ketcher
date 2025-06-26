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
import { RxnPlus } from 'domain/entities/CoreRxnPlus';

export class RxnPlusAddOperation implements Operation {
  public rxnPlus: RxnPlus;
  public priority = 2;

  constructor(
    public addRxnPlusChangeModel: (rxnPlus?: RxnPlus) => RxnPlus,
    public deleteRxnPlusChangeModel: (rxnPlus: RxnPlus) => void,
  ) {
    this.rxnPlus = this.addRxnPlusChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.rxnPlus = this.addRxnPlusChangeModel(this.rxnPlus);
    renderersManager.addRxnPlus(this.rxnPlus);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.rxnPlus) {
      this.deleteRxnPlusChangeModel(this.rxnPlus);
      renderersManager.deleteRxnPlus(this.rxnPlus);
    }
  }
}

export class RxnPlusDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public rxnPlus: RxnPlus,
    public deleteRxnPlusChangeModel: (rxnPlus: RxnPlus) => void,
    public addRxnPlusChangeModel: (rxnPlus: RxnPlus) => RxnPlus,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteRxnPlusChangeModel(this.rxnPlus);
    renderersManager.deleteRxnPlus(this.rxnPlus);
  }

  public invert(renderersManager: RenderersManager) {
    this.addRxnPlusChangeModel(this.rxnPlus);
    renderersManager.addRxnPlus(this.rxnPlus);
  }
}
