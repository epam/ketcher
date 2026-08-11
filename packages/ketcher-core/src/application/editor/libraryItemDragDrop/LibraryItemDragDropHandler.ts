import { Vec2 } from 'domain/entities';
import { Command } from 'domain/entities/Command';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  type AttachmentPointName,
  type MonomerOrAmbiguousType,
  type MonomerItemType,
} from 'domain/types';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseMonomerRenderer } from 'application/render';
import type { TransientDrawingView } from 'application/render/renderers/TransientView';
import type { IEditorEvents } from 'application/editor/editorEvents';
import type {
  AttachmentPointTarget,
  LibraryItemDragState,
} from 'application/editor/editor.types';
import { attachmentPointNumberToAngle } from 'domain/helpers/attachmentPointCalculations';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import { Coordinates } from 'application/editor/shared/coordinates';
import { EditorHistory } from 'application/editor/EditorHistory';
import type { CoreEditor } from 'application/editor/Editor';
import { isLibraryItemRnaPreset } from 'domain/helpers/monomers';
import { findPresetMonomerForBonding as findPresetMonomerForBondingHelper } from 'application/editor/tools/bondConnectionHelpers';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import type { DragDropModalContext } from './libraryItemDragDrop.types';
import {
  applyPresetMirroringIfNeeded,
  computeAndApplyFlexDropRepositioning,
} from './repositioning';
import {
  getPresetSugarForMonomer,
  getMatchingPresetComponents,
  computeLostBondsForMonomerReplacement,
  computeLostBondsForPresetReplacement,
  type PresetComponentRole,
} from './replacementHelpers';

const DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25;
const DRAG_CIRCLE_HOVER_THRESHOLD_PX = 20;
/**
 * Center-to-center distance (pixels) at which a dragged library item triggers
 * the replacement visual state on a canvas monomer.
 *
 * Value chosen to be slightly larger than a monomer body radius (~20 px) so
 * the cursor only needs to overlap the monomer body to trigger replacement —
 * not merely approach an attachment point.
 *
 * UX confirmation is required before finalising (see design.md open question 1).
 */
const DRAG_REPLACE_PROXIMITY_THRESHOLD_PX = 35;

export interface IAutochainMonomerAddResult {
  modelChanges: Command;
  firstMonomer: BaseMonomer;
  lastMonomer: BaseMonomer;
  drawingEntities: DrawingEntity[];
}

/**
 * Narrow interface for the dependencies that LibraryItemDragDropHandler
 * needs from CoreEditor. This keeps the handler decoupled from the concrete
 * editor class and makes it independently testable.
 */
export interface LibraryItemDragDropHandlerDeps {
  drawingEntitiesManager: DrawingEntitiesManager;
  renderersContainer: RenderersManager;
  events: Pick<
    IEditorEvents,
    | 'setLibraryItemDragState'
    | 'placeLibraryItemOnCanvas'
    | 'openMonomerConnectionModal'
    | 'openConfirmationDialog'
    | 'error'
  >;
  getCanvasOffset(): DOMRect;
  getKetcherRootRect(): DOMRect | undefined;
  getModeName(): string;
  getEditor(): CoreEditor;
  getTransientDrawingView(): TransientDrawingView;
  placeItemOnCanvas(
    item: IRnaPreset | MonomerOrAmbiguousType,
    position: Vec2,
  ): IAutochainMonomerAddResult | undefined;
  calculateAndStoreNextAutochainPosition(lastMonomer: BaseMonomer): void;
}

/**
 * Classification of a replacement target:
 *  - 'same-geometry-preset': the cursor is over a preset that has the same
 *    geometry as the dragged preset → the whole preset will be replaced.
 *  - 'monomer': a standalone monomer or a preset component → only this single
 *    monomer will be replaced.
 */
export type ReplacementTargetKind = 'same-geometry-preset' | 'monomer';

export type ReplacementTarget = {
  /** The canvas monomer nearest to the cursor (center of the hit zone) */
  monomer: BaseMonomer;
  kind: ReplacementTargetKind;
  /**
   * If kind is 'same-geometry-preset', this holds the sugar of the target
   * preset (the anchor for the preset replacement).
   */
  presetSugar?: BaseMonomer;
  /**
   * If kind is 'same-geometry-preset', the exact canvas monomers that
   * structurally correspond to the dragged preset (sugar + optional base +
   * optional phosphate). These are the monomers highlighted during drag and
   * replaced on drop. Resolved once at classification time so highlighting and
   * replacement stay consistent.
   */
  presetComponents?: BaseMonomer[];
};

/**
 * Handles all drag-and-drop attachment-point logic for library items being
 * dragged onto the macromolecule canvas.
 *
 * Responsibilities:
 * - Proximity hover highlighting (25 px bond-target ring, 8 px snap circle)
 * - Auto-connect on snap-drop (circle-hover threshold)
 * - Opening the connection modal when the source AP cannot be determined
 * - Resuming / cancelling bond creation after the modal resolves
 * - Flex-mode repositioning and preset mirroring after a drag-drop bond
 * - Replacement detection (center-proximity) — runs before AP proximity checks
 */
