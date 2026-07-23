import { Vec2 } from 'domain/entities';
import { Command } from 'domain/entities/Command';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  type AttachmentPointName,
  type MonomerOrAmbiguousType,
} from 'domain/types';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseMonomerRenderer } from 'application/render';
import type { IEditorEvents } from 'application/editor/editorEvents';
import type {
  AttachmentPointTarget,
  LibraryItemDragState,
} from 'application/editor/editor.types';
import { attachmentPointNumberToAngle } from 'domain/helpers/attachmentPointCalculations';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import { Coordinates } from 'application/editor/shared/coordinates';
import { EditorHistory } from 'application/editor/EditorHistory';
import { isLibraryItemRnaPreset } from 'domain/helpers/monomers';
import { findPresetMonomerForBonding as findPresetMonomerForBondingHelper } from 'application/editor/tools/bondConnectionHelpers';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import type { DragDropModalContext } from './libraryItemDragDrop.types';
import {
  applyPresetMirroringIfNeeded,
  computeAndApplyFlexDropRepositioning,
} from './repositioning';

const DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25;
const DRAG_CIRCLE_HOVER_THRESHOLD_PX = 20;

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
    | 'error'
  >;
  getCanvasOffset(): DOMRect;
  getKetcherRootRect(): DOMRect | undefined;
  getModeName(): string;
  getEditor(): object; // CoreEditor — typed as object to avoid circular dep; used only for EditorHistory
  placeItemOnCanvas(
    item: IRnaPreset | MonomerOrAmbiguousType,
    position: Vec2,
  ): IAutochainMonomerAddResult | undefined;
  calculateAndStoreNextAutochainPosition(lastMonomer: BaseMonomer): void;
}

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
 */
export class LibraryItemDragDropHandler {
  private dragDropBondTarget: AttachmentPointTarget | null = null;
  private dragCircleHoverTarget: AttachmentPointTarget | null = null;
  private isDragDropBondModalOpen = false;
  private dragDropModalContext: DragDropModalContext | null = null;
  /** Tracks whether a library-item drag is currently in progress. */
  private currentDragState: LibraryItemDragState = null;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = EditorHistory.getInstance(getEditor() as any);
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
    }
  }

  /**
   * Called on each drag event from the library. Updates the visual hover state
   * to indicate the nearest free attachment point.
   */
  private onLibraryItemDragOver(
    state: NonNullable<LibraryItemDragState>,
  ): void {
    // Skip in sequence mode
    if (this.deps.getModeName() === 'sequence-layout-mode') return;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = EditorHistory.getInstance(getEditor() as any);
    history.update(modelChanges);
    renderersContainer.update(modelChanges);
    calculateAndStoreNextAutochainPosition(monomersAddResult.lastMonomer);
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
