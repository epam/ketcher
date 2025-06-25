import { CoreEditor } from 'application/editor/Editor';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { notifyRenderComplete } from 'application/render/internal';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { PolymerBondRendererFactory } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRendererFactory';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import assert from 'assert';
import {
  HydrogenBond,
  LinkerSequenceNode,
  MonomerSequenceNode,
  Nucleoside,
  Nucleotide,
  Sugar,
  UnsplitNucleotide,
} from 'domain/entities';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { AmbiguousMonomerRenderer } from 'application/render/renderers/AmbiguousMonomerRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { BondRenderer } from 'application/render/renderers/BondRenderer';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBondRenderer } from 'application/render/renderers/MonomerToAtomBondRenderer';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { PhosphateSubChain } from 'domain/entities/monomer-chains/PhosphateSubChain';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { RxnArrowRenderer } from 'application/render/renderers/RxnArrowRenderer';
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import { MultitailArrowRenderer } from 'application/render/renderers/MultitailArrowRenderer';

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
    if (callback) {
      callback();
    }
  }

  public moveMonomer(monomer: BaseMonomer) {
    monomer.renderer?.move();
    monomer.renderer?.drawSelection();
  }

  public redrawDrawingEntity(
    drawingEntity: DrawingEntity,
    force = false,
    recalculateEnumeration = false,
  ) {
    drawingEntity.baseRenderer?.remove();
    drawingEntity.baseRenderer?.show(this.theme, force);
    if (recalculateEnumeration) {
      this.markForReEnumeration();
    }
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
  }

  public addPolymerBond(
    polymerBond: PolymerBond | HydrogenBond,
    redrawAttachmentPoints = true,
  ): void {
    const polymerBondRenderer =
      PolymerBondRendererFactory.createInstance(polymerBond);
    this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    polymerBondRenderer.show();
    if (redrawAttachmentPoints) {
      polymerBondRenderer.polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    }
    this.markForReEnumeration();
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
    polymerBond: PolymerBond | HydrogenBond,
    recalculateEnumeration = true,
    redrawAttachmentPoints = true,
  ) {
    polymerBond.renderer?.remove();
    if (redrawAttachmentPoints) {
      polymerBond?.firstMonomer?.renderer?.redrawAttachmentPoints?.();
      polymerBond?.secondMonomer?.renderer?.redrawAttachmentPoints?.();
    }
    this.polymerBonds.delete(polymerBond.id);
    if (recalculateEnumeration) {
      this.markForReEnumeration();
    }
  }

  private recalculatePeptideChainEnumeration(subChain: PeptideSubChain) {
    let currentEnumeration = 1;

    subChain.nodes.forEach((node) => {
      const monomerRenderer = node.monomer.renderer;
      const needToDrawTerminalIndicator = node.monomer.monomerItem.isAntisense
        ? currentEnumeration === subChain.length
        : currentEnumeration === 1;

      if (!monomerRenderer) {
        return;
      }

      monomerRenderer.setEnumeration(currentEnumeration);
      monomerRenderer.redrawEnumeration(needToDrawTerminalIndicator);
      currentEnumeration++;
    });
  }

  private recalculateRnaChainEnumeration(subChain: RnaSubChain) {
    let currentEnumeration = 1;
    const nucleotidesAmount = subChain.nodes.reduce(
      (nucleotidesAmount, node) =>
        node instanceof Nucleotide ||
        node instanceof Nucleoside ||
        node.monomer instanceof UnsplitNucleotide
          ? nucleotidesAmount + 1
          : nucleotidesAmount,
      0,
    );

    subChain.nodes.forEach((node) => {
      const needToDrawTerminalIndicator = node.monomer.monomerItem.isAntisense
        ? currentEnumeration === nucleotidesAmount
        : currentEnumeration === 1;

      if (node instanceof Nucleotide || node instanceof Nucleoside) {
        node.rnaBase.renderer?.setEnumeration(currentEnumeration);
        node.rnaBase.renderer?.redrawEnumeration(needToDrawTerminalIndicator);
        node.sugar.renderer?.setEnumeration(currentEnumeration);
        node.sugar.renderer?.redrawEnumeration(needToDrawTerminalIndicator);
        currentEnumeration++;
      } else if (node.monomer instanceof UnsplitNucleotide) {
        node.monomer.renderer?.setEnumeration(currentEnumeration);
        node.monomer.renderer?.redrawEnumeration(needToDrawTerminalIndicator);
        currentEnumeration++;
      } else if (
        node instanceof MonomerSequenceNode ||
        node instanceof LinkerSequenceNode
      ) {
        node.monomers.forEach((monomer) => {
          if (monomer instanceof Sugar) {
            monomer.renderer?.redrawEnumeration(false);
          }
        });
      }
    });
  }

  private recalculateMonomersEnumeration() {
    const editor = CoreEditor.provideEditorInstance();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);

    chainsCollection.chains.forEach((chain) => {
      chain.subChains.forEach((subChain) => {
        if (subChain instanceof PeptideSubChain) {
          this.recalculatePeptideChainEnumeration(subChain);
        } else if (
          subChain instanceof RnaSubChain ||
          subChain instanceof PhosphateSubChain
        ) {
          this.recalculateRnaChainEnumeration(subChain);
        }
      });
    });

    this.needRecalculateMonomersEnumeration = false;
  }

  // FIXME: Specify the types.
  public finishPolymerBondCreation(polymerBond: PolymerBond) {
    assert(polymerBond.secondMonomer);

    const polymerBondRenderer =
      PolymerBondRendererFactory.createInstance(polymerBond);
    this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    this.markForReEnumeration();
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

  public reinitializeViewModel() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    viewModel.initialize([...editor.drawingEntitiesManager.bonds.values()]);
  }

  public update(modelChanges?: Command) {
    this.reinitializeViewModel();
    modelChanges?.execute(this);
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
    this.redrawDrawingEntity(bond.atom);

    bondRenderer.show();
    bond.monomer.renderer?.redrawAttachmentPoints();
    bond.monomer.renderer?.redrawHover();
  }

  public deleteMonomerToAtomBond(bond: MonomerToAtomBond) {
    bond.renderer?.remove();
    this.redrawDrawingEntity(bond.atom);
  }

  public addRxnArrow(arrow: RxnArrow) {
    const arrowRenderer = new RxnArrowRenderer(arrow);

    arrowRenderer.show();
  }

  public deleteRxnArrow(arrow: RxnArrow) {
    arrow.renderer?.remove();
  }

  public addMultitailArrow(arrow: MultitailArrow) {
    const arrowRenderer = new MultitailArrowRenderer(arrow);

    arrowRenderer.show();
  }

  public deleteMultitailArrow(arrow: MultitailArrow) {
    arrow.renderer?.remove();
  }

  public runPostRenderMethods() {
    if (this.needRecalculateMonomersEnumeration) {
      this.recalculateMonomersEnumeration();
    }
  }

  public static getRenderedStructuresBbox(monomers?: BaseMonomer[]) {
    let left;
    let right;
    let top;
    let bottom;
    const editor = CoreEditor.provideEditorInstance();

    (monomers || editor.drawingEntitiesManager.monomers).forEach((monomer) => {
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
      if (
        !polymerBondRenderer.polymerBond.isSideChainConnection &&
        !polymerBondRenderer.polymerBond.isOverlappedByMonomer
      ) {
        return;
      }

      polymerBondRenderer.remove();
      polymerBondRenderer.show(undefined, true);
    });
  }
}
