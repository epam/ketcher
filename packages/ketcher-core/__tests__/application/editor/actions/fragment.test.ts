import { vi } from 'vitest';
import { Action } from 'application/editor/actions/action';
import { fromMultipleMove } from 'application/editor/actions/fragment';
import { ImageMove, MultitailArrowMove } from 'application/editor/operations';
import { IMAGE_KEY, MULTITAIL_ARROW_KEY } from 'domain/constants';
import { Vec2 } from 'domain/entities';

describe('fromMultipleMove', () => {
  it('ignores non-array image and multitail arrow selections', () => {
    const forEach = vi.fn();
    const result = fromMultipleMove(
      { molecule: {} },
      {
        [IMAGE_KEY]: { forEach },
        [MULTITAIL_ARROW_KEY]: { forEach },
      },
      new Vec2(1, 1),
    );

    expect(forEach).not.toHaveBeenCalled();
    expect(result.operations).toEqual([]);
  });

  it('creates operations for image and multitail arrow arrays', () => {
    const perform = vi
      .spyOn(Action.prototype, 'perform')
      .mockReturnValue(new Action());
    try {
      fromMultipleMove(
        { molecule: {} },
        { [IMAGE_KEY]: [1], [MULTITAIL_ARROW_KEY]: [2] },
        new Vec2(1, 1),
      );

      expect((perform.mock.instances[0] as Action).operations).toEqual([
        expect.any(ImageMove),
        expect.any(MultitailArrowMove),
      ]);
    } finally {
      perform.mockRestore();
    }
  });
});
