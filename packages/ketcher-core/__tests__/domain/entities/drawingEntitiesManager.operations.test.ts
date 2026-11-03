import {
  FlexMode,
  MACROMOLECULES_BOND_TYPES,
  SnakeMode,
} from 'application/editor';
import { ketcherProvider } from 'application/ketcherProvider';
import type { BaseMode } from 'application/editor/modes/BaseMode';
import {
  Atom as MicromoleculeAtom,
  Bond as MicromoleculeBond,
  SGroup,
  Vec2,
} from 'domain/entities';
import type { Command } from 'domain/entities/Command';
import { AtomLabel } from 'domain/constants';
import type { CoreStereoFlag } from 'domain/entities/CoreStereoFlag';
import { StereoFlag } from 'domain/entities/fragment';
import type { KetFileMultitailArrowNode } from 'domain/entities/multitailArrow';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { AttachmentPointName } from 'domain/types';
import type { KetFileNode } from 'domain/serializers/serializers.types';
import {
  addPeptide,
  bondPeptides,
  createEditor,
  deserializeKet,
  ETHANE_KET,
} from './drawingEntitiesManager.editorReads.helpers';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

const MULTITAIL_ARROW_NODE = {
  type: 'multi-tailed-arrow',
  data: {
    head: { position: { x: 6, y: -1, z: 0 } },
    spine: {
      pos: [
        { x: 3, y: 0, z: 0 },
        { x: 3, y: -4, z: 0 },
      ],
    },
    tails: {
      pos: [
        { x: 1, y: 0, z: 0 },
        { x: 1, y: -4, z: 0 },
      ],
    },
    zOrder: 0,
  },
} as unknown as KetFileNode<KetFileMultitailArrowNode>;

const entityOf = <T>(entity: T | undefined): T => {
  if (entity === undefined) {
    throw new Error('Fixture setup failed: the operation holds no entity');
  }

  return entity;
};

// Operations are identified by class name, so the test imports no operation file.
const describeOperations = (command: Command) =>
  command.operations.map((operation) => [
    operation.constructor.name,
    operation.priority,
  ]);

