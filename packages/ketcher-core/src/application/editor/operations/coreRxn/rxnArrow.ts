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

import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';

export class RxnArrowAddOperation implements Operation {
  public rxnArrow: RxnArrow;
  public priority = 2;

  constructor(
    public addArrowChangeModel: (arrow?: RxnArrow) => RxnArrow,
    public deleteArrowChangeModel: (arrow: RxnArrow) => void,
  ) {
    this.rxnArrow = this.addArrowChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.rxnArrow = this.addArrowChangeModel(this.rxnArrow);
    renderersManager.addRxnArrow(this.rxnArrow);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.rxnArrow) {
      this.deleteArrowChangeModel(this.rxnArrow);
      renderersManager.deleteRxnArrow(this.rxnArrow);
    }
  }
}

export class RxnArrowDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public rxnArrow: RxnArrow,
    public deleteArrowChangeModel: (arrow: RxnArrow) => void,
    public addArrowChangeModel: (arrow: RxnArrow) => RxnArrow,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteArrowChangeModel(this.rxnArrow);
    renderersManager.deleteRxnArrow(this.rxnArrow);
  }

  public invert(renderersManager: RenderersManager) {
    this.addArrowChangeModel(this.rxnArrow);
    renderersManager.addRxnArrow(this.rxnArrow);
  }
}
