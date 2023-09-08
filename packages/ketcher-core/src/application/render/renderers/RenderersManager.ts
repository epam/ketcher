import { PolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer';
import { Command } from 'domain/entities/Command';
import assert from 'assert';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Vec2 } from 'domain/entities';

export class RenderersManager {
  private theme;
  public monomers: Map<number, BaseMonomerRenderer> = new Map();
  public polymerBonds: Map<number, PolymerBondRenderer> = new Map();

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

  public moveDrawingEntity(drawingEntity: DrawingEntity, offset: Vec2) {
    assert(drawingEntity.baseRenderer);
    drawingEntity.baseRenderer.moveSelection(offset);
  }

  public addMonomer(monomer: BaseMonomer, callback?: () => void) {
    const [, MonomerRenderer] = monomerFactory(monomer.monomerItem);
    const monomerRenderer = new MonomerRenderer(monomer);
    this.monomers.set(monomer.id, monomerRenderer);
    monomerRenderer.show(this.theme);
    if (callback) {
      callback();
    }
  }

  public moveMonomer(monomer: BaseMonomer) {
    monomer.renderer?.move();
  }

  public deleteMonomer(monomer: BaseMonomer) {
    monomer.renderer?.remove();
    this.monomers.delete(monomer.id);
  }

  public addPolymerBond(polymerBond) {
    const polymerBondRenderer = new PolymerBondRenderer(polymerBond);
    this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
    polymerBondRenderer.show();
    polymerBondRenderer.polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
  }

  public movePolymerBond(polymerBond: PolymerBond) {
    polymerBond.renderer?.moveStart();
    polymerBond.renderer?.moveEnd();
  }

  public showPolymerBondInformation(polymerBond) {
    polymerBond.renderer?.redrawHover();
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.redrawHover();
    polymerBond.secondMonomer?.renderer?.redrawAttachmentPoints();
    polymerBond.secondMonomer?.renderer?.redrawHover();
  }

  public deletePolymerBond(polymerBond) {
    polymerBond.renderer?.remove();
    polymerBond?.firstMonomer?.renderer?.redrawAttachmentPoints();
    polymerBond?.secondMonomer?.renderer?.redrawAttachmentPoints();
    this.monomers.delete(polymerBond.id);
  }

  public finishPolymerBondCreation(polymerBond) {
    assert(polymerBond.secondMonomer);
    polymerBond.renderer?.moveEnd();
    polymerBond.renderer?.redrawHover();
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.drawSelection();
    polymerBond.firstMonomer.renderer?.redrawHover();
    polymerBond.secondMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.secondMonomer.renderer?.drawSelection();
    polymerBond.secondMonomer.renderer?.redrawHover();
  }

  public cancelPolymerBondCreation(polymerBond) {
    this.deletePolymerBond(polymerBond);
    polymerBond.firstMonomer.renderer?.redrawAttachmentPoints();
    polymerBond.firstMonomer.renderer?.drawSelection();
    polymerBond.firstMonomer.renderer?.redrawHover();
  }

  public hoverMonomer(monomer, needRedrawAttachmentPoints) {
    this.hoverDrawingEntity(monomer as DrawingEntity);
    if (needRedrawAttachmentPoints) {
      monomer.renderer?.redrawAttachmentPoints();
    }
  }

  public update(modelChanges: Command) {
    modelChanges.operations.forEach((modelChange) => {
      modelChange.execute(this);
    });
  }
}
