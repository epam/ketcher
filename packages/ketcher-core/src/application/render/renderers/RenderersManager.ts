import { CoreEditor } from 'application/editor';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import {
  PeptideRenderer,
  PhosphateRenderer,
  SugarRenderer,
  UnsplitNucleotideRenderer,
} from 'application/render';
import { notifyRenderComplete } from 'application/render/internal';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { PolymerBondRendererFactory } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRendererFactory';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import assert from 'assert';
import { Peptide, Phosphate, Sugar, UnsplitNucleotide } from 'domain/entities';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { PolymerBond } from 'domain/entities/PolymerBond';
import {
  checkIsR2R1Connection,
  getNextMonomerInChain,
  getRnaBaseFromSugar,
  isMonomerBeginningOfChain,
  isPeptideOrAmbiguousPeptide,
  isRnaBaseOrAmbiguousRnaBase,
} from 'domain/helpers/monomers';
import { AttachmentPointName } from 'domain/types';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { AmbiguousMonomerRenderer } from 'application/render/renderers/AmbiguousMonomerRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { BondRenderer } from 'application/render/renderers/BondRenderer';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBondRenderer } from 'application/render/renderers/MonomerToAtomBondRenderer';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

type FlexModeOrSnakeModePolymerBondRenderer =
  | FlexModePolymerBondRenderer
  | SnakeModePolymerBondRenderer;

export class RenderersManager {
  // FIXME: Specify the types.
  private theme;
  public monomers: Map<number, BaseMonomerRenderer | AmbiguousMonomerRenderer> =
    new Map();

  public polymerBonds = new Map<
    number,
    FlexModeOrSnakeModePolymerBondRenderer
  >();

  public atoms = new Map<number, AtomRenderer>();

  public bonds = new Map<number, BondRenderer>();

  private needRecalculateMonomersEnumeration = false;
  private needRecalculateMonomersBeginning = false;

  constructor({ theme }) {
    this.theme = theme;
  }

  public hoverDrawingEntity(drawingEntity: DrawingEntity) {
    assert(drawingEntity.baseRenderer);
    drawingEntity.baseRenderer.redrawHover();
  }

  public selectDrawingEntity(drawingEntity: DrawingEntity) {
    assert(drawingEntity.baseRenderer);
    drawingEntity.baseRenderer.drawSelection();
  }

  public moveDrawingEntity(drawingEntity: DrawingEntity) {
    assert(drawingEntity.baseRenderer);
    drawingEntity.baseRenderer.moveSelection();
    drawingEntity.baseRenderer.drawSelection();
  }

  private markForReEnumeration() {
    this.needRecalculateMonomersEnumeration = true;
  }

  public markForRecalculateBegin() {
    this.needRecalculateMonomersBeginning = true;
  }

  public addMonomer(
    monomer: BaseMonomer | AmbiguousMonomer,
    callback?: () => void,
  ) {
    let monomerRenderer;

    if (monomer instanceof AmbiguousMonomer) {
      monomerRenderer = new AmbiguousMonomerRenderer(monomer);
    } else {
      const MonomerRenderer = monomerFactory(monomer.monomerItem)[1];
      monomerRenderer = new MonomerRenderer(monomer);
    }

    this.monomers.set(monomer.id, monomerRenderer);
    monomerRenderer.show(this.theme);
    this.markForReEnumeration();
    this.markForRecalculateBegin();
    if (callback) {
      callback();
    }
  }

  public moveMonomer(monomer: BaseMonomer) {
    monomer.renderer?.move();
    monomer.renderer?.drawSelection();
  }

  public redrawDrawingEntity(drawingEntity: DrawingEntity, force = false) {
    drawingEntity.baseRenderer?.remove();
    drawingEntity.baseRenderer?.show(this.theme, force);
  }

  public deleteAllDrawingEntities() {
    this.monomers.forEach((monomerRenderer) => {
      monomerRenderer.remove();
    });
    this.polymerBonds.forEach((polymerBondRenderer) => {
      polymerBondRenderer.remove();
    });
  }

  public deleteMonomer(monomer: BaseMonomer) {
    monomer.renderer?.remove();
    this.monomers.delete(monomer.id);
    this.markForReEnumeration();
    this.markForRecalculateBegin();
  }

