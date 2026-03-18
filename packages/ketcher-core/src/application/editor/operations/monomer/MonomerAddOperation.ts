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

import { Operation } from 'domain/entities/Operation';
import { BaseMonomer } from 'domain/entities';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

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
