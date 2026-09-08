import { fromOneAtomDeletion } from 'application/editor/actions/erase';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import { Atom, Struct, Vec2 } from 'domain/entities';

describe('fromOneAtomDeletion', () => {
  it('does not throw when deleting an atom from a fragment without an R-group', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0 }),
    );

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    restruct.assignConnectedComponents();

    expect(() => fromOneAtomDeletion(restruct, atomId)).not.toThrow();
    expect(struct.atoms.has(atomId)).toBe(false);
  });
});
