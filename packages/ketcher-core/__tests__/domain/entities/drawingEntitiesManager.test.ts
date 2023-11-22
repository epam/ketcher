import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { peptideMonomerItem } from '../../mock-data';
import { Vec2 } from 'domain/entities';
import { Peptide } from 'domain/entities/Peptide';
import {
  PolymerBondAddOperation,
  PolymerBondDeleteOperation,
} from 'application/editor/operations/polymerBond';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import {
  DrawingEntityHoverOperation,
  DrawingEntityMoveOperation,
  DrawingEntitySelectOperation,
} from 'application/editor/operations/drawingEntity';
import {
  MonomerAddOperation,
  MonomerDeleteOperation,
  MonomerHoverOperation,
} from 'application/editor/operations/monomer';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

describe('Drawing Entities Manager', () => {
  it('should create monomer', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const command = drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(MonomerAddOperation);
    expect(drawingEntitiesManager.monomers.get(0)).toBeInstanceOf(Peptide);
  });

  it('should create polymer bond', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const { command, polymerBond } =
      drawingEntitiesManager.startPolymerBondCreation(
        new Peptide(peptideMonomerItem),
        new Vec2(0, 0),
        new Vec2(10, 10),
      );
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(PolymerBondAddOperation);
    expect(polymerBond).toBeInstanceOf(PolymerBond);
    expect(drawingEntitiesManager.polymerBonds.get(polymerBond.id)).toEqual(
      polymerBond,
    );
  });

  it('should create correct polymer bond when second monomer has only R2 point', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const firstPeptide = new Peptide(peptideMonomerItem);
    firstPeptide.attachmentPointsToBonds = { R1: null, R2: null };
    firstPeptide.potentialAttachmentPointsToBonds = { R1: null, R2: null };
    const secondPeptide = new Peptide(peptideMonomerItem);
    secondPeptide.attachmentPointsToBonds = { R2: null };
    secondPeptide.potentialAttachmentPointsToBonds = { R2: null };

    const { polymerBond } = drawingEntitiesManager.startPolymerBondCreation(
      firstPeptide,
      new Vec2(0, 0),
      new Vec2(10, 10),
    );

    const resultingOperations =
      drawingEntitiesManager.intendToFinishBondCreation(
        secondPeptide,
        polymerBond,
        true,
      ).operations;

    expect(resultingOperations).toHaveLength(2);
    expect(resultingOperations[0]).toMatchObject({
      peptide: {
        potentialAttachmentPointsToBonds: {
          R1: polymerBond,
          R2: null,
        },
        attachmentPointsToBonds: {
          R1: null,
          R2: null,
        },
      },
    });
  });

  it('should delete peptide', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const renderersManager = new RenderersManager({ theme: {} });
    drawingEntitiesManager.addMonomer(peptideMonomerItem, new Vec2(0, 0));
    const peptide = Array.from(drawingEntitiesManager.monomers)[0][1];
    expect(peptide).toBeInstanceOf(Peptide);
    const command = drawingEntitiesManager.deleteMonomer(peptide);
    renderersManager.update(command);
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(MonomerDeleteOperation);
    expect(drawingEntitiesManager.monomers.size).toEqual(0);
  });

  it('should delete polymer bond', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const renderersManager = new RenderersManager({ theme: {} });
    const { polymerBond } = drawingEntitiesManager.startPolymerBondCreation(
      new Peptide(peptideMonomerItem),
      new Vec2(0, 0),
      new Vec2(10, 10),
    );
    expect(
      Array.from(drawingEntitiesManager.polymerBonds)[0][1],
    ).toBeInstanceOf(PolymerBond);
    const command = drawingEntitiesManager.deletePolymerBond(polymerBond);
    renderersManager.update(command);
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(PolymerBondDeleteOperation);
    expect(drawingEntitiesManager.polymerBonds.size).toEqual(0);
  });

  it('should select drawing entity', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const drawingEntity = new Peptide(peptideMonomerItem) as DrawingEntity;
    const command = drawingEntitiesManager.selectDrawingEntity(drawingEntity);
    expect(drawingEntity.selected).toBeTruthy();
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(DrawingEntitySelectOperation);
  });

  it('should move peptide', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const renderersManager = new RenderersManager({ theme: {} });
    jest.spyOn(renderersManager, 'moveDrawingEntity').mockImplementation();
    drawingEntitiesManager.addMonomer(peptideMonomerItem, new Vec2(0, 0));
    const peptide = Array.from(drawingEntitiesManager.monomers)[0][1];
    peptide.turnOnSelection();
    const command = drawingEntitiesManager.moveSelectedDrawingEntities(
      new Vec2(100, 200),
    );
    renderersManager.update(command);
    expect(peptide.position.x).toEqual(100);
    expect(peptide.position.y).toEqual(200);
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(DrawingEntityMoveOperation);
  });

  it('should hover drawing entity', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const peptide = new Peptide(peptideMonomerItem);
    const command = drawingEntitiesManager.intendToSelectDrawingEntity(peptide);
    expect(peptide.hovered).toBeTruthy();
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(DrawingEntityHoverOperation);
  });

  it('should cancel the intention of polymer bond creation and turn off hover', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const peptide = new Peptide(peptideMonomerItem);
    drawingEntitiesManager.intendToSelectDrawingEntity(peptide);
    expect(peptide.hovered).toBeTruthy();
    const command =
      drawingEntitiesManager.cancelIntentionToFinishBondCreation(peptide);
    expect(peptide.hovered).toBeFalsy();
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(MonomerHoverOperation);
  });
});