export class LibraryItemDragDropHandler {
  private dragDropBondTarget: AttachmentPointTarget | null = null;
  private dragCircleHoverTarget: AttachmentPointTarget | null = null;
  private isDragDropBondModalOpen = false;
  private dragDropModalContext: DragDropModalContext | null = null;
  /** Tracks whether a library-item drag is currently in progress. */
  private currentDragState: LibraryItemDragState = null;
  /**
   * The current replacement target if the cursor is within
   * DRAG_REPLACE_PROXIMITY_THRESHOLD_PX of a canvas monomer center.
   * Cleared when the cursor moves outside the threshold or the drag ends.
   */
  private dragReplaceTarget: ReplacementTarget | null = null;

  constructor(private readonly deps: LibraryItemDragDropHandlerDeps) {}

  /**
   * Wire up editor events. Must be called exactly once during editor
   * initialisation (from Editor.subscribeEvents()).
   */
  subscribe(): void {
    const { events } = this.deps;
    events.setLibraryItemDragState.add(this.onDragStateChanged.bind(this));
    events.placeLibraryItemOnCanvas.add(
      (
        item: IRnaPreset | MonomerOrAmbiguousType,
        position: { x: number; y: number },
      ) => this.onPlaceOnCanvas(item, position),
    );
  }

  // ---------------------------------------------------------------------------
  // Public API — called from CoreEditor
  // ---------------------------------------------------------------------------

  /**
   * Called from onCreateBond() in Editor when the connection modal resolves
   * and this.isDragDropBondModalOpen is true.
   */
  handleMonomerConnection(payload: {
    firstMonomer: BaseMonomer;
    secondMonomer: BaseMonomer;
    firstSelectedAttachmentPoint: AttachmentPointName;
    secondSelectedAttachmentPoint: AttachmentPointName;
  }): void {
    const {
      firstMonomer,
      secondMonomer,
      firstSelectedAttachmentPoint,
      secondSelectedAttachmentPoint,
    } = payload;

    const {
      drawingEntitiesManager,
      renderersContainer,
      getEditor,
      getModeName,
      events,
    } = this.deps;

    const command = new Command();
    command.merge(
      drawingEntitiesManager.createPolymerBond(
        firstMonomer,
        secondMonomer,
        firstSelectedAttachmentPoint,
        secondSelectedAttachmentPoint,
      ),
    );

    // In Flex mode, reposition the dropped monomer so the new bond has
    // standard length and follows the target AP direction (req. 2.4, 2.5).
    if (getModeName() === 'flex-layout-mode' && this.dragDropModalContext) {
      const { droppedMonomer, addedMonomers } = this.dragDropModalContext;
      command.merge(
        computeAndApplyFlexDropRepositioning(
          drawingEntitiesManager,
          droppedMonomer,
          addedMonomers,
          secondMonomer,
          secondSelectedAttachmentPoint,
        ),
      );
    }

    if (getModeName() === 'snake-layout-mode') {
      command.merge(drawingEntitiesManager.applySnakeLayout(true));
    }

    if (firstSelectedAttachmentPoint === secondSelectedAttachmentPoint) {
      events.error.dispatch(
        'You have connected monomers using attachment points with the same name (e.g., both R1 or both R2)',
      );
    }

    const history = EditorHistory.getInstance(getEditor());
    history.update(command);
    renderersContainer.update(command);

    this.isDragDropBondModalOpen = false;
    this.dragDropModalContext = null;
  }

  /**
   * Called from onCancelBondCreation() in Editor when the modal is dismissed
   * and this.isDragDropBondModalOpen is true.
   */
  handleMonomerConnectionCancel(): void {
    this.isDragDropBondModalOpen = false;
    this.dragDropModalContext = null;
  }

  /** Whether a drag-drop connection modal is currently open. */
  get isModalOpen(): boolean {
    return this.isDragDropBondModalOpen;
  }

  /** Whether a library item is currently being dragged. */
  get isDragging(): boolean {
    return this.currentDragState !== null;
  }

  // ---------------------------------------------------------------------------
  // Private: drag-over proximity / hover
  // ---------------------------------------------------------------------------

  private onDragStateChanged(state: LibraryItemDragState): void {
    this.currentDragState = state;
    if (state) {
      this.onLibraryItemDragOver(state);
    } else {
      this.clearDragDropBondTarget();
      this.clearReplacementTarget();
    }
  }

