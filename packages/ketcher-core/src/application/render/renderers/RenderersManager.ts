import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Command } from 'domain/entities/Command';
import assert from 'assert';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import {
  PeptideRenderer,
  PhosphateRenderer,
  RNABaseRenderer,
  SugarRenderer,
} from 'application/render';
import { notifyRenderComplete } from 'application/render/internal';
import { Peptide, Sugar, RNABase, Phosphate } from 'domain/entities';
import {
  checkIsR2R1Connection,
  getNextMonomerInChain,
  getRnaBaseMonomerFromSugar,
  isMonomerBeginningOfChain,
} from 'domain/helpers/monomers';

export class RenderersManager {
  private theme;
  public monomers: Map<number, BaseMonomerRenderer> = new Map();
  public polymerBonds: Map<number, PolymerBondRenderer> = new Map();
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

  public addMonomer(monomer: BaseMonomer, callback?: () => void) {
    const [, MonomerRenderer] = monomerFactory(monomer.monomerItem);
    const monomerRenderer = new MonomerRenderer(monomer);
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

  public redrawDrawingEntity(drawingEntity: DrawingEntity) {
    drawingEntity.baseRenderer?.remove();
    drawingEntity.baseRenderer?.show(this.theme);
  }

  public deleteMonomer(monomer: BaseMonomer) {
    monomer.renderer?.remove();
    this.monomers.delete(monomer.id);
    this.markForReEnumeration();
    this.markForRecalculateBegin();
  }

  public addPolymerBond(polymerBond: PolymerBond) {
    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
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
    polymerBond?.firstMonomer?.renderer?.redrawAttachmentPoints();
    polymerBond?.secondMonomer?.renderer?.redrawAttachmentPoints();
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
    currentEnumeration = 1,
  ) {
    peptideRenderer.setEnumeration(currentEnumeration);
    peptideRenderer.redrawEnumeration();

    const nextMonomer = getNextMonomerInChain(peptideRenderer.monomer);

    if (!(nextMonomer instanceof Peptide)) {
      return;
    }

    const isR2R1Connection = checkIsR2R1Connection(
      peptideRenderer.monomer,
      nextMonomer,
    );

    if (!isR2R1Connection) {
      return;
    }

    assert(nextMonomer.renderer);

    this.recalculatePeptideChainEnumeration(
      nextMonomer.renderer as PeptideRenderer,
      currentEnumeration + 1,
    );
  }

  private recalculateRnaChainEnumeration(
    rnaComponentRenderer: BaseMonomerRenderer,
    _currentEnumeration = 1,
  ) {
    let currentEnumeration = _currentEnumeration;
    if (rnaComponentRenderer instanceof SugarRenderer) {
      const rnaBaseMonomer = getRnaBaseMonomerFromSugar(
        rnaComponentRenderer.monomer as Sugar,
      );
      if (rnaBaseMonomer instanceof RNABase) {
        rnaBaseMonomer.renderer?.setEnumeration(currentEnumeration);
        rnaBaseMonomer.renderer?.redrawEnumeration();
        currentEnumeration++;
      }
    }

    const nextMonomer = getNextMonomerInChain(rnaComponentRenderer.monomer);

    if (
      !(nextMonomer instanceof Sugar) &&
      !(nextMonomer instanceof Phosphate)
    ) {
      return;
    }

    const isR2R1Connection = checkIsR2R1Connection(
      rnaComponentRenderer.monomer,
      nextMonomer,
    );

    if (!isR2R1Connection) {
      return;
    }

    assert(nextMonomer.renderer);

    this.recalculateRnaChainEnumeration(
      nextMonomer.renderer,
      currentEnumeration,
    );
  }

  private recalculatePeptideEnumeration(peptideRenderer: PeptideRenderer) {
    if (!peptideRenderer.monomer.hasBonds) {
      peptideRenderer.setEnumeration(null);
      peptideRenderer.redrawEnumeration();
    }

    if (!isMonomerBeginningOfChain(peptideRenderer.monomer, [Peptide])) return;

    this.recalculatePeptideChainEnumeration(peptideRenderer);
  }

  private recalculateRnaEnumeration(rnaComponentRenderer: BaseMonomerRenderer) {
    if (
      !isMonomerBeginningOfChain(rnaComponentRenderer.monomer, [
        Phosphate,
        Sugar,
      ])
    )
      return;
    this.recalculateRnaChainEnumeration(rnaComponentRenderer);
  }

  private recalculateMonomersEnumeration() {
    this.monomers.forEach((monomerRenderer) => {
      if (monomerRenderer instanceof PeptideRenderer) {
        this.recalculatePeptideEnumeration(monomerRenderer as PeptideRenderer);
      }
      if (
        monomerRenderer instanceof PhosphateRenderer ||
        monomerRenderer instanceof SugarRenderer
      ) {
        this.recalculateRnaEnumeration(monomerRenderer as BaseMonomerRenderer);
      }
      if (
        monomerRenderer instanceof RNABaseRenderer &&
        !monomerRenderer.monomer.isAttachmentPointUsed('R1')
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
      if (monomerRenderer instanceof PeptideRenderer) {
        if (monomerRenderer.enumeration === 1) {
          monomerRenderer.setBeginning(monomerRenderer.CHAIN_BEGINNING);
        } else {
          monomerRenderer.setBeginning(null);
        }
        monomerRenderer.reDrawChainBeginning();
      }
      if (monomerRenderer instanceof SugarRenderer) {
        const rnaBaseMonomer = getRnaBaseMonomerFromSugar(
          monomerRenderer.monomer as Sugar,
        );
        if (
          rnaBaseMonomer instanceof RNABase &&
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

  public finishPolymerBondCreation(polymerBond: PolymerBond) {
    assert(polymerBond.secondMonomer);

    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
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
    monomer.renderer?.hoverAttachmenPoint(attachmentPointName);
    monomer.renderer?.redrawAttachmentPoints();
  }

  public update(modelChanges: Command) {
    modelChanges.execute(this);
    this.runPostRenderMethods();
    notifyRenderComplete();
  }

  public runPostRenderMethods() {
    if (this.needRecalculateMonomersEnumeration) {
      this.recalculateMonomersEnumeration();
    }
    if (this.needRecalculateMonomersBeginning) {
      this.recalculateMonomersBeginning();
    }
  }
}
