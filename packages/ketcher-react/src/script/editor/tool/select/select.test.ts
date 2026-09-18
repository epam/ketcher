import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import type { Editor, Selection } from '../../Editor';
import SelectTool from './select';

describe('SelectTool Attachment Group selection', () => {
  it('selects only the marker, member atoms, and internal bonds on click', () => {
    const struct = new Struct();
    const firstAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const secondAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const unrelatedAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(5, 0) }),
    );
    const internalBondId = struct.bonds.add(
      new Bond({
        begin: firstAtomId,
        end: secondAtomId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [firstAtomId, secondAtomId] }),
    );
    let currentSelection: Selection | null = {
      attachmentGroups: [attachmentGroupId],
      atoms: [firstAtomId, secondAtomId, unrelatedAtomId],
      bonds: [internalBondId],
    };
    const hover = jest.fn();
    const selection = jest.fn((...args: [Selection | null] | []) => {
      if (args.length === 0) {
        return currentSelection;
      }
      currentSelection = args[0];
      return currentSelection;
    });
    const editor = {
      findItem: jest.fn().mockReturnValue({
        map: 'attachmentGroups',
        id: attachmentGroupId,
        dist: 0,
      }),
      render: {
        clientArea: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        ctab: {
          molecule: struct,
          bonds: new Map(),
          rgroups: new Map(),
          sgroups: new Map(),
        },
        options: {
          microModeScale: 40,
          zoom: 1,
        },
        viewBox: {
          minX: 0,
          minY: 0,
        },
      },
      selection,
      hover,
      explicitSelected: () => ({ bonds: [] }),
      event: {
        message: {
          dispatch: jest.fn(),
        },
      },
      rotateController: {
        rerender: jest.fn(),
      },
      struct: () => struct,
    } as unknown as Editor;
    const tool = new SelectTool(editor, 'rectangle');

    const event = {
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      shiftKey: false,
    } as PointerEvent;

    tool.mousedown(event);

    expect(currentSelection).toEqual({
      attachmentGroups: [attachmentGroupId],
      atoms: [firstAtomId, secondAtomId],
      bonds: [internalBondId],
    });
    expect(hover).not.toHaveBeenCalled();

    tool.mouseup(event);

    expect(hover).toHaveBeenNthCalledWith(1, null);
    expect(hover).toHaveBeenNthCalledWith(
      2,
      {
        map: 'attachmentGroups',
        id: attachmentGroupId,
        dist: 0,
      },
      null,
      event,
    );
  });
});