  /**
   * Called on each drag event from the library. Updates the visual hover state
   * to indicate either:
   *  1. A replacement target (center-proximity check, runs first), OR
   *  2. The nearest free attachment point (AP-proximity check, falls through).
   */
  private onLibraryItemDragOver(
    state: NonNullable<LibraryItemDragState>,
  ): void {
    // Skip in sequence mode
    if (this.deps.getModeName() === 'sequence-layout-mode') return;

    // --- REPLACEMENT CHECK (priority over AP proximity) ---
    const replacementTarget = this.findReplacementTarget(state.position);
    if (replacementTarget) {
      // Classify the target and activate its visual state
      const classified = this.classifyReplaceTarget(
        replacementTarget,
        state.item,
      );

      const prevTarget = this.dragReplaceTarget;
      const hasTargetChanged =
        classified.monomer !== prevTarget?.monomer ||
        classified.kind !== prevTarget?.kind;

      if (hasTargetChanged) {
        // Clear previous replacement visual state
        if (prevTarget) this.clearReplacementVisualState(prevTarget);

        // Activate new replacement visual state
        this.applyReplacementVisualState(classified);
        this.dragReplaceTarget = classified;

        // Clear AP bond target if we switched to replacement mode
        const { updatedTarget: clearedBondTarget } =
          this.updateAttachmentPointTarget(
            this.dragDropBondTarget,
            null,
            this.setMonomerDragTargetAP.bind(this),
          );
        this.dragDropBondTarget = clearedBondTarget;

        const { updatedTarget: clearedCircleHover } =
          this.updateAttachmentPointTarget(
            this.dragCircleHoverTarget,
            null,
            this.setMonomerDragCircleHoverAP.bind(this),
          );
        this.dragCircleHoverTarget = clearedCircleHover;

        const command = new Command();
        command.merge(
          this.deps.drawingEntitiesManager.removeHoverForAllMonomers(),
        );
        this.deps.renderersContainer.update(command);
      }
      return;
    }

    // No replacement target — clear any previous replacement visual state
    if (this.dragReplaceTarget) {
      this.clearReplacementTarget();
    }

    // --- ORIGINAL AP PROXIMITY CHECK ---
    const nearestAP = this.findNearestFreeAttachmentPointForDrag(
      state.position,
    );
    const circleHoverAP = this.findNearestFreeAttachmentPointForDrag(
      state.position,
      DRAG_CIRCLE_HOVER_THRESHOLD_PX,
    );

    // Update circle hover state independently — no re-render needed, just
    // update the flag so the next drawAttachmentPoints() picks it up.
    const {
      updatedTarget: updatedCircleHoverTarget,
      hasTargetChanged: hasCircleHoverTargetChanged,
    } = this.updateAttachmentPointTarget(
      this.dragCircleHoverTarget,
      circleHoverAP,
      this.setMonomerDragCircleHoverAP.bind(this),
    );
    this.dragCircleHoverTarget = updatedCircleHoverTarget;

    const {
      updatedTarget: updatedBondTarget,
      hasTargetChanged: hasBondTargetChanged,
    } = this.updateAttachmentPointTarget(
      this.dragDropBondTarget,
      nearestAP,
      this.setMonomerDragTargetAP.bind(this),
    );

    // No change in either proximity target — avoid unnecessary re-renders
    if (!hasBondTargetChanged && !hasCircleHoverTargetChanged) {
      return;
    }

    this.dragDropBondTarget = updatedBondTarget;

    const { drawingEntitiesManager, renderersContainer } = this.deps;
    const command = new Command();
    command.merge(drawingEntitiesManager.removeHoverForAllMonomers());

    if (nearestAP) {
      command.merge(
        drawingEntitiesManager.intendToStartBondCreation(nearestAP.monomer),
      );
    }

    renderersContainer.update(command);
  }

  /**
   * Clears any drag-drop bond target hover state and resets related fields.
   */
  private clearDragDropBondTarget(): void {
    const { updatedTarget: clearedCircleHoverTarget } =
      this.updateAttachmentPointTarget(
        this.dragCircleHoverTarget,
        null,
        this.setMonomerDragCircleHoverAP.bind(this),
      );
    this.dragCircleHoverTarget = clearedCircleHoverTarget;

    const {
      updatedTarget: clearedBondTarget,
      hasTargetChanged: hasBondTargetChanged,
    } = this.updateAttachmentPointTarget(
      this.dragDropBondTarget,
      null,
      this.setMonomerDragTargetAP.bind(this),
    );
    this.dragDropBondTarget = clearedBondTarget;

    if (!hasBondTargetChanged) return;

    const clearCommand =
      this.deps.drawingEntitiesManager.removeHoverForAllMonomers();
    this.deps.renderersContainer.update(clearCommand);
  }

  // ---------------------------------------------------------------------------
  // Private: replacement detection
  // ---------------------------------------------------------------------------

