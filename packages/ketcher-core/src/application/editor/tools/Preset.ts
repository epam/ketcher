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
import { Tool, IRnaPreset } from 'application/editor/tools/Tool';
import { Sugar } from 'domain/entities/Sugar';
import { Vec2 } from 'domain/entities';
import assert from 'assert';

import { CoreEditor, fromMonomerAddition } from 'application/editor';
import { BaseMonomerRenderer } from 'application/render/renderers';
import { MonomerItemType } from 'domain/types';
import { monomerFactory } from '../operations/monomer/monomerFactory';
import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { fromPolymerBondAddition } from 'application/editor/actions/polymerBond';
import { BondService } from 'domain/services/bond/BondService';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';

class PresetTool implements Tool {
  rnaBase: MonomerItemType | undefined;
  sugar: MonomerItemType | undefined;
  phosphate: MonomerItemType | undefined;
  private bondRenderer?: PolymerBondRenderer; // only for sugar, in two sides

  private rnaBasePreview: RNABase | undefined;
  private phosphatePreview: Phosphate | undefined;
  private sugarPreview: Sugar | undefined;
  private rnaBasePreviewRenderer: BaseMonomerRenderer | undefined;
  private phosphatePreviewRenderer: BaseMonomerRenderer | undefined;
  private sugarPreviewRenderer: BaseMonomerRenderer | undefined;
  readonly MONOMER_PREVIEW_SCALE_FACTOR = 0.25;
  readonly MONOMER_PREVIEW_OFFSET_X = 8;
  readonly MONOMER_PREVIEW_OFFSET_Y = 12;
  constructor(private editor: CoreEditor, preset: IRnaPreset) {
    this.editor = editor;
    if (preset?.base) {
      this.rnaBase = preset?.base;
    }
    if (preset?.phosphate) {
      this.phosphate = preset?.phosphate;
    }
    if (preset?.sugar) {
      this.sugar = preset?.sugar;
    }
  }

  mousedown() {
    if (!this.sugarPreviewRenderer) {
      throw new Error('monomerPreviewRenderer is not initialized');
    }

    if (!this.rnaBase) {
      throw new Error('no base in preset');
    }

    if (!this.sugar) {
      throw new Error('no sugar in preset');
    }

    if (!this.phosphate) {
      throw new Error('no phosphate in preset');
    }

    fromMonomerAddition(
      this.editor.renderersContainer,
      this.rnaBase,
      new Vec2(
        this.editor.lastCursorPosition.x -
          this.rnaBasePreviewRenderer.width / 2,
        this.editor.lastCursorPosition.y -
          this.rnaBasePreviewRenderer.height / 2,
      ),
    );

    fromMonomerAddition(
      this.editor.renderersContainer,
      this.sugar,
      new Vec2(
        this.editor.lastCursorPosition.x - this.sugarPreviewRenderer.width / 2,
        this.editor.lastCursorPosition.y -
          this.sugarPreviewRenderer.height / 2 -
          this.rnaBasePreviewRenderer.height -
          15,
      ),
    );

    fromMonomerAddition(
      this.editor.renderersContainer,
      this.phosphate,
      new Vec2(
        this.editor.lastCursorPosition.x -
          this.phosphatePreviewRenderer.width / 2 +
          this.rnaBasePreviewRenderer?.width +
          15,
        this.editor.lastCursorPosition.y -
          this.phosphatePreviewRenderer.height / 2 -
          this.rnaBasePreviewRenderer.height -
          15,
      ),
    );

    // this.makeBonds();

    this.editor.renderersContainer.update(false);
  }

  mousemove() {
    this.sugarPreview?.moveAbsolute(
      new Vec2(
        this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X,
        this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y,
      ),
    );

    this.rnaBasePreview?.moveAbsolute(
      new Vec2(
        this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X + 2,
        this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y + 18,
      ),
    );

    this.phosphatePreview?.moveAbsolute(
      new Vec2(
        this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X + 18,
        this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y,
      ),
    );

    this.rnaBasePreviewRenderer?.move();
    this.phosphatePreviewRenderer?.move();
    this.sugarPreviewRenderer?.move();
  }

