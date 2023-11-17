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
import { BaseTool } from 'application/editor/tools/Tool';
import { Peptide } from 'domain/entities/Peptide';
import { Chem } from 'domain/entities/Chem';
import { Sugar } from 'domain/entities/Sugar';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Vec2 } from 'domain/entities';
import { CoreEditor } from 'application/editor';
import { BaseMonomerRenderer } from 'application/render/renderers';
import { MonomerItemType } from 'domain/types';
import { monomerFactory } from '../operations/monomer/monomerFactory';
import assert from 'assert';
import Coordinates from '../shared/coordinates';

class MonomerTool implements BaseTool {
  private monomerPreview:
    | Peptide
    | Chem
    | Sugar
    | RNABase
    | Phosphate
    | undefined;

  private monomerPreviewRenderer: BaseMonomerRenderer | undefined;
  readonly MONOMER_PREVIEW_SCALE_FACTOR = 0.4;
  readonly MONOMER_PREVIEW_OFFSET_X = 45;
  readonly MONOMER_PREVIEW_OFFSET_Y = 45;
  constructor(private editor: CoreEditor, private monomer: MonomerItemType) {
    this.editor = editor;
    this.monomer = monomer;
  }

  mousedown() {
    assert(this.monomerPreviewRenderer);
    const position = Coordinates.canvasToModel(
      new Vec2(
        this.editor.lastCursorPositionOfCanvas.x,
        this.editor.lastCursorPositionOfCanvas.y,
      ),
    );
    const modelChanges = this.editor.drawingEntitiesManager.addMonomer(
      this.monomer,
      // We convert monomer coordinates from pixels to angstroms
      // because the model layer (like BaseMonomer) should not work with pixels
      position,
    );

    this.editor.renderersContainer.update(modelChanges);
  }

  mousemove() {
    const position = Coordinates.canvasToModel(
      new Vec2(
        this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X,
        this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y,
      ),
    );
    this.monomerPreview?.moveAbsolute(position);
    this.monomerPreviewRenderer?.move();
  }

  public mouseLeaveClientArea() {
    this.hidePreview();
  }

  public mouseover() {
    if (!this.monomerPreview) {
      const [Monomer, MonomerRenderer] = monomerFactory(this.monomer);

      this.monomerPreview = new Monomer(this.monomer);
      this.monomerPreviewRenderer = new MonomerRenderer(
        this.monomerPreview,
        this.MONOMER_PREVIEW_SCALE_FACTOR,
        false,
      );
      this.monomerPreviewRenderer?.show(this.editor.theme);
    }
  }

  hidePreview() {
    this.monomerPreviewRenderer?.remove();
    this.monomerPreviewRenderer = undefined;
    this.monomerPreview = undefined;
  }

  destroy(): void {
    this.hidePreview();
  }
}

export { MonomerTool };
