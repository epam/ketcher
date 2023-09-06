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

import { Vec2 } from 'domain/entities';
import { ReStruct } from '../../../render';

import { BaseOperation } from '../base';
import { OperationType } from '../OperationType';
import { MonomerItemType } from 'domain/types';

import assert from 'assert';

import { monomerFactory } from './monomerFactory';
import { fromPolymerBondAddition } from 'application/editor/actions/polymerBond';
import { BondService } from 'domain/services/bond/BondService';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

type Data = {
  sugar: MonomerItemType;
  sugarPosition: Vec2 | undefined;
  rnaBase: MonomerItemType | undefined;
  rnaBasePosition: Vec2 | undefined;
  phosphate: MonomerItemType | undefined;
  phosphatePosition: Vec2 | undefined;
};

class PresetAdd extends BaseOperation {
  data: Data;
  renderersContainer: ReStruct;
  private bondRenderer?: PolymerBondRenderer; // only for sugar, in two sides

  constructor(renderersContainer: ReStruct, presets: Data) {
    super(OperationType.ATOM_ADD);
    this.data = presets;
    this.renderersContainer = renderersContainer;
  }

  execute(restruct: ReStruct) {
    const {
      sugar,
      sugarPosition,
      phosphate,
      phosphatePosition,
      rnaBase,
      rnaBasePosition,
    } = this.data;

    const struct = restruct.molecule;

    const [Sugar, SugarRenderer] = monomerFactory(sugar);
    const newSugar = new Sugar(sugar, sugarPosition);
    const sugarRenderer = new SugarRenderer(newSugar);
    struct.monomers.set(newSugar.id, newSugar);
    restruct.monomers.set(newSugar.id, sugarRenderer);

    let rnaBaseRenderer;
    let phosphateRenderer;
    if (rnaBase && rnaBasePosition) {
      const [RNABase, RNABaseRenderer] = monomerFactory(rnaBase);
      const newRNABase = new RNABase(rnaBase, rnaBasePosition);
      rnaBaseRenderer = new RNABaseRenderer(newRNABase);
      struct.monomers.set(newRNABase.id, newRNABase);
      restruct.monomers.set(newRNABase.id, rnaBaseRenderer);
    }

    if (phosphate && phosphatePosition) {
      const [Phosphate, PhosphateRenderer] = monomerFactory(phosphate);
      const newPhosphate = new Phosphate(phosphate, phosphatePosition);
      phosphateRenderer = new PhosphateRenderer(newPhosphate);
      struct.monomers.set(newPhosphate.id, newPhosphate);
      restruct.monomers.set(newPhosphate.id, phosphateRenderer);
    }

    this.renderersContainer.update(false);
    this.makeBonds({ sugarRenderer, rnaBaseRenderer, phosphateRenderer });
  }

  invert() {
    const inverted = new PresetAdd(this.renderersContainer, this.data);
    inverted.data = this.data;
    return inverted;
  }

  private makeBonds(monomers) {
    const { sugarRenderer, rnaBaseRenderer, phosphateRenderer } = monomers;
    const R1AttachmentPoint = sugarRenderer?.monomer.R1AttachmentPoint;
    const R2AttachmentPoint = sugarRenderer?.monomer.R2AttachmentPoint;

    if (R1AttachmentPoint && rnaBaseRenderer) {
      fromPolymerBondAddition(this.renderersContainer, {
        firstMonomer: sugarRenderer.monomer,
        startPosition: {
          x: sugarRenderer.monomer.renderer.center.x,
          y: sugarRenderer.monomer.renderer.center.y,
        },
        endPosition: new Vec2(0, 0),
      });

      this.bondRenderer =
        sugarRenderer.monomer?.getPotentialBond(R1AttachmentPoint)?.renderer;

      assert(this.bondRenderer);

      sugarRenderer.monomer.setPotentialBond(
        R1AttachmentPoint,
        this.bondRenderer.polymerBond,
      );
      rnaBaseRenderer.monomer.setPotentialBond(
        rnaBaseRenderer?.monomer.R2AttachmentPoint,
        this.bondRenderer.polymerBond,
      );

      this.finishBondCreation(rnaBaseRenderer.monomer);
      this.bondRenderer = undefined;
      this.renderersContainer.update(false);
    }

    if (R2AttachmentPoint && phosphateRenderer) {
      fromPolymerBondAddition(this.renderersContainer, {
        firstMonomer: phosphateRenderer.monomer,
        startPosition: {
          x: phosphateRenderer.monomer.renderer.center.x,
          y: phosphateRenderer.monomer.renderer.center.y,
        },
        endPosition: new Vec2(0, 0),
      });

      this.bondRenderer =
        phosphateRenderer.monomer?.getPotentialBond(
          R1AttachmentPoint,
        )?.renderer;

      assert(this.bondRenderer);

      sugarRenderer.monomer.setPotentialBond(
        R2AttachmentPoint,
        this.bondRenderer.polymerBond,
      );
      phosphateRenderer.monomer.setPotentialBond(
        phosphateRenderer?.monomer.R1AttachmentPoint,
        this.bondRenderer.polymerBond,
      );

      this.finishBondCreation(sugarRenderer.monomer);
      this.bondRenderer = undefined;
    }
  }

  private finishBondCreation(secondMonomer: BaseMonomer) {
    assert(this.bondRenderer);

    const firstMonomerAttachmentPoint =
      this.bondRenderer.polymerBond.firstMonomer.R1AttachmentPoint;
    const secondMonomerAttachmentPoint = secondMonomer.R2AttachmentPoint;
    assert(firstMonomerAttachmentPoint);
    assert(secondMonomerAttachmentPoint);

    BondService.finishBondCreation(
      firstMonomerAttachmentPoint,
      secondMonomerAttachmentPoint,
      secondMonomer,
      this.bondRenderer.polymerBond,
    );
  }
}

export { PresetAdd };