  public addPolymerBond(polymerBond: PolymerBond): void {
    const polymerBondRenderer =
      PolymerBondRendererFactory.createInstance(polymerBond);
    this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    polymerBondRenderer.show();
    polymerBondRenderer.polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    this.markForReEnumeration();
    this.markForRecalculateBegin();
  }

  public movePolymerBond(polymerBond: PolymerBond) {
    polymerBond.renderer?.moveStart();
    polymerBond.renderer?.moveEnd();
    polymerBond.renderer?.drawSelection();
    // If we started bond from the specific AP, it needs to be redrawn to face the bond direction
    if (polymerBond.firstMonomer.chosenFirstAttachmentPointForBond) {
      polymerBond.firstMonomer.renderer?.redrawAttachmentPointsCoordinates();
    }
  }

  public showPolymerBondInformation(polymerBond: PolymerBond) {
    polymerBond.renderer?.redrawHover();
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.redrawHover();
    polymerBond.secondMonomer?.renderer?.redrawAttachmentPoints();
    polymerBond.secondMonomer?.renderer?.redrawHover();
  }

  public deletePolymerBond(
    polymerBond: PolymerBond,
    recalculateEnumeration = true,
    recalculateBeginning = true,
  ) {
    polymerBond.renderer?.remove();
    polymerBond?.firstMonomer?.renderer?.redrawAttachmentPoints?.();
    polymerBond?.secondMonomer?.renderer?.redrawAttachmentPoints?.();
    this.polymerBonds.delete(polymerBond.id);
    if (recalculateEnumeration) {
      this.markForReEnumeration();
    }
    if (recalculateBeginning) {
      this.markForRecalculateBegin();
    }
  }

  private recalculatePeptideChainEnumeration(
    peptideRenderer: PeptideRenderer,
    _currentEnumeration = 1,
  ) {
    let currentEnumeration = _currentEnumeration;
    const stack = [{ monomerRenderer: peptideRenderer }];

    while (stack.length > 0) {
      const stackItem = stack.pop();
      assert(stackItem);
      const { monomerRenderer } = stackItem;

      monomerRenderer.setEnumeration(currentEnumeration);
      monomerRenderer.redrawEnumeration();

      const nextMonomer = getNextMonomerInChain(monomerRenderer.monomer);

      if (
        !isPeptideOrAmbiguousPeptide(nextMonomer) ||
        nextMonomer === peptideRenderer.monomer
      ) {
        return;
      }

      const isR2R1Connection = checkIsR2R1Connection(
        monomerRenderer.monomer,
        nextMonomer,
      );

      if (!isR2R1Connection) {
        return;
      }

      assert(nextMonomer.renderer);

      stack.push({ monomerRenderer: nextMonomer.renderer as PeptideRenderer });
      currentEnumeration++;
    }
  }

  private recalculateRnaChainEnumeration(
    rnaComponentRenderer: BaseMonomerRenderer,
    _currentEnumeration = 1,
  ) {
    let currentEnumeration = _currentEnumeration;
    const stack = [{ monomerRenderer: rnaComponentRenderer }];

    while (stack.length > 0) {
      const stackItem = stack.pop();
      assert(stackItem);
      const { monomerRenderer } = stackItem;

      if (monomerRenderer instanceof SugarRenderer) {
        const rnaBaseMonomer = getRnaBaseFromSugar(
          monomerRenderer.monomer as Sugar,
        );
        if (isRnaBaseOrAmbiguousRnaBase(rnaBaseMonomer)) {
          rnaBaseMonomer.renderer?.setEnumeration(currentEnumeration);
          rnaBaseMonomer.renderer?.redrawEnumeration();
          currentEnumeration++;
        }
      }

      if (monomerRenderer instanceof UnsplitNucleotideRenderer) {
        monomerRenderer.setEnumeration(currentEnumeration);
        monomerRenderer.redrawEnumeration();
        currentEnumeration++;
      }

      const nextMonomer = getNextMonomerInChain(monomerRenderer.monomer);

      if (
        (!(nextMonomer instanceof Sugar) &&
          !(nextMonomer instanceof Phosphate) &&
          !(nextMonomer instanceof UnsplitNucleotide)) ||
        nextMonomer === rnaComponentRenderer.monomer
      ) {
        return;
      }

      const isR2R1Connection = checkIsR2R1Connection(
        monomerRenderer.monomer,
        nextMonomer,
      );

      if (
        !isR2R1Connection ||
        !(nextMonomer.renderer instanceof BaseMonomerRenderer)
      ) {
        return;
      }

      stack.push({
        monomerRenderer: nextMonomer.renderer,
      });
    }
  }

