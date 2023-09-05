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
import { BaseMonomerRenderer } from 'application/render/renderers';
import { fromPolymerBondAddition } from 'application/editor/actions/polymerBond';
import { CoreEditor } from 'application/editor';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Vec2 } from 'domain/entities';
import assert from 'assert';
import { BondService } from 'domain/services/bond/BondService';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

class PolymerBond implements Tool {
  private bondRenderer?: PolymerBondRenderer;
  private lastHoveredMonomerRenderer?: BaseMonomerRenderer;
  private hoveredBondRenderer?: PolymerBondRenderer;
  constructor(private editor: CoreEditor) {
    this.editor = editor;
  }

  mousedown(event) {
    const selectedItem = event.target.__data__;
    if (selectedItem instanceof BaseMonomerRenderer) {
      const freeAttachmentPoint = selectedItem.monomer.firstFreeAttachmentPoint;

      if (!freeAttachmentPoint) {
        this.editor.events.error.dispatch(
          "Selected monomer doesn't have any free attachment points",
        );
        return;
      }
      const { top: offsetTop, left: offsetLeft } = this.editor.canvasOffset;

      assert(selectedItem.monomer.renderer);

      fromPolymerBondAddition(this.editor.renderersContainer, {
        firstMonomer: selectedItem.monomer,
        startPosition: selectedItem.monomer.renderer.center,
        endPosition: new Vec2(
          event.clientX - offsetLeft,
          event.clientY - offsetTop,
        ),
      });
      this.editor.renderersContainer.update(false);
      this.bondRenderer =
        selectedItem.monomer.getPotentialBond(freeAttachmentPoint)?.renderer;
    }
  }

  private handleBondDragging(event: MouseEvent) {
    assert(this.bondRenderer);
    const { top: offsetTop, left: offsetLeft } = this.editor.canvasOffset;
    this.bondRenderer.polymerBond.moveBondEndAbsolute(
      event.clientX - offsetLeft,
      event.clientY - offsetTop,
    );
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

  mousemove(event) {
    const hoveredElementRenderer = event.toElement.__data__;
    const isBondHovered = hoveredElementRenderer instanceof PolymerBondRenderer;
    const isMonomerHovered =
      hoveredElementRenderer instanceof BaseMonomerRenderer;
    const isMonomerSelected = hoveredElementRenderer?.monomer?.selected;
    const isMonomerLastHovered =
      this.lastHoveredMonomerRenderer === hoveredElementRenderer;

    if (isMonomerHovered && !isMonomerSelected && !isMonomerLastHovered) {
      hoveredElementRenderer.monomer.turnOnSelection();
      this.lastHoveredMonomerRenderer = hoveredElementRenderer;
      this.setPotentialBondToAttachmentPoint(this.lastHoveredMonomerRenderer);
    } else if (
      !isMonomerHovered &&
      this.lastHoveredMonomerRenderer &&
      this.lastHoveredMonomerRenderer !==
        this.bondRenderer?.polymerBond?.firstMonomer.renderer
    ) {
      this.lastHoveredMonomerRenderer.monomer.turnOffSelection();
      this.lastHoveredMonomerRenderer.monomer.removePotentialBonds();
      this.lastHoveredMonomerRenderer = undefined;
    }

    if (this.bondRenderer) {
      this.handleBondDragging(event);
    } else if (isBondHovered && hoveredElementRenderer.polymerBond.finished) {
      this.hoveredBondRenderer = hoveredElementRenderer;
      this.hoveredBondRenderer.polymerBond.turnOnSelection();
    } else if (
      this.hoveredBondRenderer &&
      this.hoveredBondRenderer.polymerBond.finished
    ) {
      this.hoveredBondRenderer.polymerBond.turnOffSelection();
      this.hoveredBondRenderer = undefined;
    }

    this.editor.renderersContainer.update(false);
  }

  private finishBondCreation(secondMonomer: BaseMonomer) {
    assert(this.bondRenderer);
    if (!secondMonomer.hasFreeAttachmentPoint) {
      this.editor.events.error.dispatch(
        "Monomers don't have any connection point available",
      );
      BondService.deleteBondWithAllLinks(
        this.editor.renderersContainer,
        this.bondRenderer.polymerBond,
        secondMonomer,
      );
      return;
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
    BondService.finishBondCreation(
      firstMonomerAttachmentPoint,
      secondMonomerAttachmentPoint,
      secondMonomer,
      this.bondRenderer.polymerBond,
    );
    this.lastHoveredMonomerRenderer = undefined;
  }

  mouseup(event) {
    const hoveredElementRenderer = event.toElement.__data__;
    const isMonomerHovered =
      hoveredElementRenderer instanceof BaseMonomerRenderer;
    const isFirstMonomerHovered =
      hoveredElementRenderer ===
      this.bondRenderer?.polymerBond?.firstMonomer?.renderer;

    if (isMonomerHovered && !isFirstMonomerHovered) {
      this.finishBondCreation(hoveredElementRenderer.monomer);
    } else if (this.bondRenderer) {
      BondService.deleteBondWithAllLinks(
        this.editor.renderersContainer,
        this.bondRenderer.polymerBond,
      );
    }
    this.bondRenderer = undefined;
    this.editor.renderersContainer.update(false);
  }
}

export { PolymerBond };
