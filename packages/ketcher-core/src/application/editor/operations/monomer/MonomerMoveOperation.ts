/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { Operation } from 'domain/entities/Operation';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Struct } from 'domain/entities/struct';
import {
  getSGroupBracketContext,
  SGroupBracketPositionChanges,
} from '../sgroup/sgroupBracketPositions';

export class MonomerMoveOperation implements Operation {
  public monomer: BaseMonomer;
  private readonly bracketStruct?: Struct;
  private readonly bracketPositions?: SGroupBracketPositionChanges;
  private wasInverted = false;

  constructor(
    private readonly monomerMoveModelChange: () => BaseMonomer,
    private readonly invertMonomerMoveModelChange: () => BaseMonomer,
    monomer: BaseMonomer,
  ) {
    const bracketContext = getSGroupBracketContext(monomer);
    const originalX = monomer.position.x;
    const originalY = monomer.position.y;
    const positions = bracketContext
      ? new SGroupBracketPositionChanges(bracketContext.groups)
      : undefined;
    this.monomer = this.monomerMoveModelChange();
    if (
      bracketContext &&
      (monomer.position.x !== originalX || monomer.position.y !== originalY)
    ) {
      this.bracketStruct = bracketContext.struct;
      this.bracketPositions = positions;
      this.bracketPositions?.toggle(this.bracketStruct);
    }
  }

  public execute(renderersManager: RenderersManager) {
    this.monomer = this.monomerMoveModelChange();
    if (this.wasInverted && this.bracketStruct) {
      this.bracketPositions?.toggle(this.bracketStruct);
      this.wasInverted = false;
    }
    renderersManager.moveMonomer(this.monomer);
    if (this.bracketStruct) {
      renderersManager.rerenderSGroups();
    }
  }

  public invert(renderersManager: RenderersManager) {
    this.monomer = this.invertMonomerMoveModelChange();
    if (this.bracketStruct) {
      this.bracketPositions?.toggle(this.bracketStruct);
    }
    this.wasInverted = true;
    renderersManager.moveMonomer(this.monomer);
    if (this.bracketStruct) {
      renderersManager.rerenderSGroups();
    }
  }
}
