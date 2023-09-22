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
import { BaseMonomerRenderer } from 'application/render/renderers';
import { CoreEditor } from 'application/editor';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Vec2 } from 'domain/entities';
import assert from 'assert';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { BaseTool } from 'application/editor/tools/Tool';

class PolymerBond implements BaseTool {
  private bondRenderer?: PolymerBondRenderer;
  constructor(private editor: CoreEditor) {
    this.editor = editor;
  }

  public mousedown(event) {
    const selectedRenderer = event.target.__data__;
    if (selectedRenderer instanceof BaseMonomerRenderer) {
      const freeAttachmentPoint =
        selectedRenderer.monomer.firstFreeAttachmentPoint;

      if (!freeAttachmentPoint) {
        this.editor.events.error.dispatch(
          "Selected monomer doesn't have any free attachment points",
        );
        return;
      }
      const { top: offsetTop, left: offsetLeft } = this.editor.canvasOffset;

      const { polymerBond, command: modelChanges } =
        this.editor.drawingEntitiesManager.addPolymerBond(
          selectedRenderer.monomer,
          selectedRenderer.center,
          new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop),
        );

      this.editor.renderersContainer.update(modelChanges);
      this.bondRenderer = polymerBond.renderer;
    }
  }

  public mousemove(event) {
    if (this.bondRenderer) {
      const { top: offsetTop, left: offsetLeft } = this.editor.canvasOffset;
      const modelChanges = this.editor.drawingEntitiesManager.movePolymerBond(
        this.bondRenderer.polymerBond,
        new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop),
      );
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public mouseLeavePolymerBond(event) {
    if (this.bondRenderer) return;

    const renderer: PolymerBondRenderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.hidePolymerBondInformation(
        renderer.polymerBond,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseOverPolymerBond(event) {
    if (this.bondRenderer) return;

    const renderer: PolymerBondRenderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.showPolymerBondInformation(
        renderer.polymerBond,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseOverMonomer(event) {
    const renderer: BaseMonomerRenderer = event.target.__data__;
    let modelChanges;

    if (this.bondRenderer) {
      modelChanges =
        this.editor.drawingEntitiesManager.intendToFinishBondCreation(
          renderer.monomer,
          this.bondRenderer?.polymerBond,
        );
    } else {
      modelChanges =
        this.editor.drawingEntitiesManager.intendToStartBondCreation(
          renderer.monomer,
        );
    }

    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseLeaveMonomer(event) {
    const renderer: BaseMonomerRenderer = event.target.__data__;
    if (renderer !== this.bondRenderer?.polymerBond?.firstMonomer?.renderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelIntentionToFinishBondCreation(
          renderer.monomer,
        );
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  private finishBondCreation(secondMonomer: BaseMonomer) {
    assert(this.bondRenderer);
    if (!secondMonomer.hasFreeAttachmentPoint) {
      this.editor.events.error.dispatch(
        "Monomers don't have any connection point available",
      );
      return this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
        this.bondRenderer.polymerBond,
      );
    }
    const firstMonomerAttachmentPoint =
      this.bondRenderer.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
        this.bondRenderer.polymerBond,
      );
    const secondMonomerAttachmentPoint =
      secondMonomer.availableAttachmentPointForBondEnd;
    assert(firstMonomerAttachmentPoint);
    assert(secondMonomerAttachmentPoint);
    if (firstMonomerAttachmentPoint === secondMonomerAttachmentPoint) {
      this.editor.events.error.dispatch(
        'You have connected monomers with attachment points of the same group',
      );
    }
    return this.editor.drawingEntitiesManager.finishPolymerBondCreation(
      this.bondRenderer.polymerBond,
      secondMonomer,
      firstMonomerAttachmentPoint,
      secondMonomerAttachmentPoint,
    );
  }

  public mouseup() {
    if (this.bondRenderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
          this.bondRenderer.polymerBond,
        );
      this.editor.renderersContainer.update(modelChanges);
      this.bondRenderer = undefined;
    }
  }

  public mouseUpMonomer(event) {
    const renderer = event.toElement.__data__;
    const isFirstMonomerHovered =
      renderer === this.bondRenderer?.polymerBond?.firstMonomer?.renderer;

    if (this.bondRenderer && !isFirstMonomerHovered) {
      const modelChanges = this.finishBondCreation(renderer.monomer);
      this.editor.renderersContainer.update(modelChanges);
      this.bondRenderer = undefined;
      event.stopPropagation();
    }
  }

  public destroy() {}
}

export { PolymerBond };
