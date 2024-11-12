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
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { BaseTool } from 'application/editor/tools/Tool';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import assert from 'assert';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import { UnresolvedMonomer } from 'domain/entities';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Chem } from 'domain/entities/Chem';
import { Command } from 'domain/entities/Command';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
// FIXME: If we replace '../shared/coordinates' by 'application/editor' to make it shorter,
//  we get `Uncaught ReferenceError: Cannot access 'PolymerBond' before initialization`,
//  which probably due to a circular dependency
//  because of using uncontrolled `index.ts` files.
import { Coordinates } from '../shared/coordinates';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { ToolName } from 'application/editor';

type FlexModeOrSnakeModePolymerBondRenderer =
  | FlexModePolymerBondRenderer
  | SnakeModePolymerBondRenderer;

export enum MACROMOLECULES_BOND_TYPES {
  SINGLE = 'single',
  HYDROGEN = 'hydrogen',
}

class PolymerBond implements BaseTool {
  private bondRenderer?: FlexModeOrSnakeModePolymerBondRenderer;
  private isBondConnectionModalOpen = false;
  private history: EditorHistory;
  private bondType: MACROMOLECULES_BOND_TYPES;

  constructor(private editor: CoreEditor, options: { toolName: ToolName }) {
    this.editor = editor;
    this.history = new EditorHistory(this.editor);
    this.bondType =
      options.toolName === ToolName.bondSingle
        ? MACROMOLECULES_BOND_TYPES.SINGLE
        : MACROMOLECULES_BOND_TYPES.HYDROGEN;
  }

  get isHydrogenBond() {
    return this.bondType === MACROMOLECULES_BOND_TYPES.HYDROGEN;
  }

  public mouseDownAttachmentPoint(event) {
    if (this.isHydrogenBond) {
      return;
    }

    const selectedRenderer = event.target.__data__;
    if (
      selectedRenderer instanceof AttachmentPoint &&
      !selectedRenderer.monomer.isAttachmentPointUsed(event.attachmentPointName)
    ) {
      selectedRenderer.monomer.setChosenFirstAttachmentPoint(
        event.attachmentPointName,
      );
    }
  }