describe('DrawingEntitiesManager builds these operations', () => {
  let canvas: SVGSVGElement;
  let editor: ReturnType<typeof createEditor>['editor'];

  const open = (mode: BaseMode = new FlexMode()) => {
    ({ canvas, editor } = createEditor(mode));

    return editor.drawingEntitiesManager;
  };

  const draw = (command: Command) => {
    editor.renderersContainer.update(command);
  };

  // One Chem monomer with two carbons and the bond between them, drawn.
  const drawEthane = () => {
    const dem = editor.drawingEntitiesManager;
    const { command, mergedDrawingEntities } =
      deserializeKet(ETHANE_KET).mergeInto(dem);

    draw(command);

    const [monomer] = [...mergedDrawingEntities.monomers.values()];
    const [firstAtom, secondAtom] = [...mergedDrawingEntities.atoms.values()];
    const [bond] = [...mergedDrawingEntities.bonds.values()];

    return { monomer, firstAtom, secondAtom, bond };
  };

  // A polymer bond started from the monomer and drawn, still open at the far end.
  const startDrawnBond = (monomer: ReturnType<typeof addPeptide>) => {
    const { command, polymerBond } =
      editor.drawingEntitiesManager.startPolymerBondCreation(
        monomer,
        new Vec2(0, 0),
        new Vec2(3, 0),
        MACROMOLECULES_BOND_TYPES.SINGLE,
      );

    draw(command);

    return polymerBond;
  };

  afterEach(() => {
    jest.restoreAllMocks();
    editor.destroy();
    canvas.remove();
  });

  // The model change of an add operation runs when DrawingEntitiesManager
  // builds it, so the entity exists before the command runs. Undo removes it,
  // redo brings the same entity back.
  const expectAddRoundTrip = (command: Command, isInModel: () => boolean) => {
    expect(isInModel()).toBe(true);

    draw(command);
    expect(isInModel()).toBe(true);

    command.invert(editor.renderersContainer);
    expect(isInModel()).toBe(false);

    command.execute(editor.renderersContainer);
    expect(isInModel()).toBe(true);
  };

  // The entity must be drawn before the delete command runs.
  const expectDeleteRoundTrip = (
    command: Command,
    isInModel: () => boolean,
  ) => {
    expect(isInModel()).toBe(true);

    draw(command);
    expect(isInModel()).toBe(false);

    command.invert(editor.renderersContainer);
    expect(isInModel()).toBe(true);

    command.execute(editor.renderersContainer);
    expect(isInModel()).toBe(false);
  };

  describe('micromolecule atoms and bonds', () => {
    it('adds and removes an atom, and keeps the monomer struct in step', () => {
      const dem = open();
      const { monomer } = drawEthane();
      const struct = monomer.monomerItem.struct;
      const microAtomId = struct.atoms.add(
        new MicromoleculeAtom({ label: 'N', pp: new Vec2(2, 0) }),
      );

      const command = dem.addAtom(
        new Vec2(2, 0),
        monomer,
        microAtomId,
        AtomLabel.N,
      );
      const atom = entityOf(command.operations[0].atom);

      expect(describeOperations(command)).toEqual([['AtomAddOperation', 2]]);
      expectAddRoundTrip(command, () => dem.atoms.has(atom.id));

      command.invert(editor.renderersContainer);
      expect(struct.atoms.has(microAtomId)).toBe(false);
      command.execute(editor.renderersContainer);
      expect(struct.atoms.has(microAtomId)).toBe(true);
    });

    it('removes and restores an atom with its bond', () => {
      const dem = open();
      const { monomer, firstAtom } = drawEthane();
      const struct = monomer.monomerItem.struct;
      const microBondCount = struct.bonds.size;

      const command = dem.deleteDrawingEntity(firstAtom);

      expect(describeOperations(command)).toEqual([
        ['AtomDeleteOperation', 2],
        ['BondDeleteOperation', 1],
      ]);
      expectDeleteRoundTrip(command, () => dem.atoms.has(firstAtom.id));

      expect(dem.bonds.size).toBe(0);
      expect(struct.atoms.has(firstAtom.atomIdInMicroMode)).toBe(false);
      expect(struct.bonds.size).toBe(0);
      command.invert(editor.renderersContainer);
      expect(dem.bonds.size).toBe(1);
      expect(struct.atoms.has(firstAtom.atomIdInMicroMode)).toBe(true);
      expect(struct.bonds.size).toBe(microBondCount);
    });

    it('adds and removes a bond, and keeps the monomer struct in step', () => {
      const dem = open();
      const { monomer, firstAtom, secondAtom } = drawEthane();
      const struct = monomer.monomerItem.struct;
      const microBondId = struct.bonds.add(
        new MicromoleculeBond({
          begin: firstAtom.atomIdInMicroMode,
          end: secondAtom.atomIdInMicroMode,
          type: MicromoleculeBond.PATTERN.TYPE.DOUBLE,
        }),
      );

      const command = dem.addBond(
        firstAtom,
        secondAtom,
        MicromoleculeBond.PATTERN.TYPE.DOUBLE,
        0,
        microBondId,
      );
      const bond = entityOf(command.operations[0].bond);

      expect(describeOperations(command)).toEqual([['BondAddOperation', 1]]);
      expectAddRoundTrip(command, () => dem.bonds.has(bond.id));

      command.invert(editor.renderersContainer);
      expect(struct.bonds.has(microBondId)).toBe(false);
      expect(firstAtom.bonds).not.toContain(bond);
      command.execute(editor.renderersContainer);
      expect(struct.bonds.has(microBondId)).toBe(true);
    });

    it('removes and restores a bond', () => {
      const dem = open();
      const { monomer, bond } = drawEthane();
      const struct = monomer.monomerItem.struct;

      const command = dem.deleteDrawingEntity(bond);

      expect(describeOperations(command)).toEqual([['BondDeleteOperation', 1]]);
      expectDeleteRoundTrip(command, () => dem.bonds.has(bond.id));

      expect(struct.bonds.has(bond.bondIdInMicroMode)).toBe(false);
      command.invert(editor.renderersContainer);
      expect(struct.bonds.has(bond.bondIdInMicroMode)).toBe(true);
    });
  });

  describe('monomer to atom bonds', () => {
    it('adds and removes a bond from a monomer to an atom', () => {
      const dem = open();
      const { firstAtom } = drawEthane();
      const peptide = addPeptide(editor, 'A', 0, 5);

      const command = dem.addMonomerToAtomBond(
        peptide,
        firstAtom,
        AttachmentPointName.R1,
      );
      const monomerToAtomBond = entityOf(
        command.operations[0].monomerToAtomBond,
      );

      expect(describeOperations(command)).toEqual([
        ['MonomerToAtomBondAddOperation', undefined],
      ]);
      expectAddRoundTrip(command, () =>
        dem.monomerToAtomBonds.has(monomerToAtomBond.id),
      );
      expect(peptide.attachmentPointsToBonds.R1).toBe(monomerToAtomBond);

      command.invert(editor.renderersContainer);
      expect(peptide.attachmentPointsToBonds.R1).toBeNull();
    });

    it('removes and restores a bond from a monomer to an atom', () => {
      const dem = open();
      const { firstAtom } = drawEthane();
      const peptide = addPeptide(editor, 'A', 0, 5);
      const addCommand = dem.addMonomerToAtomBond(
        peptide,
        firstAtom,
        AttachmentPointName.R1,
      );
      draw(addCommand);
      const monomerToAtomBond = entityOf(
        addCommand.operations[0].monomerToAtomBond,
      );

      const command = dem.deleteMonomerToAtomBond(monomerToAtomBond);

      expect(describeOperations(command)).toEqual([
        ['MonomerToAtomBondDeleteOperation', undefined],
      ]);
      expectDeleteRoundTrip(command, () =>
        dem.monomerToAtomBonds.has(monomerToAtomBond.id),
      );
      expect(peptide.attachmentPointsToBonds.R1).toBeNull();

      command.invert(editor.renderersContainer);
      expect(peptide.attachmentPointsToBonds.R1).toBe(monomerToAtomBond);
    });
  });

  describe('reaction arrows, pluses and stereo flags', () => {
    it('adds and removes a reaction arrow', () => {
      const dem = open();

      const addCommand = dem.addRxnArrow(RxnArrowMode.OpenAngle, [
        new Vec2(0, 0),
        new Vec2(4, 0),
      ]);
      const rxnArrow = entityOf(addCommand.operations[0].rxnArrow);

      expect(describeOperations(addCommand)).toEqual([
        ['RxnArrowAddOperation', 2],
      ]);
      expectAddRoundTrip(addCommand, () => dem.rxnArrows.has(rxnArrow.id));

      const deleteCommand = dem.deleteRxnArrow(rxnArrow);

      expect(describeOperations(deleteCommand)).toEqual([
        ['RxnArrowDeleteOperation', 2],
      ]);
      draw(addCommand);
      expectDeleteRoundTrip(deleteCommand, () =>
        dem.rxnArrows.has(rxnArrow.id),
      );
    });

    it('adds and removes a multitail arrow', () => {
      const dem = open();

      const addCommand = dem.addMultitailArrow(MULTITAIL_ARROW_NODE);
      const multitailArrow = entityOf(addCommand.operations[0].multitailArrow);

      expect(describeOperations(addCommand)).toEqual([
        ['MultitailArrowAddOperation', 2],
      ]);
      expectAddRoundTrip(addCommand, () =>
        dem.multitailArrows.has(multitailArrow.id),
      );

      const deleteCommand = dem.deleteMultitailArrow(multitailArrow);

      expect(describeOperations(deleteCommand)).toEqual([
        ['MultitailArrowDeleteOperation', 2],
      ]);
      draw(addCommand);
      expectDeleteRoundTrip(deleteCommand, () =>
        dem.multitailArrows.has(multitailArrow.id),
      );
    });

    it('adds and removes a reaction plus', () => {
      const dem = open();

      const addCommand = dem.addRxnPlus(new Vec2(2, 2));
      const rxnPlus = entityOf(addCommand.operations[0].rxnPlus);

      expect(describeOperations(addCommand)).toEqual([
        ['RxnPlusAddOperation', 2],
      ]);
      expectAddRoundTrip(addCommand, () => dem.rxnPluses.has(rxnPlus.id));

      const deleteCommand = dem.deleteRxnPlus(rxnPlus);

      expect(describeOperations(deleteCommand)).toEqual([
        ['RxnPlusDeleteOperation', 2],
      ]);
      draw(addCommand);
      expectDeleteRoundTrip(deleteCommand, () => dem.rxnPluses.has(rxnPlus.id));
    });

    it('adds and removes a stereo flag', () => {
      const dem = open();
      // The stereo flag renderer reads the settings of the Ketcher instance.
      jest.spyOn(ketcherProvider, 'getKetcher').mockReturnValue({
        settingsService: { getSettings: () => ({ showStereoFlags: true }) },
      } as never);
      const { monomer } = drawEthane();

      const addCommand = dem.addStereoFlag(
        new Vec2(1, 1),
        StereoFlag.Abs,
        monomer,
      );
      // The stereo flag is not part of the Operation interface.
      const { stereoFlag } = addCommand.operations[0] as unknown as {
        stereoFlag: CoreStereoFlag;
      };

      expect(describeOperations(addCommand)).toEqual([
        ['StereoFlagAddOperation', 2],
      ]);
      expectAddRoundTrip(addCommand, () => dem.stereoFlags.has(stereoFlag.id));

      const deleteCommand = dem.deleteStereoFlag(stereoFlag);

      expect(describeOperations(deleteCommand)).toEqual([
        ['StereoFlagDeleteOperation', 2],
      ]);
      draw(addCommand);
      expectDeleteRoundTrip(deleteCommand, () =>
        dem.stereoFlags.has(stereoFlag.id),
      );
    });
  });

  describe('s-groups', () => {
    const drawSGroup = () => {
      const dem = editor.drawingEntitiesManager;
      const { monomer, firstAtom, secondAtom } = drawEthane();
      const struct = monomer.monomerItem.struct;
      const sgroup = new SGroup(SGroup.TYPES.MUL);
      const sgroupId = struct.sgroups.add(sgroup);

      struct.atomAddToSGroup(sgroupId, firstAtom.atomIdInMicroMode);
      struct.atomAddToSGroup(sgroupId, secondAtom.atomIdInMicroMode);

      const command = dem.addSGroup(sgroup, monomer, sgroupId);

      return {
        dem,
        command,
        id: entityOf(command.operations[0].sgroupDrawingEntity).id,
      };
    };

    it('adds and removes an s-group', () => {
      open();
      const { dem, command, id } = drawSGroup();

      expect(describeOperations(command)).toEqual([['SGroupAddOperation', 2]]);
      expectAddRoundTrip(command, () => dem.sgroups.has(id));
    });

    it('removes and restores an s-group when all entities are deleted', () => {
      open();
      const { dem, command, id } = drawSGroup();
      draw(command);

      const deleteCommand = dem.deleteAllEntities();

      expect(describeOperations(deleteCommand)).toContainEqual([
        'SGroupDeleteOperation',
        2,
      ]);
      expectDeleteRoundTrip(deleteCommand, () => dem.sgroups.has(id));
    });
  });

  describe('monomers', () => {
    it('swaps the monomer item and swaps it back', () => {
      const dem = open();
      const peptide = addPeptide(editor, 'A', 0, 0);
      const originalItem = peptide.monomerItem;

      const command = dem.modifyMonomerItem(peptide, {
        ...originalItem,
        isAntisense: true,
        isSense: false,
      });

      expect(describeOperations(command)).toEqual([
        ['MonomerItemModifyOperation', undefined],
      ]);
      expect(peptide.monomerItem.isAntisense).toBe(true);

      command.execute(editor.renderersContainer);
      expect(peptide.monomerItem.isAntisense).toBe(true);

      command.invert(editor.renderersContainer);
      expect(peptide.monomerItem).toEqual(originalItem);

      command.execute(editor.renderersContainer);
      expect(peptide.monomerItem.isAntisense).toBe(true);
    });

    it('moves a monomer and moves it back', () => {
      const dem = open();
      const peptide = addPeptide(editor, 'A', 1, 1);

      const command = dem.moveMonomer(peptide, new Vec2(5, 6));

      expect(describeOperations(command)).toEqual([
        ['MonomerMoveOperation', undefined],
      ]);
      expect([peptide.position.x, peptide.position.y]).toEqual([5, 6]);

      command.invert(editor.renderersContainer);
      expect([peptide.position.x, peptide.position.y]).toEqual([1, 1]);

      command.execute(editor.renderersContainer);
      expect([peptide.position.x, peptide.position.y]).toEqual([5, 6]);
    });

    it('hovers an attachment point and keeps hover out of undo', () => {
      const dem = open();
      const peptide = addPeptide(editor, 'A', 0, 0);
      const hover = jest.spyOn(
        editor.renderersContainer,
        'hoverAttachmentPoint',
      );

      const command = dem.intendToStartAttachmenPointBondCreation(
        peptide,
        AttachmentPointName.R1,
      );

      expect(describeOperations(command)).toEqual([
        ['AttachmentPointHoverOperation', undefined],
      ]);
      expect(peptide.hovered).toBe(true);

      command.execute(editor.renderersContainer);
      expect(hover).toHaveBeenCalledTimes(1);
      expect(hover).toHaveBeenCalledWith(peptide, AttachmentPointName.R1);

      command.invert(editor.renderersContainer);
      expect(hover).toHaveBeenCalledTimes(1);
      expect(peptide.hovered).toBe(true);
    });

    it('hovers the first monomer and an attachment point of the second when finishing a bond', () => {
      const dem = open();
      const first = addPeptide(editor, 'A', 0, 0);
      const second = addPeptide(editor, 'A', 3, 0);
      const polymerBond = startDrawnBond(first);

      const command = dem.intendToFinishAttachmenPointBondCreation(
        second,
        polymerBond,
        AttachmentPointName.R1,
        true,
      );

      expect(describeOperations(command)).toEqual([
        ['MonomerHoverOperation', undefined],
        ['AttachmentPointHoverOperation', undefined],
      ]);
    });

    it('redraws an entity through the model changes it is given', () => {
      const dem = open();
      const peptide = addPeptide(editor, 'A', 0, 0);
      const redraw = jest.fn(() => peptide);
      const undraw = jest.fn(() => peptide);
      const redrawOnScreen = jest.spyOn(
        editor.renderersContainer,
        'redrawDrawingEntity',
      );

      const command = dem.createDrawingEntityRedrawCommand(redraw, undraw);

      expect(describeOperations(command)).toEqual([
        ['DrawingEntityRedrawOperation', undefined],
      ]);
      expect(redraw).not.toHaveBeenCalled();

      command.execute(editor.renderersContainer);
      expect(redraw).toHaveBeenCalledTimes(1);
      expect(undraw).not.toHaveBeenCalled();
      expect(redrawOnScreen).toHaveBeenLastCalledWith(peptide, true);

      command.invert(editor.renderersContainer);
      expect(redraw).toHaveBeenCalledTimes(1);
      expect(undraw).toHaveBeenCalledTimes(1);
      expect(redrawOnScreen).toHaveBeenLastCalledWith(peptide, true);
    });
  });

  describe('polymer bonds', () => {
    const addTwoPeptides = () => {
      const dem = open();
      const first = addPeptide(editor, 'A', 0, 0);
      const second = addPeptide(editor, 'A', 3, 0);

      return { dem, first, second };
    };

    it('creates a bond between two monomers and removes it on undo', () => {
      const { dem, first, second } = addTwoPeptides();

      const command = dem.createPolymerBond(
        first,
        second,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      const bond = entityOf(command.operations[0].polymerBond);

      expect(describeOperations(command)).toEqual([
        ['PolymerBondFinishCreationOperation', 1],
      ]);
      expectAddRoundTrip(command, () => dem.polymerBonds.has(bond.id));
      expect(first.attachmentPointsToBonds.R2).toBe(bond);
      expect(second.attachmentPointsToBonds.R1).toBe(bond);

      command.invert(editor.renderersContainer);
      expect(first.attachmentPointsToBonds.R2).toBeNull();
      expect(second.attachmentPointsToBonds.R1).toBeNull();
    });

    it('finishes a started bond, then resets and marks the antisense state of both monomers', () => {
      const { dem, first, second } = addTwoPeptides();
      const polymerBond = startDrawnBond(first);

      const command = dem.finishPolymerBondCreation(
        polymerBond,
        second,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );

      expect(describeOperations(command)).toEqual([
        ['PolymerBondFinishCreationOperation', 1],
        ['MonomerItemModifyOperation', undefined],
        ['MonomerItemModifyOperation', undefined],
        ['MonomerItemModifyOperation', undefined],
        ['MonomerItemModifyOperation', undefined],
      ]);
    });

    it('cancels a started bond for good', () => {
      const { dem, first } = addTwoPeptides();
      const polymerBond = startDrawnBond(first);
      expect(editor.renderersContainer.polymerBonds.has(polymerBond.id)).toBe(
        true,
      );

      const command = dem.cancelPolymerBondCreation(polymerBond);

      expect(describeOperations(command)).toEqual([
        ['PolymerBondCancelCreationOperation', undefined],
      ]);
      expect(dem.polymerBonds.has(polymerBond.id)).toBe(false);

      command.execute(editor.renderersContainer);
      expect(editor.renderersContainer.polymerBonds.has(polymerBond.id)).toBe(
        false,
      );

      command.invert(editor.renderersContainer);
      expect(dem.polymerBonds.has(polymerBond.id)).toBe(false);
      expect(editor.renderersContainer.polymerBonds.has(polymerBond.id)).toBe(
        false,
      );
    });

    it('moves a bond to its monomers and keeps the move out of undo', () => {
      const { dem, first, second } = addTwoPeptides();
      const bond = bondPeptides(editor, first, second);
      const move = jest.spyOn(editor.renderersContainer, 'movePolymerBond');

      const command = dem.movePolymerBond(bond);

      expect(describeOperations(command)).toEqual([
        ['PolymerBondMoveOperation', undefined],
      ]);

      command.execute(editor.renderersContainer);
      expect(move).toHaveBeenCalledTimes(1);
      expect(move).toHaveBeenCalledWith(bond);

      command.invert(editor.renderersContainer);
      expect(move).toHaveBeenCalledTimes(1);
    });

    it('shows and hides the information of a bond through one operation kind', () => {
      const { dem, first, second } = addTwoPeptides();
      const bond = bondPeptides(editor, first, second);
      const show = jest.spyOn(
        editor.renderersContainer,
        'showPolymerBondInformation',
      );

      const showCommand = dem.showPolymerBondInformation(bond);

      expect(describeOperations(showCommand)).toEqual([
        ['PolymerBondShowInfoOperation', undefined],
      ]);
      expect([bond.hovered, first.hovered, second.hovered]).toEqual([
        true,
        true,
        true,
      ]);

      showCommand.execute(editor.renderersContainer);
      expect(show).toHaveBeenCalledTimes(1);
      expect(show).toHaveBeenCalledWith(bond);

      const hideCommand = dem.hidePolymerBondInformation(bond);

      expect(describeOperations(hideCommand)).toEqual([
        ['PolymerBondShowInfoOperation', undefined],
      ]);
      expect([bond.hovered, first.hovered, second.hovered]).toEqual([
        false,
        false,
        false,
      ]);

      hideCommand.execute(editor.renderersContainer);
      expect(show).toHaveBeenCalledTimes(2);

      hideCommand.invert(editor.renderersContainer);
      expect(show).toHaveBeenCalledTimes(2);
    });

    it('reconnects a bond to other attachment points and back', () => {
      const { dem, first, second } = addTwoPeptides();
      const bond = bondPeptides(editor, first, second);

      const command = dem.reconnectPolymerBond(
        bond,
        AttachmentPointName.R1,
        AttachmentPointName.R2,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );

      expect(describeOperations(command)).toEqual([
        ['ReconnectPolymerBondOperation', undefined],
      ]);

      command.execute(editor.renderersContainer);
      expect(first.attachmentPointsToBonds.R1).toBe(bond);
      expect(first.attachmentPointsToBonds.R2).toBeNull();
      expect(second.attachmentPointsToBonds.R2).toBe(bond);
      expect(second.attachmentPointsToBonds.R1).toBeNull();

      command.invert(editor.renderersContainer);
      expect(first.attachmentPointsToBonds.R2).toBe(bond);
      expect(first.attachmentPointsToBonds.R1).toBeNull();
      expect(second.attachmentPointsToBonds.R1).toBe(bond);
      expect(second.attachmentPointsToBonds.R2).toBeNull();
    });
  });

  describe('snake layout', () => {
    it('recalculates the canvas matrix from the snake layout matrix', () => {
      const dem = open(new SnakeMode());
      const first = addPeptide(editor, 'A', 0, 0);
      const second = addPeptide(editor, 'A', 3, 0);
      bondPeptides(editor, first, second);
      draw(dem.applySnakeLayout(true));
      const rerender = jest.spyOn(
        editor.renderersContainer,
        'rerenderSideConnectionPolymerBonds',
      );
      expect(dem.snakeLayoutMatrix).toBeDefined();
      dem.canvasMatrix = undefined;

      const command = dem.recalculateCanvasMatrix();

      expect(describeOperations(command)).toEqual([
        ['RecalculateCanvasMatrixOperation', 1],
      ]);

      command.execute(editor.renderersContainer);
      expect(dem.canvasMatrix).toBeDefined();
      expect(rerender).toHaveBeenCalledTimes(1);

      command.invert(editor.renderersContainer);
      expect(rerender).toHaveBeenCalledTimes(2);
    });
  });
});
