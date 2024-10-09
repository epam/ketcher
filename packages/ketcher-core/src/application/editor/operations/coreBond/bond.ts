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
import { Bond } from 'domain/entities/CoreBond';

export class BondAddOperation implements Operation {
  public bond: Bond;
  constructor(
    public addBondChangeModel: (bond?: Bond) => Bond,
    public deleteBondChangeModel: (bond?: Bond) => void,
  ) {
    this.bond = this.addBondChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.bond = this.addBondChangeModel(this.bond);
    renderersManager.addBond(this.bond);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.bond) {
      this.deleteBondChangeModel(this.bond);
      renderersManager.deleteBond(this.bond);
    }
  }
}
