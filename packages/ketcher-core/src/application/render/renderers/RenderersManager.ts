import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Command } from 'domain/entities/Command';
import assert from 'assert';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import {
  PeptideRenderer,
  PhosphateRenderer,
  RNABaseRenderer,
  SugarRenderer,
} from 'application/render';
import { Peptide } from 'domain/entities';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { Phosphate } from 'domain/entities/Phosphate';

export class RenderersManager {
  private theme;
  public monomers: Map<number, BaseMonomerRenderer> = new Map();
  public polymerBonds: Map<number, PolymerBondRenderer> = new Map();
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

  public addMonomer(monomer: BaseMonomer, callback?: () => void) {
    const [, MonomerRenderer] = monomerFactory(monomer.monomerItem);
    const monomerRenderer = new MonomerRenderer(monomer);
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

  public redrawDrawingEntity(drawingEntity: DrawingEntity) {
    drawingEntity.baseRenderer?.remove();
    drawingEntity.baseRenderer?.show(this.theme);
  }

  public deleteMonomer(monomer: BaseMonomer) {
    monomer.renderer?.remove();
    this.monomers.delete(monomer.id);
    this.markForReEnumeration();
  }

  public addPolymerBond(polymerBond) {
    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
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

  public showPolymerBondInformation(polymerBond) {
    polymerBond.renderer?.redrawHover();
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.redrawHover();
    polymerBond.secondMonomer?.renderer?.redrawAttachmentPoints();
    polymerBond.secondMonomer?.renderer?.redrawHover();
  }

  public deletePolymerBond(polymerBond, recalculateEnumeration = true) {
    polymerBond.renderer?.remove();
    polymerBond?.firstMonomer?.renderer?.redrawAttachmentPoints();
    polymerBond?.secondMonomer?.renderer?.redrawAttachmentPoints();
    this.polymerBonds.delete(polymerBond.id);
    if (recalculateEnumeration) {
      this.markForReEnumeration();
    }
  }

  private getNextMonomerInChain(monomer: BaseMonomer) {
    const r2PolymerBond = monomer.attachmentPointsToBonds.R2;

    return r2PolymerBond?.getAnotherMonomer(monomer);
  }

  private isR2R1Connection(monomer, nextMonomer) {
    return (
      nextMonomer.attachmentPointsToBonds.R1?.getAnotherMonomer(nextMonomer) ===
      monomer
    );
  }

  private recalculatePeptideChainEnumeration(
    peptideRenderer: PeptideRenderer,
    currentEnumeration = 1,
  ) {
    peptideRenderer.setEnumeration(currentEnumeration);
    peptideRenderer.redrawEnumeration();

    const nextMonomer = this.getNextMonomerInChain(peptideRenderer.monomer);

    if (!(nextMonomer instanceof Peptide)) {
      return;
    }

    const isR2R1Connection = this.isR2R1Connection(
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
      const r3PolymerBond =
        rnaComponentRenderer.monomer.attachmentPointsToBonds.R3;

      const rnaBaseMonomer = r3PolymerBond?.getAnotherMonomer(
        rnaComponentRenderer.monomer,
      );

      if (rnaBaseMonomer instanceof RNABase) {
        rnaBaseMonomer.renderer?.setEnumeration(currentEnumeration);
        rnaBaseMonomer.renderer?.redrawEnumeration();
        currentEnumeration++;
      }
    }

    const nextMonomer = this.getNextMonomerInChain(
      rnaComponentRenderer.monomer,
    );

    if (
      !(nextMonomer instanceof Sugar) &&
      !(nextMonomer instanceof Phosphate)
    ) {
      return;
    }

    const isR2R1Connection = this.isR2R1Connection(
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

  private isMonomerBeginningOfChain(
    monomer: BaseMonomer,
    MonomerTypes: Array<typeof Peptide | typeof Phosphate | typeof Sugar>,
  ) {
    const r1PolymerBond = monomer.attachmentPointsToBonds.R1;
    const previousMonomer = r1PolymerBond?.getAnotherMonomer(monomer);
    const isPreviousMonomerPartOfChain =
      previousMonomer &&
      !MonomerTypes.some(
        (MonomerType) => previousMonomer instanceof MonomerType,
      );
    const previousConnectionNotR2 =
      r1PolymerBond &&
      previousMonomer?.getAttachmentPointByBond(r1PolymerBond) !== 'R2';

    return (
      ((monomer.isAttachmentPointExistAndFree('R1') ||
        !monomer.hasAttachmentPoint('R1')) &&
        monomer.hasBonds) ||
      previousConnectionNotR2 ||
      isPreviousMonomerPartOfChain
    );
  }

  private recalculatePeptideEnumeration(peptideRenderer: PeptideRenderer) {
    if (!peptideRenderer.monomer.hasBonds) {
      peptideRenderer.setEnumeration(null);
      peptideRenderer.redrawEnumeration();
    }

    if (!this.isMonomerBeginningOfChain(peptideRenderer.monomer, [Peptide]))
      return;

    this.recalculatePeptideChainEnumeration(peptideRenderer);
  }

  private recalculateRnaEnumeration(rnaComponentRenderer: BaseMonomerRenderer) {
    if (
      !this.isMonomerBeginningOfChain(rnaComponentRenderer.monomer, [
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

  public finishPolymerBondCreation(polymerBond: PolymerBond) {
    assert(polymerBond.secondMonomer);

    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
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

  public cancelPolymerBondCreation(polymerBond, secondMonomer) {
    this.deletePolymerBond(polymerBond);
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.drawSelection();
    polymerBond.firstMonomer.renderer?.redrawHover();
    secondMonomer?.renderer?.redrawAttachmentPoints();
    secondMonomer?.renderer?.drawSelection();
    secondMonomer?.renderer?.redrawHover();
  }

  public hoverMonomer(monomer, needRedrawAttachmentPoints) {
    this.hoverDrawingEntity(monomer as DrawingEntity);
    if (needRedrawAttachmentPoints) {
      monomer.renderer?.redrawAttachmentPoints();
    }
  }

  public hoverAttachmentPoint(monomer, attachmentPointName) {
    this.hoverDrawingEntity(monomer as DrawingEntity);
    monomer.renderer?.hoverAttachmenPoint(attachmentPointName);
    monomer.renderer?.drawAttachmentPoints();
  }

  public update(modelChanges: Command) {
    modelChanges.execute(this);
    this.runPostRenderMethods();
  }

  public runPostRenderMethods() {
    if (this.needRecalculateMonomersEnumeration) {
      this.recalculateMonomersEnumeration();
    }
  }
}
