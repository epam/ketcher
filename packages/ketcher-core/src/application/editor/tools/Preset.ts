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

import { fromPresetAddition, CoreEditor } from 'application/editor';
import { BaseMonomerRenderer } from 'application/render/renderers';
import { MonomerItemType } from 'domain/types';
import { monomerFactory } from '../operations/monomer/monomerFactory';
import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';

class PresetTool implements Tool {
  rnaBase: MonomerItemType | undefined;
  sugar: MonomerItemType | undefined;
  phosphate: MonomerItemType | undefined;

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

    if (!this.sugar) {
      throw new Error('no sugar in preset');
    }

    fromPresetAddition(this.editor.renderersContainer, {
      sugar: this.sugar,
      sugarPosition: new Vec2(
        this.editor.lastCursorPosition.x - this.sugarPreviewRenderer.width / 2,
        this.editor.lastCursorPosition.y - this.sugarPreviewRenderer.height / 2,
      ),
      phosphate: this.phosphate,
      phosphatePosition: this.phosphatePreviewRenderer
        ? new Vec2(
            this.editor.lastCursorPosition.x -
              this.phosphatePreviewRenderer.width / 2 +
              this.sugarPreviewRenderer?.width +
              30,
            this.editor.lastCursorPosition.y -
              this.phosphatePreviewRenderer.height / 2,
          )
        : undefined,
      rnaBase: this.rnaBase,
      rnaBasePosition: this.rnaBasePreviewRenderer
        ? new Vec2(
            this.editor.lastCursorPosition.x -
              this.rnaBasePreviewRenderer.width / 2,
            this.editor.lastCursorPosition.y -
              this.rnaBasePreviewRenderer.height / 2 +
              this.sugarPreviewRenderer.height +
              30,
          )
        : undefined,
    });

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
        this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X,
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
    if (!this.sugar) {
      throw new Error('no sugar in preset');
    }

    if (this.sugarPreview) {
      return;
    }

    const [Sugar, SugarRenderer] = monomerFactory(this.sugar);
    this.sugarPreview = new Sugar(this.sugar);

    this.sugarPreviewRenderer = new SugarRenderer(
      this.sugarPreview,
      this.MONOMER_PREVIEW_SCALE_FACTOR,
    );

    this.sugarPreviewRenderer?.show(this.editor.theme);

    if (this.rnaBase) {
      const [RNABase, RNABaseRenderer] = monomerFactory(this.rnaBase);
      this.rnaBasePreview = new RNABase(this.rnaBase);
      this.rnaBasePreviewRenderer = new RNABaseRenderer(
        this.rnaBasePreview,
        this.MONOMER_PREVIEW_SCALE_FACTOR,
      );

      this.rnaBasePreviewRenderer?.show(this.editor.theme);
    }

    if (this.phosphate) {
      const [Phosphate, PhosphateRenderer] = monomerFactory(this.phosphate);

      this.phosphatePreview = new Phosphate(this.phosphate);

      this.phosphatePreviewRenderer = new PhosphateRenderer(
        this.phosphatePreview,
        this.MONOMER_PREVIEW_SCALE_FACTOR,
      );

      this.phosphatePreviewRenderer?.show(this.editor.theme);
    }
  }
}

export { PresetTool };
