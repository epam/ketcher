import { CoreEditor } from 'application/editor/Editor';
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
import {
  MonomerSequenceNode,
  Nucleoside,
  Nucleotide,
  Peptide,
  Phosphate,
  Sugar,
  UnsplitNucleotide,
} from 'domain/entities';
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
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';

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
  }

  public addPolymerBond(polymerBond: PolymerBond): void {
    const polymerBondRenderer =
      PolymerBondRendererFactory.createInstance(polymerBond);
    this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    polymerBondRenderer.show();
    polymerBondRenderer.polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
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
    polymerBond: PolymerBond,
    recalculateEnumeration = true,
  ) {
    polymerBond.renderer?.remove();
    polymerBond?.firstMonomer?.renderer?.redrawAttachmentPoints?.();
    polymerBond?.secondMonomer?.renderer?.redrawAttachmentPoints?.();
    this.polymerBonds.delete(polymerBond.id);
    if (recalculateEnumeration) {
      this.markForReEnumeration();
    }
  }

  private recalculatePeptideChainEnumeration(subChain: PeptideSubChain) {
    let currentEnumeration = 1;

    subChain.nodes.forEach((node) => {
      const monomerRenderer = node.monomer.renderer;
      const monomerEnumeration = node.monomer.monomerItem.isAntisense
        ? subChain.length - currentEnumeration + 1
        : currentEnumeration;

      if (!monomerRenderer) {
        return;
      }

      monomerRenderer.setEnumeration(monomerEnumeration);
      monomerRenderer.redrawEnumeration(subChain.length);
      currentEnumeration++;
    });
  }

  private recalculateRnaChainEnumeration(subChain: RnaSubChain) {
    let currentEnumeration = 1;

    subChain.nodes.forEach((node) => {
      const monomerEnumeration = node.monomer.monomerItem.isAntisense
        ? subChain.length - currentEnumeration + 1
        : currentEnumeration;

      if (node instanceof Nucleotide || node instanceof Nucleoside) {
        node.rnaBase.renderer?.setEnumeration(monomerEnumeration);
        node.rnaBase.renderer?.redrawEnumeration(subChain.length);
        node.sugar.renderer?.setEnumeration(monomerEnumeration);
        node.sugar.renderer?.redrawEnumeration(subChain.length);
        currentEnumeration++;
      } else if (node instanceof MonomerSequenceNode) {
        node.monomer.renderer?.setEnumeration(monomerEnumeration);
        node.monomer.renderer?.redrawEnumeration(subChain.length);
        currentEnumeration++;
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
        } else if (subChain instanceof RnaSubChain) {
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
