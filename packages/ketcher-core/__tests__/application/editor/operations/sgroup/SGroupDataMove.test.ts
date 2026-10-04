import { SGroupDataMove } from 'application/editor/operations';
import type { ReStruct } from 'application/render';
import { Vec2 } from 'domain/entities';

describe('SGroupDataMove', () => {
  it('does not throw when sgroup is missing', () => {
    const operation = new SGroupDataMove(1, new Vec2(1, 2));
    const markItem = jest.fn();
    const restruct = {
      molecule: {
        sgroups: new Map(),
      },
      markItem,
    } as unknown as ReStruct;

    expect(() => operation.execute(restruct)).not.toThrow();
    expect(operation.data.d?.x).toBe(1);
    expect(operation.data.d?.y).toBe(2);
    expect(operation.data.d).not.toEqual(new Vec2(-1, -2));
    expect(markItem).not.toHaveBeenCalled();
  });

  it('moves sgroup point and stores inverse vector when sgroup exists', () => {
    const operation = new SGroupDataMove(1, new Vec2(1, 2));
    const add = jest.fn();
    const sgroup = { pp: { add_: add } };
    const markItem = jest.fn();
    const restruct = {
      molecule: {
        sgroups: new Map([[1, sgroup]]),
      },
      markItem,
    } as unknown as ReStruct;

    operation.execute(restruct);

    expect(add).toHaveBeenCalledWith(new Vec2(1, 2));
    expect(operation.data.d?.x).toBe(-1);
    expect(operation.data.d?.y).toBe(-2);
    expect(markItem).toHaveBeenCalledWith('sgroupData', 1, 1);
  });
});
