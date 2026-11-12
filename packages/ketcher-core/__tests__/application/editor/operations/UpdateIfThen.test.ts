import { UpdateIfThen } from 'application/editor/operations/UpdateIfThen';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { RGroup, Struct } from 'domain/entities';

describe('UpdateIfThen', () => {
  it('skips excluded and nonmatching groups without skipping later matches', () => {
    const struct = new Struct();
    const render = new Render(
      document as unknown as HTMLElement,
      {
        scale: 40,
        width: 100,
        height: 100,
      } as unknown as RenderOptions,
    );
    const restruct = new ReStruct(struct, render);
    struct.rgroups.set(1, new RGroup({ ifthen: 2 }));
    struct.rgroups.set(2, new RGroup({ ifthen: 3 }));
    struct.rgroups.set(3, new RGroup({ ifthen: 2 }));
    const operation = new UpdateIfThen(4, 2, [1]);

    operation.execute(restruct);

    expect(struct.rgroups.get(1)?.ifthen).toBe(2);
    expect(struct.rgroups.get(2)?.ifthen).toBe(3);
    expect(struct.rgroups.get(3)?.ifthen).toBe(4);
    expect(operation.ifThenHistory).toEqual(new Map([[3, 2]]));
  });
});