  private removeBond() {
    if (this.bondRenderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
          this.bondRenderer.polymerBond,
        );
      this.bondRenderer = undefined;

      return modelChanges;
    } else {
      return new Command();
    }
  }

  public mousedown(event) {
    const selectedRenderer = event.target.__data__;
    if (
      selectedRenderer instanceof BaseMonomerRenderer ||
      selectedRenderer instanceof AttachmentPoint
    ) {
      const startAttachmentPoint =
        selectedRenderer.monomer.startBondAttachmentPoint;

      if (!startAttachmentPoint && !this.isHydrogenBond) {
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
          this.bondType,
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

  // FIXME: Specify the types.
  public mouseLeavePolymerBond(event): void {
    const renderer: FlexModeOrSnakeModePolymerBondRenderer =
      event.target.__data__;
    if (this.bondRenderer || !renderer.polymerBond) return;

    const modelChanges =
      this.editor.drawingEntitiesManager.hidePolymerBondInformation(
        renderer.polymerBond,
      );
    this.editor.renderersContainer.markForRecalculateBegin();
    this.editor.renderersContainer.update(modelChanges);
  }

  // FIXME: Specify the types.
  public mouseOverPolymerBond(event) {
    if (this.bondRenderer) return;

    const renderer: FlexModeOrSnakeModePolymerBondRenderer =
      event.target.__data__;
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
          this.isHydrogenBond ? false : shouldCalculateBonds,
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
    if (this.isHydrogenBond) {
      return;
    }

    const renderer: AttachmentPoint = event.target.__data__;
    let modelChanges;

    if (renderer.monomer.isAttachmentPointUsed(event.attachmentPointName)) {
      return;
    }

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
    const eventToElementData = event.toElement?.__data__;
    const eventFromElementData = event.fromElement?.__data__;
    if (
      eventToElementData instanceof AttachmentPoint &&
      eventToElementData.monomer === eventFromElementData.monomer
    ) {
      eventToElementData.monomer.removePotentialBonds();

      return;
    }

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
    const attachmentPointRenderer: AttachmentPoint = event.target.__data__;
    if (
      attachmentPointRenderer.monomer.renderer !==
      this.bondRenderer?.polymerBond?.firstMonomer?.renderer
    ) {
      const modelChanges =
        this.editor.drawingEntitiesManager.cancelIntentionToFinishBondCreation(
          attachmentPointRenderer.monomer,
          this.bondRenderer?.polymerBond,
        );
      this.editor.renderersContainer.markForRecalculateBegin();
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public mouseUpAttachmentPoint(event) {
    const renderer = event.target.__data__ as AttachmentPoint;
    const isFirstMonomerHovered =
      renderer.monomer.renderer ===
      this.bondRenderer?.polymerBond?.firstMonomer?.renderer;

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

    if (!this.isHydrogenBond && !secondMonomer.hasFreeAttachmentPoint) {
      this.editor.events.error.dispatch(
        "Monomers don't have any connection point available",
      );

      return this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
        this.bondRenderer.polymerBond,
      );
    }

    if (
      this.isHydrogenBond &&
      secondMonomer.hasHydrogenBondWithMonomer(
        this.bondRenderer?.polymerBond.firstMonomer,
      )
    ) {
      this.editor.events.error.dispatch(
        'Unable to establish multiple hydrogen bonds between two monomers',
      );

      return this.editor.drawingEntitiesManager.cancelPolymerBondCreation(
        this.bondRenderer.polymerBond,
      );
    }

    const firstMonomerAttachmentPoint = this.isHydrogenBond
      ? AttachmentPointName.HYDROGEN
      : this.bondRenderer.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
          this.bondRenderer.polymerBond,
        );
    const secondMonomerAttachmentPoint = this.isHydrogenBond
      ? AttachmentPointName.HYDROGEN
      : secondMonomer.getPotentialAttachmentPointByBond(
          this.bondRenderer.polymerBond,
        );
    assert(firstMonomerAttachmentPoint);
    assert(secondMonomerAttachmentPoint);
    if (
      firstMonomerAttachmentPoint === secondMonomerAttachmentPoint &&
      !this.isHydrogenBond
    ) {
      this.editor.events.error.dispatch(
        'You have connected monomers with attachment points of the same group',
      );
    }
    return this.editor.drawingEntitiesManager.finishPolymerBondCreation(
      this.bondRenderer.polymerBond,
      secondMonomer,
      firstMonomerAttachmentPoint,
      this.isHydrogenBond
        ? AttachmentPointName.HYDROGEN
        : secondMonomerAttachmentPoint,
      this.bondType,
    );
  }

  public mouseup() {
    if (this.isBondConnectionModalOpen) {
      return;
    }

    const modelChanges = this.removeBond();

    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseUpMonomer(event) {
    const renderer = event.target.__data__;
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

  public mouseUpAtom(event) {
    if (!this.bondRenderer || this.isHydrogenBond) {
      return;
    }

    const atomRenderer = event.target.__data__ as AtomRenderer;
    const monomer = this.bondRenderer?.polymerBond.firstMonomer;
    const attachmentPoint =
      monomer.getPotentialAttachmentPointByBond(
        this.bondRenderer?.polymerBond,
      ) || monomer?.getValidSourcePoint();

    this.editor.drawingEntitiesManager.deletePolymerBond(
      this.bondRenderer?.polymerBond,
    );
    this.bondRenderer?.remove();
    this.bondRenderer = undefined;

    if (!attachmentPoint) {
      return;
    }

    const modelChanges =
      this.editor.drawingEntitiesManager.addMonomerToAtomBond(
        monomer,
        atomRenderer.atom,
        attachmentPoint,
      );

    this.editor.renderersContainer.update(modelChanges);
    this.history.update(modelChanges);
  }

  public handleBondCreation = (payload: {
    firstMonomer: BaseMonomer;
    secondMonomer: BaseMonomer;
    firstSelectedAttachmentPoint: AttachmentPointName;
    secondSelectedAttachmentPoint: AttachmentPointName;
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
    const modelChanges = this.removeBond();
    modelChanges.merge(
      this.editor.drawingEntitiesManager.removeHoverForAllMonomers(),
    );

    this.editor.renderersContainer.update(modelChanges);
  }

  private shouldInvokeModal(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    checkForPotentialBonds = true,
  ) {
    if (this.isHydrogenBond) {
      return;
    }

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

    // Modal: Any or both monomers are unresolved
    if (
      firstMonomer instanceof UnresolvedMonomer ||
      secondMonomer instanceof UnresolvedMonomer
    ) {
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
