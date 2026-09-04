import {
  Action,
  ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE,
  Bond,
  HAPTIC_BOND_ERROR_MESSAGE,
  Struct,
  Vec2,
} from 'ketcher-core';
import type Editor from '../Editor';
import BondTool from './bond';
import type { BondToolDragContext } from './bond.types';
import type { BondValidationFailure } from './hapticBondTool';

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
});