  /**
   * Finds the nearest canvas monomer whose center is within
   * DRAG_REPLACE_PROXIMITY_THRESHOLD_PX of the cursor, or null.
   *
   * Uses canvas-to-view coordinate conversion (same as AP proximity search).
   */
  private findReplacementTarget(position: {
    x: number;
    y: number;
  }): BaseMonomer | null {
    const rootOffset = this.deps.getKetcherRootRect();
    if (!rootOffset) return null;

    const canvasOffset = this.deps.getCanvasOffset();
    const canvasRelLeft = canvasOffset.left - rootOffset.left;
    const canvasRelTop = canvasOffset.top - rootOffset.top;

    let nearest: BaseMonomer | null = null;
    let minDist = DRAG_REPLACE_PROXIMITY_THRESHOLD_PX;

    for (const [, monomer] of this.deps.drawingEntitiesManager.monomers) {
      const renderer = monomer.renderer;
      if (!renderer || !(renderer instanceof BaseMonomerRenderer)) continue;

      // Use the renderer's center (already in canvas-space pixels)
      const center = renderer.center;
      const centerView = Coordinates.canvasToView(center);

      const screenX = canvasRelLeft + centerView.x;
      const screenY = canvasRelTop + centerView.y;

      const dist = Math.sqrt(
        (position.x - screenX) ** 2 + (position.y - screenY) ** 2,
      );

      if (dist < minDist) {
        minDist = dist;
        nearest = monomer;
      }
    }

    return nearest;
  }

  /**
   * Classifies a replacement target monomer based on the dragged item.
   *
   * Outcomes:
   * - 'same-geometry-preset': dragged item is a preset AND the hit monomer
   *   belongs to a canvas preset that contains every component the dragged
   *   preset provides (sugar, base if present, phosphate on the same side) →
   *   those parts of the canvas preset replace.
   * - 'monomer': everything else → only the hit monomer is replaced.
   */
  private classifyReplaceTarget(
    nearestMonomer: BaseMonomer,
    draggedItem: IRnaPreset | MonomerOrAmbiguousType | undefined,
  ): ReplacementTarget {
    if (draggedItem && isLibraryItemRnaPreset(draggedItem)) {
      // Resolve the sugar anchor of the preset the hit monomer belongs to,
      // using the dragged preset to disambiguate the phosphate side.
      const presetSugar = getPresetSugarForMonomer(nearestMonomer, draggedItem);
      if (presetSugar) {
        // Resolve exactly the canvas components that correspond to the dragged
        // preset's structure. Null means the geometries differ.
        const presetComponents = getMatchingPresetComponents(
          presetSugar,
          draggedItem,
        );
        // The hit monomer must itself be one of the matched components,
        // otherwise the user is hovering a part that the dragged preset does
        // not provide (e.g. a phosphate while dragging a sugar+base preset).
        if (presetComponents && presetComponents.includes(nearestMonomer)) {
          return {
            monomer: nearestMonomer,
            kind: 'same-geometry-preset',
            presetSugar,
            presetComponents,
          };
        }
      }
    }

    return { monomer: nearestMonomer, kind: 'monomer' };
  }

  /**
   * Applies the replacement-target visual state to all monomers identified
   * by `target`: dims the monomer bodies to read as a "will be replaced"
   * preview and draws a single smooth outline around the whole group via a
   * transient view.
   */
  private applyReplacementVisualState(target: ReplacementTarget): void {
    const monomersToHighlight = this.getHighlightMonomers(target);

    for (const monomer of monomersToHighlight) {
      const renderer = monomer.renderer;
      if (renderer instanceof BaseMonomerRenderer) {
        renderer.setReplacementTarget(true);
      }
    }

    const transientDrawingView = this.deps.getTransientDrawingView();
    transientDrawingView.showReplacementHighlight({
      monomers: monomersToHighlight,
    });
    transientDrawingView.update();
  }

  /**
   * Removes the replacement-target visual state from all monomers identified
   * by `target` and hides the outline.
   */
  private clearReplacementVisualState(target: ReplacementTarget): void {
    const monomersToUnhighlight = this.getHighlightMonomers(target);

    for (const monomer of monomersToUnhighlight) {
      const renderer = monomer.renderer;
      if (renderer instanceof BaseMonomerRenderer) {
        renderer.setReplacementTarget(false);
      }
    }

    const transientDrawingView = this.deps.getTransientDrawingView();
    transientDrawingView.hideReplacementHighlight();
    transientDrawingView.update();
  }

  /**
   * Returns the monomers that make up the replacement highlight: the matched
   * preset components for a same-geometry preset, otherwise the single hit
   * monomer.
   */
  private getHighlightMonomers(target: ReplacementTarget): BaseMonomer[] {
    return target.kind === 'same-geometry-preset' && target.presetComponents
      ? target.presetComponents
      : [target.monomer];
  }

