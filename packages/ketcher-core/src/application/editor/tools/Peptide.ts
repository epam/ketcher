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
import { Tool } from 'application/editor/tools/Tool';
import { Peptide } from 'domain/entities/Peptide';
import { Vec2 } from 'domain/entities';
import { CoreEditor, fromPeptideAddition } from 'application/editor';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import { MonomerItemType } from 'domain/types';

class PeptideTool implements Tool {
  private peptidePreview: Peptide | undefined;
  private peptidePreviewRenderer: PeptideRenderer | undefined;
  readonly PEPTIDE_PREVIEW_SCALE_FACTOR = 0.4;
  readonly PEPTIDE_PREVIEW_OFFSET_X = 8;
  readonly PEPTIDE_PREVIEW_OFFSET_Y = 12;
  constructor(private editor: CoreEditor, private peptide: MonomerItemType) {
    this.editor = editor;
    this.peptide = peptide;
  }

  mousedown() {
    if (!this.peptidePreviewRenderer) {
      throw new Error('peptidePreviewRenderer is not initialized');
    }

    fromPeptideAddition(
      this.editor.renderersContainer,
      this.peptide,
      new Vec2(
        this.editor.lastCursorPosition.x -
          this.peptidePreviewRenderer.width / 2,
        this.editor.lastCursorPosition.y -
          this.peptidePreviewRenderer.height / 2,
      ),
    );
    this.editor.renderersContainer.update(false);
  }

  mousemove() {
    this.peptidePreview?.moveAbsolute(
      new Vec2(
        this.editor.lastCursorPosition.x + this.PEPTIDE_PREVIEW_OFFSET_X,
        this.editor.lastCursorPosition.y + this.PEPTIDE_PREVIEW_OFFSET_Y,
      ),
    );
    this.peptidePreviewRenderer?.move();
  }

  public mouseLeaveClientArea() {
    this.peptidePreviewRenderer?.remove();
    this.peptidePreviewRenderer = undefined;
    this.peptidePreview = undefined;
  }

  public mouseover() {
    if (!this.peptidePreview) {
      this.peptidePreview = new Peptide(this.peptide);
      this.peptidePreviewRenderer = new PeptideRenderer(
        this.peptidePreview,
        this.PEPTIDE_PREVIEW_SCALE_FACTOR,
      );
      this.peptidePreviewRenderer.show(this.editor.theme);
    }
  }
}

export { PeptideTool };
