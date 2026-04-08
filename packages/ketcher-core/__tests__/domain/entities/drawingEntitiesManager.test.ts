import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { peptideMonomerItem, polymerEditorTheme } from '../../mock-data';
import { Struct, Vec2 } from 'domain/entities';
import { Peptide } from 'domain/entities/Peptide';
import {
  PolymerBondAddOperation,
  PolymerBondDeleteOperation,
} from 'application/editor/operations/polymerBond';
import { PolymerBond } from 'domain/entities/PolymerBond';
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
import { createPolymerEditorCanvas } from '../../helpers/dom';
import { CoreEditor, MACROMOLECULES_BOND_TYPES } from 'application/editor';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { AttachmentPointName } from 'domain/types';
import { AtomLabel } from 'domain/constants';
import { KetMonomerClass } from 'application/formatters';

describe('Drawing Entities Manager', () => {
  beforeEach(() => {
    DrawingEntity.resetIdCounter();
    document.body.innerHTML = '';
  });

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
        MACROMOLECULES_BOND_TYPES.SINGLE,
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
      MACROMOLECULES_BOND_TYPES.SINGLE,
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
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
    });
    const drawingEntitiesManager = editor.drawingEntitiesManager;
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
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
    });
    const drawingEntitiesManager = editor.drawingEntitiesManager;
    const renderersManager = new RenderersManager({ theme: {} });
    const { polymerBond } = drawingEntitiesManager.startPolymerBondCreation(
      new Peptide(peptideMonomerItem),
      new Vec2(0, 0),
      new Vec2(10, 10),
      MACROMOLECULES_BOND_TYPES.SINGLE,
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
    const drawingEntity = new Peptide(peptideMonomerItem);
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

  it('should use ket-style ids for rendered monomers even if drawing entity ids have gaps', () => {
    const canvas = createPolymerEditorCanvas();

    global.SVGElement.prototype.getBBox = jest.fn(() => {
      return { width: 30, height: 20 } as DOMRect;
    });

    new Peptide(peptideMonomerItem);
    new Peptide(peptideMonomerItem);

    const editor = new CoreEditor({
      canvas,
      theme: polymerEditorTheme,
    });

    const firstMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    editor.renderersContainer.update(firstMonomerCommand);

    const secondMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(10, 0),
    );
    editor.renderersContainer.update(secondMonomerCommand);

    const monomerIds = Array.from(
      canvas.querySelectorAll('[data-testid="monomer"]'),
    ).map((element) => element.getAttribute('data-monomerid'));

    expect(monomerIds).toEqual(['0', '1']);
  });

  it('should use a separate sequential counter for rendered bonds', () => {
    const canvas = createPolymerEditorCanvas();

    global.SVGElement.prototype.getBBox = jest.fn(() => {
      return { width: 30, height: 20 } as DOMRect;
    });

    new Peptide(peptideMonomerItem);
    new Peptide(peptideMonomerItem);

    const editor = new CoreEditor({
      canvas,
      theme: polymerEditorTheme,
    });

    const firstMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    editor.renderersContainer.update(firstMonomerCommand);

    const secondMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(10, 0),
    );
    editor.renderersContainer.update(secondMonomerCommand);

    const [firstMonomer, secondMonomer] = Array.from(
      editor.drawingEntitiesManager.monomers.values(),
    );

    const bondCommand = editor.drawingEntitiesManager.createPolymerBond(
      firstMonomer,
      secondMonomer,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    editor.renderersContainer.update(bondCommand);

    const bondIds = Array.from(
      canvas.querySelectorAll('[data-testid="bond"]'),
    ).map((element) => element.getAttribute('data-bondid'));

    expect(bondIds).toEqual(['0']);
  });

  it('should keep data-bondid unique across polymer and chemistry bonds in macromolecules mode', () => {
    const canvas = createPolymerEditorCanvas();

    global.SVGElement.prototype.getBBox = jest.fn(() => {
      return { width: 30, height: 20 } as DOMRect;
    });

    new Peptide(peptideMonomerItem);
    new Peptide(peptideMonomerItem);

    const editor = new CoreEditor({
      canvas,
      theme: polymerEditorTheme,
    });

    const firstMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    editor.renderersContainer.update(firstMonomerCommand);

    const secondMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(10, 0),
    );
    editor.renderersContainer.update(secondMonomerCommand);

    const [firstMonomer, secondMonomer] = Array.from(
      editor.drawingEntitiesManager.monomers.values(),
    );

    const polymerBondCommand = editor.drawingEntitiesManager.createPolymerBond(
      firstMonomer,
      secondMonomer,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    editor.renderersContainer.update(polymerBondCommand);

    const chemMonomerItem = {
      ...peptideMonomerItem,
      label: 'F1',
      struct: new Struct(),
      props: {
        ...peptideMonomerItem.props,
        Name: 'F1',
        MonomerName: 'F1',
        MonomerType: 'CHEM',
        MonomerClass: KetMonomerClass.CHEM,
        MonomerNaturalAnalogCode: '',
        isMicromoleculeFragment: true,
      },
    };

    const chemMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      chemMonomerItem,
      new Vec2(20, 0),
    );
    editor.renderersContainer.update(chemMonomerCommand);

    const chemMonomer = Array.from(
      editor.drawingEntitiesManager.monomers.values(),
    ).find((monomer) => monomer.monomerItem.props.isMicromoleculeFragment);

    expect(chemMonomer).toBeDefined();

    if (!chemMonomer) {
      return;
    }

    const firstAtomCommand = editor.drawingEntitiesManager.addAtom(
      new Vec2(20, 0),
      chemMonomer,
      0,
      AtomLabel.C,
    );
    editor.renderersContainer.update(firstAtomCommand);

    const secondAtomCommand = editor.drawingEntitiesManager.addAtom(
      new Vec2(21, 0),
      chemMonomer,
      1,
      AtomLabel.C,
    );
    editor.renderersContainer.update(secondAtomCommand);

    const [firstAtom, secondAtom] = Array.from(
      editor.drawingEntitiesManager.atoms.values(),
    );

    const chemistryBondCommand = editor.drawingEntitiesManager.addBond(
      firstAtom,
      secondAtom,
      1,
      0,
      0,
    );
    editor.renderersContainer.update(chemistryBondCommand);

    const bondIds = Array.from(canvas.querySelectorAll('[data-testid="bond"]'))
      .map((element) => element.getAttribute('data-bondid'))
      .sort();

    expect(bondIds).toEqual(['0', '1']);
  });
});