  private recalculatePeptideEnumeration(
    peptideRenderer: PeptideRenderer,
    firstMonomers: BaseMonomer[],
  ) {
    if (!peptideRenderer.monomer.hasBonds) {
      peptideRenderer.setEnumeration(null);
      peptideRenderer.redrawEnumeration();
    }
    if (
      !isMonomerBeginningOfChain(peptideRenderer.monomer, [Peptide]) &&
      !firstMonomers.includes(peptideRenderer.monomer)
    ) {
      return;
    }

    this.recalculatePeptideChainEnumeration(peptideRenderer);
  }

  private recalculateRnaEnumeration(
    rnaComponentRenderer: BaseMonomerRenderer,
    firstMonomers: BaseMonomer[],
  ) {
    if (
      !isMonomerBeginningOfChain(rnaComponentRenderer.monomer, [
        Phosphate,
        Sugar,
        UnsplitNucleotide,
      ]) &&
      !firstMonomers.includes(rnaComponentRenderer.monomer)
    ) {
      return;
    }

    this.recalculateRnaChainEnumeration(rnaComponentRenderer);
  }

  private recalculateMonomersEnumeration() {
    const editor = CoreEditor.provideEditorInstance();
    const [, firstMonomersInCyclicChains] =
      ChainsCollection.getFirstMonomersInChains([
        ...editor.drawingEntitiesManager.monomers.values(),
      ]);

    this.monomers.forEach((monomerRenderer) => {
      if (isPeptideOrAmbiguousPeptide(monomerRenderer.monomer)) {
        this.recalculatePeptideEnumeration(
          monomerRenderer as PeptideRenderer,
          firstMonomersInCyclicChains,
        );
      }

      if (
        monomerRenderer instanceof UnsplitNucleotideRenderer ||
        monomerRenderer instanceof PhosphateRenderer ||
        monomerRenderer instanceof SugarRenderer ||
        monomerRenderer instanceof AmbiguousMonomerRenderer
      ) {
        this.recalculateRnaEnumeration(
          monomerRenderer as BaseMonomerRenderer,
          firstMonomersInCyclicChains,
        );
      }

      if (
        isRnaBaseOrAmbiguousRnaBase(monomerRenderer.monomer) &&
        !monomerRenderer.monomer.isAttachmentPointUsed(AttachmentPointName.R1)
      ) {
        monomerRenderer.setEnumeration(null);
        monomerRenderer.redrawEnumeration();
      }
    });

    this.needRecalculateMonomersEnumeration = false;
  }

  private isOnlyPartOfRnaChain(sugar: Sugar) {
    const phosphate = getNextMonomerInChain(sugar);
    const nextMonomerAfterPhospate = getNextMonomerInChain(phosphate);
    return !sugar.attachmentPointsToBonds.R1 && !nextMonomerAfterPhospate;
  }

  private recalculateMonomersBeginning() {
    this.monomers.forEach((monomerRenderer) => {
      if (isPeptideOrAmbiguousPeptide(monomerRenderer.monomer)) {
        if (monomerRenderer.enumeration === 1) {
          monomerRenderer.setBeginning(monomerRenderer.CHAIN_BEGINNING);
        } else {
          monomerRenderer.setBeginning(null);
        }
        monomerRenderer.reDrawChainBeginning();
      }
      if (monomerRenderer instanceof SugarRenderer) {
        const rnaBaseMonomer = getRnaBaseFromSugar(
          monomerRenderer.monomer as Sugar,
        );
        if (
          isRnaBaseOrAmbiguousRnaBase(rnaBaseMonomer) &&
          rnaBaseMonomer.renderer?.enumeration === 1 &&
          !this.isOnlyPartOfRnaChain(monomerRenderer.monomer)
        ) {
          monomerRenderer.setBeginning(monomerRenderer.CHAIN_BEGINNING);
        } else {
          monomerRenderer.setBeginning(null);
        }
        monomerRenderer.reDrawChainBeginning();
      }
    });
    this.needRecalculateMonomersBeginning = false;
  }

