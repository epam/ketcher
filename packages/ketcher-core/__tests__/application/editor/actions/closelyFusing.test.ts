import { fromItemsFuse } from 'application/editor/actions';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Struct, Vec2 } from 'domain/entities';

// Regression test for https://github.com/epam/ketcher/issues/346:
// fromItemsFuse's single-atom merge loop must not crash on a stale dst.
describe('fromItemsFuse: stale atom-merge target', () => {
  function buildReStruct(struct: Struct) {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const reStruct = new ReStruct(struct, render);
    reStruct.assignConnectedComponents();
    return reStruct;
  }

  function addAtom(struct: Struct, pos: Vec2) {
    return struct.atoms.add(new Atom({ label: 'C', pp: pos, fragment: 0 }));
  }

  it('does not throw when items.atoms references an already-deleted dst atom', () => {
    const struct = new Struct();

    const src = addAtom(struct, new Vec2(0, 0));
    const dst = addAtom(struct, new Vec2(1, 0));

    // dst already removed by something else in the same batch.
    struct.atoms.delete(dst);

    const reStruct = buildReStruct(struct);

    const items = {
      atoms: new Map<number, number>([[src, dst]]),
      bonds: new Map<number, number>(),
    };

    expect(() => fromItemsFuse(reStruct, items)).not.toThrow();

    // src is left as-is, not deleted along with a merge that never happened.
    expect(struct.atoms.has(src)).toBe(true);
  });
});