  public mouseLeaveClientArea() {
    this.sugarPreviewRenderer?.remove();
    this.sugarPreviewRenderer = undefined;
    this.sugarPreview = undefined;
    this.phosphatePreviewRenderer?.remove();
    this.phosphatePreviewRenderer = undefined;
    this.phosphatePreview = undefined;
    this.rnaBasePreviewRenderer?.remove();
    this.rnaBasePreviewRenderer = undefined;
    this.rnaBasePreview = undefined;
  }

  public mouseover() {
    if (!this.sugarPreview) {
      const [RNABase, RNABaseRenderer] = monomerFactory(this.rnaBase);
      const [Phosphate, PhosphateRenderer] = monomerFactory(this.phosphate);
      const [Sugar, SugarRenderer] = monomerFactory(this.sugar);

      this.rnaBasePreview = new RNABase(this.rnaBase);
      this.phosphatePreview = new Phosphate(this.phosphate);
      this.sugarPreview = new Sugar(this.sugar);

      this.rnaBasePreviewRenderer = new RNABaseRenderer(
        this.rnaBasePreview,
        this.MONOMER_PREVIEW_SCALE_FACTOR,
      );
      this.sugarPreviewRenderer = new SugarRenderer(
        this.sugarPreview,
        this.MONOMER_PREVIEW_SCALE_FACTOR,
      );
      this.phosphatePreviewRenderer = new PhosphateRenderer(
        this.phosphatePreview,
        this.MONOMER_PREVIEW_SCALE_FACTOR,
      );

      this.sugarPreviewRenderer?.show(this.editor.theme);
      this.rnaBasePreviewRenderer?.show(this.editor.theme);
      this.phosphatePreviewRenderer?.show(this.editor.theme);
    }
  }

  private makeBonds() {
    const R1AttachmentPoint = this.sugarPreview?.R1AttachmentPoint;
    const freeAttachmentPoint =
      this.sugarPreviewRenderer?.monomer?.firstFreeAttachmentPoint;

    console.log('R1AttachmentPoint: ', R1AttachmentPoint);
    const R2AttachmentPoint = this.sugarPreview?.R2AttachmentPoint;
    if (R1AttachmentPoint) {
      console.log(this.sugarPreview);
      console.log(this.sugarPreviewRenderer);
      console.log(this.rnaBasePreview);
      console.log(this.rnaBasePreviewRenderer);
      assert(this.sugarPreviewRenderer);
      console.log(freeAttachmentPoint);

      fromPolymerBondAddition(this.editor.renderersContainer, {
        firstMonomer: this.sugarPreviewRenderer.monomer,
        startPosition: this.sugarPreviewRenderer.monomer.renderer.center,
        endPosition: new Vec2(
          this.sugarPreviewRenderer.monomer.renderer.center.x + 1,
          this.sugarPreviewRenderer.monomer.renderer.center.y + 1,
        ),
      });
      console.log(
        'this.sugarPreviewRenderer.monomer.renderer.center: ',
        this.sugarPreviewRenderer.monomer.renderer.center,
      );
      this.bondRenderer =
        this.sugarPreviewRenderer?.monomer?.getPotentialBond(
          freeAttachmentPoint,
        )?.renderer;

      // this.sugarPreview.getPotentialBond(R1AttachmentPoint)?.renderer;

      this.setPotentialBondToAttachmentPoint(this.rnaBasePreviewRenderer); /// ВОТ ТУТ
      console.log('bondRenderer', this.bondRenderer);

      const firstMonomerAttachmentPoint =
        this.bondRenderer.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
          this.bondRenderer.polymerBond,
        );
      const secondMonomerAttachmentPoint =
        this.rnaBasePreview.availableAttachmentPointForBondEnd;
      console.log(firstMonomerAttachmentPoint);
      console.log(secondMonomerAttachmentPoint);
      console.log(this.rnaBasePreview);

      BondService.finishBondCreation(
        firstMonomerAttachmentPoint,
        secondMonomerAttachmentPoint,
        this.rnaBasePreview,
        this.bondRenderer.polymerBond,
      );
    }

    this.bondRenderer = undefined;
  }

  private setPotentialBondToAttachmentPoint(
    monomerRenderer: BaseMonomerRenderer,
  ) {
    if (!this.bondRenderer) return;

    const attachmentPoint =
      monomerRenderer.monomer.availableAttachmentPointForBondEnd;

    if (!attachmentPoint) return;

    monomerRenderer.monomer.setPotentialBond(
      attachmentPoint,
      this.bondRenderer.polymerBond,
    );
  }
}

export { PresetTool };
