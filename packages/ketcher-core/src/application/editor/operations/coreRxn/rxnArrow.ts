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
import { RxnArrow } from 'domain/entities/CoreRxnArrow';

export class RxnArrowAddOperation implements Operation {
  public arrow: RxnArrow;
  public priority = 2;

  constructor(
    public addArrowChangeModel: (atom?: RxnArrow) => RxnArrow,
    public deleteArrowChangeModel: (atom: RxnArrow) => void,
  ) {
    this.arrow = this.addArrowChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.arrow = this.addArrowChangeModel(this.arrow);
    renderersManager.addRxnArrow(this.arrow);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.arrow) {
      this.deleteArrowChangeModel(this.arrow);
      renderersManager.deleteRxnArrow(this.arrow);
    }
  }
}

export class RxnArrowDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public arrow: RxnArrow,
    public deleteArrowChangeModel: () => void,
    public addArrowChangeModel: (atom?: RxnArrow) => RxnArrow,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteArrowChangeModel();
    renderersManager.addRxnArrow(this.arrow);
  }

  public invert(renderersManager: RenderersManager) {
    this.addArrowChangeModel(this.arrow);
    renderersManager.deleteRxnArrow(this.arrow);
  }
}
