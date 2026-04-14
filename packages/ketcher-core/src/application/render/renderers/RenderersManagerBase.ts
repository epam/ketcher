import assert from 'assert';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { Chem } from 'domain/entities/Chem';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import { RxnPlus } from 'domain/entities/CoreRxnPlus';
import { AttachmentPointName } from 'domain/types';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';

export abstract class RenderersManagerBase {
  abstract update(modelChanges?: Command): void;
  abstract reinitializeViewModel(): void;
  abstract runPostRenderMethods(): void;

  // Monomer operations
  abstract addMonomer(
    monomer: BaseMonomer | AmbiguousMonomer,
    callback?: () => void,
  ): void;

  abstract deleteMonomer(monomer: BaseMonomer): void;
  abstract moveMonomer(monomer: BaseMonomer): void;
  abstract hoverMonomer(
    monomer: BaseMonomer,
    needRedrawAttachmentPoints: boolean,
  ): void;

  abstract hoverAttachmentPoint(
    monomer: BaseMonomer,
    attachmentPointName: AttachmentPointName,
  ): void;

  // Polymer bond operations
  abstract addPolymerBond(
    polymerBond: PolymerBond | HydrogenBond,
    redrawAttachmentPoints?: boolean,
  ): void;

  abstract deletePolymerBond(
    polymerBond: PolymerBond | HydrogenBond,
    recalculateEnumeration?: boolean,
    redrawAttachmentPoints?: boolean,
  ): void;

  abstract movePolymerBond(polymerBond: PolymerBond): void;
  abstract showPolymerBondInformation(polymerBond: PolymerBond): void;
  abstract finishPolymerBondCreation(polymerBond: PolymerBond): void;
  abstract cancelPolymerBondCreation(
    polymerBond: PolymerBond,
    secondMonomer?: BaseMonomer,
  ): void;

  abstract rerenderSideConnectionPolymerBonds(): void;

  // Drawing entity operations
  abstract hoverDrawingEntity(drawingEntity: DrawingEntity): void;
  abstract selectDrawingEntity(drawingEntity: DrawingEntity): void;
  abstract moveDrawingEntity(drawingEntity: DrawingEntity): void;
  abstract redrawDrawingEntity(
    drawingEntity: DrawingEntity,
    force?: boolean,
    recalculateEnumeration?: boolean,
  ): void;

  // Atom/Bond operations
  abstract addAtom(atom: Atom): void;
  abstract deleteAtom(atom: Atom): void;
  abstract addBond(bond: Bond): void;
  abstract deleteBond(bond: Bond): void;
  abstract addMonomerToAtomBond(bond: MonomerToAtomBond): void;
  abstract deleteMonomerToAtomBond(bond: MonomerToAtomBond): void;

  // Reaction operations
  abstract addRxnArrow(arrow: RxnArrow): void;
  abstract deleteRxnArrow(arrow: RxnArrow): void;
  abstract addMultitailArrow(arrow: MultitailArrow): void;
  abstract deleteMultitailArrow(arrow: MultitailArrow): void;
  abstract addRxnPlus(rxnPlus: RxnPlus): void;
  abstract deleteRxnPlus(rxnPlus: RxnPlus): void;

  static getRenderedStructuresBbox(drawingEntities?: DrawingEntity[]) {
    let left;
    let right;
    let top;
    let bottom;
    const editor = provideEditorInstance();

    (
      drawingEntities ||
      [
        ...editor.drawingEntitiesManager.monomers.values(),
        ...editor.drawingEntitiesManager.atoms.values(),
      ].filter(
        (drawindEntity) =>
          !(
            drawindEntity instanceof Chem &&
            drawindEntity.monomerItem.props.isMicromoleculeFragment &&
            !isMonomerSgroupWithAttachmentPoints(drawindEntity)
          ),
      )
    ).forEach((monomer) => {
      if (
        !(monomer.baseRenderer instanceof BaseSequenceItemRenderer) &&
        !(monomer.baseRenderer instanceof BaseMonomerRenderer) &&
        !(monomer.baseRenderer instanceof AtomRenderer)
      ) {
        return;
      }

      const monomerPosition = monomer.baseRenderer?.scaledPosition;

      assert(monomerPosition);

      left = left ? Math.min(left, monomerPosition.x) : monomerPosition.x;
      right = right ? Math.max(right, monomerPosition.x) : monomerPosition.x;
      top = top ? Math.min(top, monomerPosition.y) : monomerPosition.y;
      bottom = bottom ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
    });
    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }
}