  // FIXME: Specify the types.
  public finishPolymerBondCreation(polymerBond: PolymerBond) {
    assert(polymerBond.secondMonomer);

    const polymerBondRenderer =
      PolymerBondRendererFactory.createInstance(polymerBond);
    this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    this.markForReEnumeration();
    this.markForRecalculateBegin();
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.drawSelection();
    polymerBond.firstMonomer.renderer?.redrawHover();
    polymerBond.secondMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.secondMonomer.renderer?.drawSelection();
    polymerBond.secondMonomer.renderer?.redrawHover();

    polymerBond.renderer?.show();
  }

  public cancelPolymerBondCreation(
    polymerBond: PolymerBond,
    secondMonomer?: BaseMonomer,
  ) {
    this.deletePolymerBond(polymerBond);
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.drawSelection();
    polymerBond.firstMonomer.renderer?.redrawHover();
    secondMonomer?.renderer?.redrawAttachmentPoints();
    secondMonomer?.renderer?.drawSelection();
    secondMonomer?.renderer?.redrawHover();
  }

  public hoverMonomer(monomer: BaseMonomer, needRedrawAttachmentPoints) {
    this.hoverDrawingEntity(monomer as DrawingEntity);
    if (needRedrawAttachmentPoints) {
      monomer.renderer?.redrawAttachmentPoints();
    }
  }

  public hoverAttachmentPoint(
    monomer: BaseMonomer,
    attachmentPointName: AttachmentPointName,
  ) {
    this.hoverDrawingEntity(monomer as DrawingEntity);
    monomer.renderer?.hoverAttachmentPoint(attachmentPointName);
    monomer.renderer?.updateAttachmentPoints();
  }

  public update(modelChanges?: Command) {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;

    modelChanges?.execute(this);
    viewModel.initialize([...editor.drawingEntitiesManager.bonds.values()]);
    modelChanges?.executeAfterAllOperations(this);

    this.runPostRenderMethods();
    notifyRenderComplete();
  }

  public addAtom(atom: Atom) {
    const atomRenderer = new AtomRenderer(atom);

    this.atoms.set(atom.id, atomRenderer);
    atomRenderer.show();
  }

  public deleteAtom(atom: Atom) {
    this.atoms.delete(atom.id);
    atom.renderer?.remove();
  }

  public addBond(bond: Bond) {
    const bondRenderer = new BondRenderer(bond);

    this.bonds.set(bond.id, bondRenderer);
    bondRenderer.show();
  }

  public deleteBond(bond: Bond) {
    this.bonds.delete(bond.id);
    bond.renderer?.remove();
  }

  public addMonomerToAtomBond(bond: MonomerToAtomBond) {
    const bondRenderer = new MonomerToAtomBondRenderer(bond);

    bondRenderer.show();
    bond.monomer.renderer?.redrawAttachmentPoints();
    bond.monomer.renderer?.redrawHover();
  }

  public deleteMonomerToAtomBond(bond: MonomerToAtomBond) {
    bond.renderer?.remove();
  }

  public runPostRenderMethods() {
    if (this.needRecalculateMonomersEnumeration) {
      this.recalculateMonomersEnumeration();
    }
    if (this.needRecalculateMonomersBeginning) {
      this.recalculateMonomersBeginning();
    }
  }

  public static getRenderedStructuresBbox() {
    let left;
    let right;
    let top;
    let bottom;
    const editor = CoreEditor.provideEditorInstance();

    editor.drawingEntitiesManager.monomers.forEach((monomer) => {
      const monomerPosition = monomer.renderer?.scaledMonomerPosition;

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

  public rerenderSideConnectionPolymerBonds() {
    this.polymerBonds.forEach((polymerBondRenderer) => {
      if (!polymerBondRenderer.polymerBond.isSideChainConnection) {
        return;
      }

      polymerBondRenderer.remove();
      polymerBondRenderer.show(undefined, true);
    });
  }
}
