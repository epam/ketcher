import {
  Atom,
  Bond,
  Fragment,
  Render,
  ReStruct,
  Struct,
  Vec2,
} from 'ketcher-core';
import type { RenderOptions } from 'ketcher-core';
import type Editor from '../Editor';
import PasteTool from './paste';

const SCALE = 40;

function addMolecule(
  struct: Struct,
  atoms: Array<{ label: string; pp: Vec2 }>,
  bonds: Array<[number, number]> = [],
): number[] {
  const frid = struct.frags.add(new Fragment());
  const atomIds = atoms.map(({ label, pp }) =>
    struct.atoms.add(new Atom({ label, pp, fragment: frid })),
  );
  bonds.forEach(([begin, end]) =>
    struct.bonds.add(
      new Bond({ begin: atomIds[begin], end: atomIds[end], type: 1 }),
    ),
  );
  return atomIds;
}

function createEditor(struct: Struct) {
  const render = new Render(document.createElement('div'), {
    microModeScale: SCALE,
    zoom: 1,
    width: 100,
    height: 100,
  } as RenderOptions);
  const restruct = new ReStruct(struct, render);
  render.ctab = restruct;

  const editor = {
    render,
    selection: vi.fn(),
    update: vi.fn(),
    hover: vi.fn(),
    struct: () => restruct.molecule,
    findItem: vi.fn().mockReturnValue(null),
    explicitSelected: () => null,
    options: () => ({}),
    tool: vi.fn(),
    event: { message: { dispatch: vi.fn() } },
  } as unknown as Editor;

  return { editor, molecule: restruct.molecule };
}

function pointerAt(model: Vec2) {
  return {
    clientX: model.x * SCALE,
    clientY: model.y * SCALE,
    ctrlKey: false,
  } as PointerEvent;
}

function findAtomByLabel(molecule: Struct, label: string): number {
  const entry = [...molecule.atoms.entries()].find(
    ([, atom]) => atom.label === label,
  );
  if (!entry) throw new Error(`No ${label} atom on the canvas`);
  return entry[0];
}

function neighborLabels(molecule: Struct, atomId: number): string[] {
  return [...molecule.bonds.values()]
    .filter((bond) => bond.begin === atomId || bond.end === atomId)
    .map((bond) => (bond.begin === atomId ? bond.end : bond.begin))
    .map((id) => molecule.atoms.get(id)?.label ?? '');
}

describe('PasteTool on an atom of the canvas', () => {
  const targetPosition = new Vec2(5, 5);
  let editor: Editor;
  let molecule: Struct;
  let targetAtomId: number;
  let tool: PasteTool;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    const canvas = new Struct();
    [targetAtomId] = addMolecule(canvas, [{ label: 'C', pp: targetPosition }]);
    ({ editor, molecule } = createEditor(canvas));

    const pasted = new Struct();
    addMolecule(
      pasted,
      [
        { label: 'N', pp: new Vec2(0, 0) },
        { label: 'O', pp: new Vec2(1, 0) },
      ],
      [[0, 1]],
    );

    tool = new PasteTool(editor, pasted);
    tool.mousemove(pointerAt(targetPosition));
    tool.setMergeItems({
      atoms: new Map([[findAtomByLabel(molecule, 'N'), targetAtomId]]),
      bonds: new Map(),
      atomToFunctionalGroup: new Map(),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('forms a bond to the pasted structure when the mouse is dragged away', () => {
    tool.mousedown(pointerAt(targetPosition));
    tool.mousemove(pointerAt(new Vec2(8, 5)));
    tool.mouseup();

    expect(molecule.atoms.size).toBe(3);
    expect(neighborLabels(molecule, targetAtomId)).toEqual(['N']);
    const nitrogen = molecule.atoms.get(findAtomByLabel(molecule, 'N'));
    expect(Vec2.dist(nitrogen?.pp ?? new Vec2(), targetPosition)).toBeCloseTo(
      1,
    );
  });

  it('merges the pasted atom into the canvas atom on a click', () => {
    tool.mousedown(pointerAt(targetPosition));
    tool.mouseup();

    expect(molecule.atoms.size).toBe(2);
    expect(neighborLabels(molecule, targetAtomId)).toEqual(['O']);
  });

  it('merges the pasted atom when the drag is shorter than a bond', () => {
    tool.mousedown(pointerAt(targetPosition));
    tool.mousemove(pointerAt(new Vec2(5.5, 5)));
    tool.mouseup();

    expect(molecule.atoms.size).toBe(2);
    expect(neighborLabels(molecule, targetAtomId)).toEqual(['O']);
  });
});
