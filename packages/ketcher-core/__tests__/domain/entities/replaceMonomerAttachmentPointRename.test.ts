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
      theme: {},
      renderersContainer: createRenderersManager(),
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

  it('moves the bond to the old attachment point name without renames', () => {
    const { manager, left, right } = setUpBondedMonomers();

    const { newMonomer } = manager.replaceMonomer(right, swappedItem);

    expect(newMonomer.getAttachmentPointByBond(getPolymerBondOnR2(left))).toBe(
      AttachmentPointName.R1,
    );
  });
});
