import { SGroupDataMove } from 'application/editor/operations';
import type { ReStruct } from 'application/render';
import { Vec2 } from 'domain/entities';

describe('SGroupDataMove', () => {
  it('does not throw when sgroup is missing', () => {
    const operation = new SGroupDataMove(1, new Vec2(1, 2));
    const restruct = {
      molecule: {
        sgroups: new Map(),
      },
    } as unknown as ReStruct;

    expect(() => operation.execute(restruct)).not.toThrow();
    expect(operation.data.d).toEqual(new Vec2(1, 2));
  });
});
