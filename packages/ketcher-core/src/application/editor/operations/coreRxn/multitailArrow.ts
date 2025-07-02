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
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';

export class MultitailArrowAddOperation implements Operation {
  public multitailArrow: MultitailArrow;
  public priority = 2;

  constructor(
    public addArrowChangeModel: (arrow?: MultitailArrow) => MultitailArrow,
    public deleteArrowChangeModel: (arrow: MultitailArrow) => void,
  ) {
    this.multitailArrow = this.addArrowChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.multitailArrow = this.addArrowChangeModel(this.multitailArrow);
    renderersManager.addMultitailArrow(this.multitailArrow);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.multitailArrow) {
      this.deleteArrowChangeModel(this.multitailArrow);
      renderersManager.deleteMultitailArrow(this.multitailArrow);
    }
  }
}

export class MultitailArrowDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public multitailArrow: MultitailArrow,
    public deleteArrowChangeModel: (arrow: MultitailArrow) => void,
    public addArrowChangeModel: (arrow: MultitailArrow) => MultitailArrow,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteArrowChangeModel(this.multitailArrow);
    renderersManager.deleteMultitailArrow(this.multitailArrow);
  }

  public invert(renderersManager: RenderersManager) {
    this.addArrowChangeModel(this.multitailArrow);
    renderersManager.addMultitailArrow(this.multitailArrow);
  }
}
