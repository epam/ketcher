import { SGroupAddToHierarchy } from 'application/editor/operations';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { Struct } from 'domain/entities';

describe('SGroupAddToHierarchy', () => {
  it('throws a clear error when s-group is missing', () => {
    const struct = new Struct();
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    const operation = new SGroupAddToHierarchy(100500);

    expect(() => operation.execute(restruct)).toThrow(
      'SGroupAddToHierarchy: S-Group 100500 not found',
    );
  });
});
