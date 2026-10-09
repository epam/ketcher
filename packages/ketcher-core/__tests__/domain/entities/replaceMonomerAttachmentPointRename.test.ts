import { CoreEditor } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { getAttachmentPointRenames } from 'application/editor/libraryItemDragDrop/replacementHelpers';
import { KetMonomerClass } from 'domain/constants/monomers';
import { PolymerBond } from 'domain/entities/PolymerBond';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

describe('replaceMonomer after attachment points are renamed', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let item: MonomerItemType;
  let swappedItem: MonomerItemType;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });

    const found = editor.monomersLibrary.find(
      (monomerItem): monomerItem is MonomerItemType =>
        !('isAmbiguous' in monomerItem && monomerItem.isAmbiguous) &&
        monomerItem.props?.MonomerClass === KetMonomerClass.AminoAcid &&
        monomerItem.attachmentPoints?.length === 2,
    );
    if (!found?.attachmentPoints) {
      throw new Error('Fixture setup failed');
    }
    item = found;

    const [first, second] = found.attachmentPoints;
    swappedItem = {
      ...found,
      attachmentPoints: [
        { ...second, type: 'left' },
        { ...first, type: 'right' },
      ],
    };
  });

  afterEach(() => {
    canvas.remove();
  });

  const setUpBondedMonomers = () => {
    const manager = editor.drawingEntitiesManager;
    manager.addMonomer(item, new Vec2(0, 0));
    manager.addMonomer(item, new Vec2(10, 0));
    const [left, right] = [...manager.monomers.values()];
    manager.createPolymerBond(
      left,
      right,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
      MACROMOLECULES_BOND_TYPES.SINGLE,
    );

    return { manager, left, right };
  };

  const getPolymerBondOnR2 = (monomer: BaseMonomer) => {
    const bond = monomer.getBondByAttachmentPoint(AttachmentPointName.R2);
    if (!(bond instanceof PolymerBond)) {
      throw new Error('Polymer bond was not re-established');
    }
    return bond;
  };

  it('keeps the bond on the same atom when the names are swapped', () => {
    const { manager, left, right } = setUpBondedMonomers();

    const { newMonomer } = manager.replaceMonomer(
      right,
      swappedItem,
      getAttachmentPointRenames(item, swappedItem),
    );

    const bond = getPolymerBondOnR2(left);
    expect(bond.getAnotherMonomer(left)).toBe(newMonomer);
    expect(newMonomer.getAttachmentPointByBond(bond)).toBe(
      AttachmentPointName.R2,
    );
  });

  it('falls back to the old attachment point name when no rename map is given', () => {
    const { manager, left, right } = setUpBondedMonomers();

    const { newMonomer } = manager.replaceMonomer(right, swappedItem);

    expect(newMonomer.getAttachmentPointByBond(getPolymerBondOnR2(left))).toBe(
      AttachmentPointName.R1,
    );
  });

  it('re-establishes one bond on an attachment point claimed by a rename', () => {
    const manager = editor.drawingEntitiesManager;
    manager.addMonomer(item, new Vec2(0, 0));
    manager.addMonomer(item, new Vec2(10, 0));
    manager.addMonomer(item, new Vec2(20, 0));
    const [left, right, third] = [...manager.monomers.values()];
    manager.createPolymerBond(
      left,
      right,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
      MACROMOLECULES_BOND_TYPES.SINGLE,
    );
    manager.createPolymerBond(
      right,
      third,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
      MACROMOLECULES_BOND_TYPES.SINGLE,
    );
    // Only the second attachment atom survives, and it is now named R1.
    const [survivingPoint] = swappedItem.attachmentPoints ?? [];
    const singleItem = { ...swappedItem, attachmentPoints: [survivingPoint] };

    const { newMonomer } = manager.replaceMonomer(
      right,
      singleItem,
      getAttachmentPointRenames(item, singleItem),
    );

    expect(manager.polymerBonds.size).toBe(1);
    const bond = newMonomer.getBondByAttachmentPoint(AttachmentPointName.R1);
    expect(bond).toBeInstanceOf(PolymerBond);
    expect(third.getBondByAttachmentPoint(AttachmentPointName.R1)).toBe(bond);
    expect(left.getBondByAttachmentPoint(AttachmentPointName.R2)).toBeFalsy();
  });

  it('keeps a bond between two replaced instances on the same atoms', () => {
    const { manager } = setUpBondedMonomers();
    editor['replaceMonomerInstances']({
      monomerClass: KetMonomerClass.AminoAcid,
      symbol: item.props?.MonomerCode ?? item.label,
      newMonomerItem: swappedItem,
    });

    const [bond] = manager.polymerBonds.values();
    expect(manager.polymerBonds.size).toBe(1);
    const monomerAt = (x: number) =>
      [...manager.monomers.values()].find(
        (monomer) => monomer.position.x === x,
      ) as BaseMonomer;
    expect(monomerAt(0).getAttachmentPointByBond(bond)).toBe(
      AttachmentPointName.R1,
    );
    expect(monomerAt(10).getAttachmentPointByBond(bond)).toBe(
      AttachmentPointName.R2,
    );
  });
});
