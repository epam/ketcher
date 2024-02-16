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
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import assert from 'assert';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { BaseTool } from 'application/editor/tools/Tool';
import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { Coordinates } from '../shared/coordinates';
import { AttachmentPointName } from 'domain/types';

class PolymerBond implements BaseTool {
  private bondRenderer?: PolymerBondRenderer;
  private isBondConnectionModalOpen = false;
  history: EditorHistory;

  constructor(private editor: CoreEditor) {
    this.editor = editor;
    this.history = new EditorHistory(this.editor);
  }

  public mouseDownAttachmentPoint(event) {
    const selectedRenderer = event.target.__data__;
    if (
      selectedRenderer instanceof BaseMonomerRenderer &&
      !selectedRenderer.monomer.isAttachmentPointUsed(event.attachmentPointName)
    ) {
      selectedRenderer.monomer.setChosenFirstAttachmentPoint(
        event.attachmentPointName,
      );
    }
  }

  private removeBond(): void {
    if (this.bondRenderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
          this.bondRenderer.polymerBond,
        );
      this.editor.renderersContainer.update(modelChanges);
      this.bondRenderer = undefined;
    }
  }

  public mousedown(event) {
    const selectedRenderer = event.target.__data__;
    if (selectedRenderer instanceof BaseMonomerRenderer) {
      const startAttachmentPoint =
        selectedRenderer.monomer.startBondAttachmentPoint;

      if (!startAttachmentPoint) {
        this.editor.events.error.dispatch(
          "Selected monomer doesn't have any free attachment points",
        );
        return;
      }
      const { polymerBond, command: modelChanges } =
        this.editor.drawingEntitiesManager.startPolymerBondCreation(
          selectedRenderer.monomer,
          selectedRenderer.monomer.position,
          Coordinates.canvasToModel(this.editor.lastCursorPositionOfCanvas),
        );

      this.editor.renderersContainer.update(modelChanges);
      this.bondRenderer = polymerBond.renderer;
    }
  }

  public mousemove() {
    if (this.bondRenderer) {
      const modelChanges = this.editor.drawingEntitiesManager.movePolymerBond(
        this.bondRenderer.polymerBond,
        Coordinates.canvasToModel(this.editor.lastCursorPositionOfCanvas),
      );
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public mouseLeavePolymerBond(event) {
    const renderer: PolymerBondRenderer = event.target.__data__;
    if (this.bondRenderer || !renderer.polymerBond) return;

    const modelChanges =
      this.editor.drawingEntitiesManager.hidePolymerBondInformation(
        renderer.polymerBond,
      );
    this.editor.renderersContainer.markForRecalculateBegin();
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseOverPolymerBond(event) {
    if (this.bondRenderer) return;

    const renderer: PolymerBondRenderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.showPolymerBondInformation(
        renderer.polymerBond,
      );
    this.editor.renderersContainer.markForRecalculateBegin();
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseOverMonomer(event) {
    const renderer: BaseMonomerRenderer = event.target.__data__;
    let modelChanges;

    if (this.bondRenderer) {
      // Don't need to do anything if we hover over the first monomer of the bond
      if (this.bondRenderer?.polymerBond.firstMonomer === renderer.monomer) {
        return;
      }
      const shouldCalculateBonds = !this.shouldInvokeModal(
        this.bondRenderer?.polymerBond.firstMonomer,
        renderer.monomer,
        false,
      );
      modelChanges =
        this.editor.drawingEntitiesManager.intendToFinishBondCreation(
          renderer.monomer,
          this.bondRenderer?.polymerBond,
          shouldCalculateBonds,
        );
    } else {
      modelChanges =
        this.editor.drawingEntitiesManager.intendToStartBondCreation(
          renderer.monomer,
        );
    }

    this.editor.renderersContainer.markForRecalculateBegin();
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseOverAttachmentPoint(event) {
    const renderer: BaseMonomerRenderer = event.target.__data__;
    let modelChanges;

    if (this.bondRenderer) {
      // Don't need to do anything if we hover over the first monomer of the bond
      if (this.bondRenderer?.polymerBond.firstMonomer === renderer.monomer) {
        return;
      }
      const shouldCalculateBonds = !this.shouldInvokeModal(
        this.bondRenderer?.polymerBond.firstMonomer,
        renderer.monomer,
        false,
      );
      modelChanges =
        this.editor.drawingEntitiesManager.intendToFinishAttachmenPointBondCreation(
          renderer.monomer,
          this.bondRenderer?.polymerBond,
          event.attachmentPointName,
          shouldCalculateBonds,
        );
    } else {
      modelChanges =
        this.editor.drawingEntitiesManager.intendToStartAttachmenPointBondCreation(
          renderer.monomer,
          event.attachmentPointName,
        );
    }

    this.editor.renderersContainer.markForRecalculateBegin();
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseLeaveMonomer(event) {
    const renderer: BaseMonomerRenderer = event.target.__data__;
    if (
      renderer !== this.bondRenderer?.polymerBond?.firstMonomer?.renderer &&
      !this.isBondConnectionModalOpen
    ) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelIntentionToFinishBondCreation(
          renderer.monomer,
          this.bondRenderer?.polymerBond,
        );
      this.editor.renderersContainer.markForRecalculateBegin();
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public mouseLeaveAttachmentPoint(event) {
    if (this.isBondConnectionModalOpen) {
      return;
    }
    const renderer: BaseMonomerRenderer = event.target.__data__;
    if (renderer !== this.bondRenderer?.polymerBond?.firstMonomer?.renderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelIntentionToFinishBondCreation(
          renderer.monomer,
          this.bondRenderer?.polymerBond,
        );
      this.editor.renderersContainer.markForRecalculateBegin();
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public mouseUpAttachmentPoint(event) {
    const renderer = event.toElement.__data__;
    const isFirstMonomerHovered =
      renderer === this.bondRenderer?.polymerBond?.firstMonomer?.renderer;

    if (this.bondRenderer && !isFirstMonomerHovered) {
      const firstMonomer = this.bondRenderer?.polymerBond?.firstMonomer;
      const secondMonomer = renderer.monomer;

      if (secondMonomer.isAttachmentPointUsed(event.attachmentPointName)) {
        this.mouseup();
        return;
      }

      for (const attachmentPoint in secondMonomer.attachmentPointsToBonds) {
        const bond = secondMonomer.attachmentPointsToBonds[attachmentPoint];
        if (!bond) {
          continue;
        }
        const alreadyHasBond =
          (bond.firstMonomer === firstMonomer &&
            bond.secondMonomer === secondMonomer) ||
          (bond.firstMonomer === secondMonomer &&
            bond.secondMonomer === firstMonomer);
        if (alreadyHasBond) {
          this.editor.events.error.dispatch(
            "There can't be more than 1 bond between the first and the second monomer",
          );
          return;
        }
      }
      secondMonomer.setChosenSecondAttachmentPoint(event.attachmentPointName);
      const showModal = this.shouldInvokeModal(firstMonomer, secondMonomer);
      if (showModal) {
        this.isBondConnectionModalOpen = true;

        this.editor.events.openMonomerConnectionModal.dispatch({
          firstMonomer,
          secondMonomer,
        });
        return;
      }
      const modelChanges = this.finishBondCreation(renderer.monomer);
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
      this.editor.renderersContainer.deletePolymerBond(
        this.bondRenderer.polymerBond,
        false,
        false,
      );
      this.bondRenderer = undefined;
      event.stopPropagation();
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
      secondMonomer.getPotentialAttachmentPointByBond(
        this.bondRenderer.polymerBond,
      );
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
    if (this.isBondConnectionModalOpen) {
      return;
    }
    this.removeBond();
  }

  public mouseUpMonomer(event) {
    const renderer = event.toElement.__data__;
    const isFirstMonomerHovered =
      renderer === this.bondRenderer?.polymerBond?.firstMonomer?.renderer;

    if (this.bondRenderer && !isFirstMonomerHovered) {
      const firstMonomer = this.bondRenderer?.polymerBond?.firstMonomer;
      const secondMonomer = renderer.monomer;

      for (const attachmentPoint in secondMonomer.attachmentPointsToBonds) {
        const bond = secondMonomer.attachmentPointsToBonds[attachmentPoint];
        if (!bond) {
          continue;
        }
        const alreadyHasBond =
          (bond.firstMonomer === firstMonomer &&
            bond.secondMonomer === secondMonomer) ||
          (bond.firstMonomer === secondMonomer &&
            bond.secondMonomer === firstMonomer);
        if (alreadyHasBond) {
          this.editor.events.error.dispatch(
            "There can't be more than 1 bond between the first and the second monomer",
          );
          return;
        }
      }
      const showModal = this.shouldInvokeModal(firstMonomer, secondMonomer);
      if (showModal) {
        this.isBondConnectionModalOpen = true;

        this.editor.events.openMonomerConnectionModal.dispatch({
          firstMonomer,
          secondMonomer,
        });
        return;
      }

      // This logic so far is only for no-modal connections. Maybe then we can chain it after modal invoke
      const modelChanges = this.finishBondCreation(renderer.monomer);
      this.editor.renderersContainer.update(modelChanges);
      this.editor.renderersContainer.deletePolymerBond(
        this.bondRenderer.polymerBond,
        false,
        false,
      );
      this.bondRenderer = undefined;
      this.history.update(modelChanges);
      event.stopPropagation();
    }
  }

  public handleBondCreation = (payload: {
    firstMonomer: BaseMonomer;
    secondMonomer: BaseMonomer;
    firstSelectedAttachmentPoint: string;
    secondSelectedAttachmentPoint: string;
  }): void => {
    assert(this.bondRenderer);

    const {
      secondMonomer,
      firstSelectedAttachmentPoint,
      secondSelectedAttachmentPoint,
    } = payload;
    const modelChanges =
      this.editor.drawingEntitiesManager.finishPolymerBondCreation(
        this.bondRenderer.polymerBond,
        secondMonomer,
        firstSelectedAttachmentPoint,
        secondSelectedAttachmentPoint,
      );
    this.history.update(modelChanges);
    this.editor.renderersContainer.update(modelChanges);
    if (firstSelectedAttachmentPoint === secondSelectedAttachmentPoint) {
      this.editor.events.error.dispatch(
        'You have connected monomers with attachment points of the same group',
      );
    }
    this.isBondConnectionModalOpen = false;
    this.editor.renderersContainer.deletePolymerBond(
      this.bondRenderer.polymerBond,
      false,
      false,
    );
    this.bondRenderer = undefined;
  };

  public handleBondCreationCancellation = (
    secondMonomer: BaseMonomer,
  ): void => {
    if (!this.bondRenderer) {
      return;
    }

    const modelChanges =
      this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
        this.bondRenderer.polymerBond,
        secondMonomer,
      );
    this.editor.renderersContainer.update(modelChanges);
    this.isBondConnectionModalOpen = false;
    this.bondRenderer = undefined;
  };

  public destroy() {
    this.removeBond();
  }

  private shouldInvokeModal(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    checkForPotentialBonds = true,
  ) {
    // No Modal: no free attachment point on second monomer
    if (!secondMonomer.hasFreeAttachmentPoint) {
      return false;
    }

    // No Modal: Both monomers have APs selected
    if (
      firstMonomer.chosenFirstAttachmentPointForBond !== null &&
      secondMonomer.chosenSecondAttachmentPointForBond !== null
    ) {
      return false;
    }

    // Modal: either of the monomers doesn't have any potential APs
    if (
      checkForPotentialBonds &&
      (!firstMonomer.hasPotentialBonds() || !secondMonomer.hasPotentialBonds())
    ) {
      return true;
    }

    // No Modal: Both monomers have only 1 attachment point
    if (
      firstMonomer.unUsedAttachmentPointsNamesList.length === 1 &&
      secondMonomer.unUsedAttachmentPointsNamesList.length === 1
    ) {
      return false;
    }

    // Modal: Any or both monomers are Chems
    if (firstMonomer instanceof Chem || secondMonomer instanceof Chem) {
      return true;
    }

    // Modal: One monomer is Peptide and another is RNA monomer
    const rnaMonomerClasses = [Sugar, RNABase, Phosphate];
    const firstMonomerIsRNA = rnaMonomerClasses.find(
      (RNAClass) => firstMonomer instanceof RNAClass,
    );
    const secondMonomerIsRNA = rnaMonomerClasses.find(
      (RNAClass) => secondMonomer instanceof RNAClass,
    );
    if (
      (firstMonomerIsRNA && secondMonomer instanceof Peptide) ||
      (secondMonomerIsRNA && firstMonomer instanceof Peptide)
    ) {
      return true;
    }

    // Modal: special case for Peptide chain
    if (secondMonomer instanceof Peptide && firstMonomer instanceof Peptide) {
      // one of monomers has more than 2 AP
      const hasPlentyAttachmentPoints =
        firstMonomer.listOfAttachmentPoints.length > 2 ||
        secondMonomer.listOfAttachmentPoints.length > 2;

      // at least one of monomers has more than 1 free AP
      const hasPlentyFreeAttachmentPoints =
        firstMonomer.unUsedAttachmentPointsNamesList.length > 1 ||
        secondMonomer.unUsedAttachmentPointsNamesList.length > 1;

      // there is no possibility to connect R1-R2
      const BothR1AttachmentPointUsed =
        firstMonomer.isAttachmentPointUsed(AttachmentPointName.R1) &&
        secondMonomer.isAttachmentPointUsed(AttachmentPointName.R1);

      const BothR2AttachmentPointUsed =
        firstMonomer.isAttachmentPointUsed(AttachmentPointName.R2) &&
        secondMonomer.isAttachmentPointUsed(AttachmentPointName.R2);

      const R1AndR2AttachmentPointUsed =
        (firstMonomer.isAttachmentPointUsed(AttachmentPointName.R2) &&
          firstMonomer.isAttachmentPointUsed(AttachmentPointName.R1)) ||
        (secondMonomer.isAttachmentPointUsed(AttachmentPointName.R2) &&
          secondMonomer.isAttachmentPointUsed(AttachmentPointName.R1));

      if (
        hasPlentyAttachmentPoints &&
        hasPlentyFreeAttachmentPoints &&
        (BothR1AttachmentPointUsed ||
          BothR2AttachmentPointUsed ||
          R1AndR2AttachmentPointUsed)
      ) {
        return true;
      }
    }
    return false;
  }
}

export { PolymerBond };
