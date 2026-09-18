import {
  Action,
  AttachmentGroup,
  ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE,
  Atom,
  Bond,
  Fragment,
  HAPTIC_BOND_ERROR_MESSAGE,
  Render,
  ReStruct,
  Struct,
  Vec2,
} from 'ketcher-core';
import type { RenderOptions } from 'ketcher-core';
import type Editor from '../Editor';
import BondTool from './bond';
import type { BondToolDragContext } from './bond.types';
import {
  findHapticBondAttachmentGroupTarget,
  type BondValidationFailure,
} from './hapticBondTool';

function createReStruct(struct: Struct, zoom = 1) {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 40,
      zoom,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  const restruct = new ReStruct(struct, render);
  render.ctab = restruct;
  restruct.recalculateVisibleAtomsAndBonds();
  return { render, restruct };
}

describe('Haptic bond Attachment Group target', () => {
  it.each([
    [1, 0.5, 0.501],
    [2, 0.25, 0.251],
  ])(
    'uses a 20 screen-pixel radius at zoom %s',
    (zoom, insideOffset, outsideOffset) => {
      const struct = new Struct();
      const attachmentGroup = new AttachmentGroup({
        atomIds: [],
        pp: new Vec2(1, 1),
      });
      const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
      const { restruct } = createReStruct(struct, zoom);

      expect(
        findHapticBondAttachmentGroupTarget(
          restruct,
          new Vec2(1 + insideOffset, 1),
        ),
      ).toBe(attachmentGroupId);
      expect(
        findHapticBondAttachmentGroupTarget(
          restruct,
          new Vec2(1 + outsideOffset, 1),
        ),
      ).toBeNull();
    },
  );
});

describe('BondTool rejected drag preview', () => {
  it.each([
    ['haptic', HAPTIC_BOND_ERROR_MESSAGE],
    ['attachmentGroup', ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE],
  ] as const)(
    'clears the preview and reports a %s validation failure on mouseup',
    (failure, expectedMessage) => {
      const update = jest.fn();
      const errorHandler = jest.fn();
      const editor = {
        selection: () => null,
        update,
        errorHandler,
        render: { ctab: { molecule: new Struct() } },
        event: { message: { dispatch: jest.fn() } },
        hover: jest.fn(),
        findItem: jest.fn().mockReturnValue(null),
      } as unknown as Editor;
      const tool = new BondTool(editor, {
        type: Bond.PATTERN.TYPE.HAPTIC,
      });
      const previewAction = new Action();
      const dragContext: BondToolDragContext = {
        xy0: new Vec2(),
        pageX0: 0,
        pageY0: 0,
        hasStartedDragging: true,
        hapticValidationFailed: false,
        attachmentGroupValidationFailed: false,
        action: previewAction,
      };
      const event = { clientX: 0, clientY: 0 } as PointerEvent;
      const rejectBondOperation = Reflect.get(tool, 'rejectBondOperation') as (
        event: PointerEvent,
        dragContext: BondToolDragContext,
        failure: BondValidationFailure,
      ) => void;
      Reflect.set(tool, 'dragCtx', dragContext);

      rejectBondOperation.call(tool, event, dragContext, failure);

      expect(dragContext.action).toBeUndefined();
      expect(update).toHaveBeenCalledWith(previewAction, true);

      tool.mouseup(event);

      expect(errorHandler).toHaveBeenCalledWith(expectedMessage);
    },
  );

  it('draws an invalid haptic preview from an atom and removes it on mouseup', () => {
    const struct = new Struct();
    const fragmentId = struct.frags.add(new Fragment());
    const beginAtomId = struct.atoms.add(
      new Atom({
        label: 'C',
        fragment: fragmentId,
        pp: new Vec2(0, 0),
      }),
    );
    const { render } = createReStruct(struct);
    render.update(false);
    const update = jest.fn((action: Action | true) => {
      render.update(action === true);
    });
    const errorHandler = jest.fn();
    const editor = {
      selection: () => null,
      update,
      errorHandler,
      render,
      event: { message: { dispatch: jest.fn() } },
      hover: jest.fn(),
      findItem: jest.fn().mockReturnValue(null),
    } as unknown as Editor;
    const tool = new BondTool(editor, {
      type: Bond.PATTERN.TYPE.HAPTIC,
    });
    const dragContext: BondToolDragContext = {
      xy0: new Vec2(),
      pageX0: 0,
      pageY0: 0,
      hasStartedDragging: true,
      hapticValidationFailed: false,
      attachmentGroupValidationFailed: false,
      item: { map: 'atoms', id: beginAtomId },
    };
    const event = { clientX: 0, clientY: 0 } as PointerEvent;
    const applyBondAction = Reflect.get(tool, 'applyBondAction') as (
      event: PointerEvent,
      dragContext: BondToolDragContext,
      render: Render,
      molecule: Struct,
      bondParams: {
        beginAtom: number;
        endAtom: { label: string };
        endPos: Vec2;
        dist: number;
      },
    ) => void;

    applyBondAction.call(tool, event, dragContext, render, struct, {
      beginAtom: beginAtomId,
      endAtom: { label: 'C' },
      endPos: new Vec2(1.8, 0),
      dist: 1.8,
    });

    expect(struct.bonds.size).toBe(1);
    expect(dragContext.action).toBeDefined();
    expect(dragContext.hapticValidationFailed).toBe(true);

    Reflect.set(tool, 'dragCtx', dragContext);
    tool.mouseup(event);

    expect(struct.bonds.size).toBe(0);
    expect(struct.atoms.size).toBe(1);
    expect(errorHandler).toHaveBeenCalledWith(HAPTIC_BOND_ERROR_MESSAGE);
    expect(update).toHaveBeenLastCalledWith(expect.any(Action), true);
  });
});