  /**
   * Clears the current replacement target visual state and the stored field.
   */
  private clearReplacementTarget(): void {
    if (this.dragReplaceTarget) {
      this.clearReplacementVisualState(this.dragReplaceTarget);
      this.dragReplaceTarget = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Private: drop handler
  // ---------------------------------------------------------------------------

  private onPlaceOnCanvas(
    item: IRnaPreset | MonomerOrAmbiguousType,
    position: { x: number; y: number },
  ): void {
    const {
      drawingEntitiesManager,
      renderersContainer,
      events,
      getModeName,
      getEditor,
      placeItemOnCanvas,
      calculateAndStoreNextAutochainPosition,
    } = this.deps;

    // -----------------------------------------------------------------------
    // REPLACEMENT BRANCH — takes priority over normal placement
    // -----------------------------------------------------------------------
    if (this.dragReplaceTarget) {
      const replaceTarget = this.dragReplaceTarget;
      this.executeReplacement(
        item,
        replaceTarget,
        getModeName,
        events,
        drawingEntitiesManager,
        renderersContainer,
        getEditor,
      );
      return;
    }

    // -----------------------------------------------------------------------
    // NORMAL PLACEMENT BRANCH
    // -----------------------------------------------------------------------
    const monomersAddResult = placeItemOnCanvas(
      item,
      new Vec2(position.x, position.y),
    );

    if (!monomersAddResult) {
      return;
    }

    const modelChanges = new Command();
    modelChanges.merge(monomersAddResult.modelChanges);

    // If dragged and dropped directly on a free attachment point circle,
    // establish a bond
    if (this.dragCircleHoverTarget) {
      const { monomer: targetMonomer, attachmentPointName: targetAP } =
        this.dragCircleHoverTarget;

      const addedMonomers = monomersAddResult.drawingEntities.filter(
        (e): e is BaseMonomer => e instanceof BaseMonomer,
      );

      const droppedMonomer = isLibraryItemRnaPreset(item)
        ? this.findPresetMonomerForBonding(addedMonomers, targetAP)
        : monomersAddResult.firstMonomer;

      if (droppedMonomer && droppedMonomer.hasFreeAttachmentPoint) {
        targetMonomer.setPotentialSecondAttachmentPoint(targetAP);
        const sourceAP = droppedMonomer.getValidSourcePoint(targetMonomer);
        targetMonomer.setPotentialSecondAttachmentPoint(null);

        if (sourceAP) {
          modelChanges.merge(
            drawingEntitiesManager.createPolymerBond(
              droppedMonomer,
              targetMonomer,
              sourceAP,
              targetAP,
            ),
          );

          // Preset mirroring: if both bonded ends are on the same topology
          // side (both first or both last in their chains), mirror the
          // dropped preset horizontally (req. 3.3.1).
          if (isLibraryItemRnaPreset(item) && addedMonomers.length > 1) {
            modelChanges.merge(
              applyPresetMirroringIfNeeded(
                drawingEntitiesManager,
                droppedMonomer,
                addedMonomers,
                targetMonomer,
              ),
            );
          }

          // In Flex mode, reposition the dropped monomer (and any preset
          // group) so the new bond has standard length and follows the AP
          // direction (req. 2.4, 2.5).
          if (getModeName() === 'flex-layout-mode') {
            modelChanges.merge(
              computeAndApplyFlexDropRepositioning(
                drawingEntitiesManager,
                droppedMonomer,
                addedMonomers,
                targetMonomer,
                targetAP,
              ),
            );
          }

          // Non-standard bond notification: same-group APs (req. 4.2).
          if (sourceAP === targetAP) {
            events.error.dispatch(
              'You have connected monomers with attachment points of the same group',
            );
          }

          if (getModeName() === 'snake-layout-mode') {
            modelChanges.merge(drawingEntitiesManager.applySnakeLayout(true));
          }
        } else if (droppedMonomer.unUsedAttachmentPointsNamesList.length > 0) {
          this.isDragDropBondModalOpen = true;
          this.dragDropModalContext = {
            droppedMonomer,
            addedMonomers,
            targetMonomer,
            targetAP,
          };
          events.openMonomerConnectionModal.dispatch({
            firstMonomer: droppedMonomer,
            secondMonomer: targetMonomer,
          });
        }
      }

      this.setMonomerDragCircleHoverAP(
        this.dragCircleHoverTarget.monomer,
        null,
      );
      this.dragCircleHoverTarget = null;
    }

    modelChanges.merge(
      drawingEntitiesManager.selectDrawingEntities(
        monomersAddResult.drawingEntities,
      ),
    );

    const history = EditorHistory.getInstance(getEditor());
    history.update(modelChanges);
    renderersContainer.update(modelChanges);
    calculateAndStoreNextAutochainPosition(monomersAddResult.lastMonomer);
  }

  /**
   * Executes the replacement flow when a library item is dropped onto an
   * existing replacement target.
   *
   * Flow:
   *  1. Collect the bonds that would be lost during replacement.
   *  2. If any bonds would be lost, show the "Deletion of bonds" modal.
   *     - On Cancel: abort, restore canvas state.
   *     - On Yes: execute the replacement.
   *  3. If no bonds would be lost: execute the replacement immediately.
   */
  private executeReplacement(
    item: IRnaPreset | MonomerOrAmbiguousType,
    replaceTarget: ReplacementTarget,
    getModeName: () => string,
    events: LibraryItemDragDropHandlerDeps['events'],
    drawingEntitiesManager: DrawingEntitiesManager,
    renderersContainer: RenderersManager,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEditor: () => any,
  ): void {
    this.clearReplacementTarget();

    // Determine what bonds would be lost
    const lostBonds = this.computeLostBondsForReplacement(item, replaceTarget);

    const doReplace = () => {
      const command = this.buildReplacementCommand(
        item,
        replaceTarget,
        getModeName,
        drawingEntitiesManager,
      );

      if (command) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const history = EditorHistory.getInstance(getEditor() as any);
        history.update(command);
        renderersContainer.update(command);
      }
    };

    if (lostBonds > 0) {
      events.openConfirmationDialog.dispatch({
        title: 'Deletion of bonds',
        confirmationText:
          'Some bonds will get deleted during replacement. Do you wish to proceed.',
        onConfirm: doReplace,
      });
    } else {
      doReplace();
    }
  }

  /**
   * Returns the number of bonds that would be lost if `item` were dropped
   * onto `replaceTarget`. A bond is "lost" when the replacement monomer/preset
   * does not expose the attachment point the original bond used.
   */
  private computeLostBondsForReplacement(
    item: IRnaPreset | MonomerOrAmbiguousType,
    replaceTarget: ReplacementTarget,
  ): number {
    // Preset → preset (same geometry): re-establish external bonds on the
    // structurally corresponding new components. A bond is lost when the new
    // component of that role lacks a free attachment point for it (e.g. the
    // dropped preset has no phosphate to carry an inter-nucleotide bond).
    if (
      replaceTarget.kind === 'same-geometry-preset' &&
      replaceTarget.presetComponents &&
      isLibraryItemRnaPreset(item)
    ) {
      const { freeAPsByRole, rolePresent } = this.computeNewPresetFreeAPs(item);
      return computeLostBondsForPresetReplacement(
        replaceTarget.presetComponents,
        freeAPsByRole,
        rolePresent,
      ).length;
    }

    // Monomer → monomer (or preset component → monomer).
    if (!isLibraryItemRnaPreset(item)) {
      const newFreeAPs = this.getTemplateAttachmentPointNames(
        item as MonomerItemType,
      );
      // If the new template's APs can't be determined, do not raise a false
      // "deletion of bonds" warning.
      if (!newFreeAPs) return 0;
      return computeLostBondsForMonomerReplacement(
        replaceTarget.monomer,
        newFreeAPs,
      ).length;
    }

    // Preset → single monomer: the monomer's bonds are re-routed to whichever
    // new preset component exposes a free attachment point, so a bond is lost
    // only when none of the new components provides it.
    if (isLibraryItemRnaPreset(item) && replaceTarget.kind === 'monomer') {
      const { freeAPsByRole, rolePresent } = this.computeNewPresetFreeAPs(item);
      const allFreeAPs = new Set<AttachmentPointName>();
      (['sugar', 'phosphate', 'base'] as PresetComponentRole[]).forEach(
        (role) => {
          if (rolePresent[role]) {
            freeAPsByRole[role].forEach((ap) => allFreeAPs.add(ap));
          }
        },
      );
      return computeLostBondsForMonomerReplacement(
        replaceTarget.monomer,
        allFreeAPs,
      ).length;
    }

    return 0;
  }

  /**
   * Extracts the attachment-point names declared by a monomer template, or
   * null when they cannot be determined from the template.
   */
  private getTemplateAttachmentPointNames(
    item?: MonomerItemType,
  ): Set<AttachmentPointName> | null {
    if (!item?.attachmentPoints || item.attachmentPoints.length === 0) {
      return null;
    }
    const { attachmentPointsList } =
      BaseMonomer.getAttachmentPointDictFromMonomerDefinition(
        item.attachmentPoints,
      );
    return new Set(attachmentPointsList);
  }

  /**
   * Computes, for a dragged RNA preset, the free (available) attachment points
   * of each new component after the internal intra-preset bonds are formed,
   * plus which roles the preset provides.
   *
   * Internal usage:
   *  - sugar: R3 (base) and R2/R1 (phosphate on right/left)
   *  - base: R1
   *  - phosphate: R1/R2 (right/left)
   */
  private computeNewPresetFreeAPs(preset: IRnaPreset): {
    freeAPsByRole: Record<PresetComponentRole, Set<AttachmentPointName>>;
    rolePresent: Record<PresetComponentRole, boolean>;
  } {
    const position = preset.phosphatePosition ?? 'right';
    const hasBase = Boolean(preset.base);
    const hasPhosphate = Boolean(preset.phosphate);

    const apNamesFor = (
      item: MonomerItemType | undefined,
      fallback: AttachmentPointName[],
    ): Set<AttachmentPointName> =>
      this.getTemplateAttachmentPointNames(item) ??
      new Set<AttachmentPointName>(fallback);

    const sugarAPs = apNamesFor(preset.sugar, [
      'R1',
      'R2',
      'R3',
    ] as AttachmentPointName[]);
    const baseAPs = apNamesFor(preset.base, ['R1'] as AttachmentPointName[]);
    const phosphateAPs = apNamesFor(preset.phosphate, [
      'R1',
      'R2',
    ] as AttachmentPointName[]);

    const sugarInternal = new Set<AttachmentPointName>();
    if (hasBase) sugarInternal.add('R3' as AttachmentPointName);
    if (hasPhosphate) {
      sugarInternal.add(
        (position === 'left' ? 'R1' : 'R2') as AttachmentPointName,
      );
    }

    const subtract = (
      all: Set<AttachmentPointName>,
      used: Set<AttachmentPointName>,
    ): Set<AttachmentPointName> => {
      const result = new Set<AttachmentPointName>();
      all.forEach((ap) => {
        if (!used.has(ap)) result.add(ap);
      });
      return result;
    };

    return {
      freeAPsByRole: {
        sugar: subtract(sugarAPs, sugarInternal),
        base: subtract(
          baseAPs,
          new Set<AttachmentPointName>(['R1' as AttachmentPointName]),
        ),
        phosphate: subtract(
          phosphateAPs,
          new Set<AttachmentPointName>([
            (position === 'left' ? 'R2' : 'R1') as AttachmentPointName,
          ]),
        ),
      },
      rolePresent: {
        sugar: Boolean(preset.sugar),
        base: hasBase,
        phosphate: hasPhosphate,
      },
    };
  }

  /**
   * Builds the replacement `Command` for the given item and target.
   */
  private buildReplacementCommand(
    item: IRnaPreset | MonomerOrAmbiguousType,
    replaceTarget: ReplacementTarget,
    getModeName: () => string,
    drawingEntitiesManager: DrawingEntitiesManager,
  ): Command | null {
    if (
      replaceTarget.kind === 'same-geometry-preset' &&
      replaceTarget.presetSugar &&
      isLibraryItemRnaPreset(item)
    ) {
      // Preset → preset (same geometry). Pass the exact canvas components that
      // were matched (and highlighted) so the whole preset — including
      // left-side phosphates and two-component presets — is replaced and all
      // external bonds are re-established.
      const { command } = drawingEntitiesManager.replacePreset(
        replaceTarget.presetSugar,
        item,
        new Vec2(
          replaceTarget.presetSugar.position.x,
          replaceTarget.presetSugar.position.y,
        ),
        replaceTarget.presetComponents,
      );

      // No re-layout for same-geometry preset replacement (task 7.2, 7.3)
      return command;
    }

    if (!isLibraryItemRnaPreset(item)) {
      // Monomer → monomer OR preset component → monomer
      const { command } = drawingEntitiesManager.replaceMonomer(
        replaceTarget.monomer,
        item,
      );

      // No re-layout for monomer→monomer (task 7.1)
      return command;
    }

    if (isLibraryItemRnaPreset(item) && replaceTarget.kind === 'monomer') {
      // Preset → monomer (single monomer replaced by a preset)
      const sugarPosition = new Vec2(
        replaceTarget.monomer.position.x,
        replaceTarget.monomer.position.y,
      );
      const { command } = drawingEntitiesManager.replacePreset(
        replaceTarget.monomer,
        item,
        sugarPosition,
      );

      const finalCommand = new Command();
      finalCommand.merge(command);
      // Preserve the reverse-undo flag: replacePreset sets it on `command`, but
      // Command.merge() does not propagate undoOperationReverse, so we must set
      // it explicitly on finalCommand as well.
      finalCommand.setUndoOperationReverse();

      // Layout adjustments for preset→monomer (tasks 7.5, 7.6)
      if (getModeName() === 'snake-layout-mode') {
        finalCommand.merge(drawingEntitiesManager.applySnakeLayout(true));
      }
      // Flex mode: chain shift is deferred to after commit — handled by
      // MoveMonomerOperation within the replace command (future enhancement).

      return finalCommand;
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Private: renderer flag helpers
  // ---------------------------------------------------------------------------

  /**
   * Sets or clears the drag-target attachment point on a monomer's renderer,
   * guarded by instanceof to ensure only BaseMonomerRenderer is used.
   */
  private setMonomerDragTargetAP(
    monomer: BaseMonomer,
    apName: AttachmentPointName | null,
  ): void {
    const renderer = monomer.renderer;
    if (renderer instanceof BaseMonomerRenderer) {
      renderer.setDragTargetAttachmentPoint(apName);
    }
  }

  private setMonomerDragCircleHoverAP(
    monomer: BaseMonomer,
    apName: AttachmentPointName | null,
  ): void {
    const renderer = monomer.renderer;
    if (renderer instanceof BaseMonomerRenderer) {
      renderer.setDragCircleHoverAttachmentPoint(apName);
    }
  }

  // ---------------------------------------------------------------------------
  // Private: spatial search helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns the approximate canvas-space position of an attachment point
   * on a monomer renderer, based on the canonical angle for that AP.
   */
  private getAttachmentPointApproxCanvasPosition(
    renderer: BaseMonomerRenderer,
    apName: AttachmentPointName,
  ): Vec2 {
    const center = renderer.center;
    const angleDeg =
      attachmentPointNumberToAngle[
        apName as keyof typeof attachmentPointNumberToAngle
      ];
    // `attachmentPointNumberToAngle` stores the inward-facing angle (toward the
    // monomer centre).  Subtract 180° to get the outward direction used to
    // position the AP circle relative to the monomer body.
    const outwardAngleDeg = angleDeg - 180;
    const outwardAngleRad = (outwardAngleDeg * Math.PI) / 180;

    const { width, height } = renderer.monomerSize;
    // Average half-dimension approximates the body radius for a roughly
    // circular/square monomer: (w + h) / 2 gives the average side, then /2
    // gives the approximate radius → (w + h) / 4.
    const bodyRadius = (width + height) / 4;
    const apDistance =
      bodyRadius +
      AttachmentPoint.attachmentPointLength +
      AttachmentPoint.radius;

    return new Vec2(
      center.x + Math.cos(outwardAngleRad) * apDistance,
      center.y + Math.sin(outwardAngleRad) * apDistance,
    );
  }

  /**
   * Finds the nearest free attachment point of any on-canvas monomer
   * within the given threshold (pixels, ketcherRoot-relative) of `position`.
   */
  private findNearestFreeAttachmentPointForDrag(
    position: { x: number; y: number },
    threshold = DRAG_BOND_PROXIMITY_THRESHOLD_PX,
  ): AttachmentPointTarget | null {
    const rootOffset = this.deps.getKetcherRootRect();
    if (!rootOffset) return null;

    const canvasOffset = this.deps.getCanvasOffset();
    // Offset of canvas top-left relative to ketcherRoot
    const canvasRelLeft = canvasOffset.left - rootOffset.left;
    const canvasRelTop = canvasOffset.top - rootOffset.top;

    let nearest: AttachmentPointTarget | null = null;
    let minDist = threshold;

    for (const [, monomer] of this.deps.drawingEntitiesManager.monomers) {
      const renderer = monomer.renderer;
      if (!renderer || !(renderer instanceof BaseMonomerRenderer)) continue;

      for (const apName of monomer.unUsedAttachmentPointsNamesList) {
        // Skip if this AP's angle is not defined (unusual AP names)
        if (
          !(apName in (attachmentPointNumberToAngle as Record<string, unknown>))
        ) {
          continue;
        }

        const apCanvasPos = this.getAttachmentPointApproxCanvasPosition(
          renderer,
          apName,
        );
        const apViewPos = Coordinates.canvasToView(apCanvasPos);

        // Convert view position to ketcherRoot-relative
        const apScreenX = canvasRelLeft + apViewPos.x;
        const apScreenY = canvasRelTop + apViewPos.y;

        const dist = Math.sqrt(
          (position.x - apScreenX) ** 2 + (position.y - apScreenY) ** 2,
        );

        if (dist < minDist) {
          minDist = dist;
          nearest = { monomer, attachmentPointName: apName };
        }
      }
    }

    return nearest;
  }

  /**
   * Updates an attachment-point drag target field and synchronises the
   * corresponding renderer flag.
   *
   * Compares `previousTarget` against `nextTarget`: if they differ, clears the
   * renderer flag on the old target (if any), sets it on the new one (if any),
   * and returns the `nextTarget` value. If nothing changed, returns
   * `previousTarget` unchanged so callers can detect a no-op.
   */
  private updateAttachmentPointTarget(
    previousTarget: AttachmentPointTarget | null,
    nextTarget: AttachmentPointTarget | null,
    applyRendererFlag: (
      monomer: BaseMonomer,
      apName: AttachmentPointName | null,
    ) => void,
  ): {
    updatedTarget: AttachmentPointTarget | null;
    hasTargetChanged: boolean;
  } {
    const hasTargetChanged =
      nextTarget?.monomer !== previousTarget?.monomer ||
      nextTarget?.attachmentPointName !== previousTarget?.attachmentPointName;

    if (!hasTargetChanged) {
      return { updatedTarget: previousTarget, hasTargetChanged: false };
    }

    if (previousTarget) {
      applyRendererFlag(previousTarget.monomer, null);
    }
    if (nextTarget) {
      applyRendererFlag(nextTarget.monomer, nextTarget.attachmentPointName);
    }
    return { updatedTarget: nextTarget, hasTargetChanged: true };
  }

  // ---------------------------------------------------------------------------
  // Private: preset bonding partner resolution
  // ---------------------------------------------------------------------------

  /**
   * For a preset being dropped onto a target attachment point, find the
   * best monomer within the preset to form the bond.
   *
   * Delegates to the shared `findPresetMonomerForBonding` helper in
   * `bondConnectionHelpers` so that the logic can be unit-tested
   * independently.
   *
   * Implements requirements 3.1–3.3:
   * - R1 target → preset component with free R2
   * - R2 target → preset component with free R1
   * - Otherwise → sugar (if free), then phosphate (if free), then base (if free)
   */
  private findPresetMonomerForBonding(
    addedMonomers: BaseMonomer[],
    targetAP: AttachmentPointName,
  ): BaseMonomer | undefined {
    return findPresetMonomerForBondingHelper(addedMonomers, targetAP);
  }
}
