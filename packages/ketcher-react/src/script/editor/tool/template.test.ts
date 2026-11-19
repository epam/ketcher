import {
  KetSerializer,
  ketcherProvider,
  SaltsAndSolventsProvider,
  Struct,
  CoordinateTransformation,
  Box2Abs,
  Scale,
  Vec2,
  Atom,
  Bond,
  RxnArrow,
  RxnArrowMode,
} from 'ketcher-core';
import Editor from '../Editor';
import TemplateTool from './template';
import templates from '../../ui/data/templates';

function chemicalState(struct: Struct) {
  return {
    atoms: [...struct.atoms]
      .sort(([a], [b]) => a - b)
      .map(([id, atom]) => [
        id,
        atom.label,
        atom.pp.x,
        atom.pp.y,
        atom.fragment,
      ]),
    bonds: [...struct.bonds.values()]
      .map((bond) => [
        Math.min(bond.begin, bond.end),
        Math.max(bond.begin, bond.end),
        bond.type,
      ])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    groups: [...struct.sgroups.values()].map((group) => ({
      name: group.data.name,
      expanded: group.isExpanded(),
      atoms: [...group.atoms].sort((a, b) => a - b),
      attachmentPoints: group
        .getAttachmentPoints()
        .map((point) => ({ ...point })),
    })),
    arrows: [...struct.rxnArrows.values()].map((arrow) => ({
      mode: arrow.mode,
      positions: arrow.pos.map((point) => [point.x, point.y]),
    })),
  };
}

function groupStructure(name: string) {
  return new KetSerializer().deserialize(
    JSON.stringify({
      root: { nodes: [{ $ref: 'mol0' }] },
      mol0: {
        type: 'molecule',
        atoms: [
          { label: 'C', location: [0, 0, 0] },
          { label: 'C', location: [-1, 0, 0] },
          { label: 'O', location: [0, 1, 0] },
          ...(name === 'Ac' ? [] : [{ label: 'O', location: [1, 0, 0] }]),
        ],
        bonds: [
          { type: 1, atoms: [0, 1] },
          { type: 2, atoms: [0, 2] },
          ...(name === 'Ac' ? [] : [{ type: 1, atoms: [0, 3] }]),
        ],
        sgroups: [
          {
            type: 'SUP',
            name,
            expanded: false,
            id: 0,
            atoms: name === 'Ac' ? [0, 1, 2] : [0, 1, 2, 3],
            ...(name === 'Ac'
              ? { attachmentPoints: [{ attachmentAtom: 0 }] }
              : {}),
          },
        ],
      },
    }),
  );
}

function expectConnectedBenzene(struct: Struct) {
  expect(
    new Set([...struct.atoms.values()].map((atom) => atom.fragment)).size,
  ).toBe(1);
  const adjacency = new Map(
    [...struct.atoms.keys()].map((id) => [id, new Set<number>()]),
  );
  struct.bonds.forEach(({ begin, end }) => {
    expect(begin).not.toBe(end);
    adjacency.get(begin)?.add(end);
    adjacency.get(end)?.add(begin);
  });
  const visited = new Set<number>();
  const pending = [[...struct.atoms.keys()][0]];
  while (pending.length) {
    const id = pending.pop();
    if (id === undefined || visited.has(id)) continue;
    visited.add(id);
    pending.push(...(adjacency.get(id) ?? []));
  }
  expect(visited.size).toBe(struct.atoms.size);
  // Strip substituents to assert the ring independently of atom numbering.
  const leaves = [...adjacency.keys()].filter(
    (id) => adjacency.get(id)?.size === 1,
  );
  while (leaves.length) {
    const id = leaves.pop();
    if (id === undefined) continue;
    adjacency.get(id)?.forEach((neighbor) => {
      adjacency.get(neighbor)?.delete(id);
      if (adjacency.get(neighbor)?.size === 1) leaves.push(neighbor);
    });
    adjacency.delete(id);
  }
  expect(adjacency.size).toBe(6);
  adjacency.forEach((neighbors, id) => {
    expect(neighbors.size).toBe(2);
    expect(struct.atoms.get(id)?.label).toBe('C');
  });
  expect(
    [...struct.bonds.values()].filter(
      (bond) =>
        adjacency.has(bond.begin) && adjacency.has(bond.end) && bond.type === 2,
    ),
  ).toHaveLength(3);
}

describe('TemplateTool collapsed group placement', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'getBoundingClientRect', {
      configurable: true,
      value: () => document.documentElement.getBoundingClientRect(),
    });
    jest.spyOn(ketcherProvider, 'getKetcher').mockReturnValue({
      changeEvent: { dispatch: jest.fn() },
    } as unknown as ReturnType<typeof ketcherProvider.getKetcher>);
    const salt = new Struct();
    salt.name = salt.abbreviation = 'acetic acid';
    SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([salt]);
  });

  afterEach(() => {
    Reflect.deleteProperty(document, 'getBoundingClientRect');
    SaltsAndSolventsProvider.getInstance().setSaltsAndSolventsList([]);
    jest.restoreAllMocks();
  });

  it.each([
    ['Ac', 0, false, false],
    ['acetic acid', 0, false, false],
    ['Ac', 10, false, false],
    ['acetic acid', 10, false, false],
    ['Ac', 0, true, false],
    ['Ac', 10, true, false],
    ['Ac', 0, true, true],
    ['Ac', 10, true, true],
    ['Ac', 100, false, false],
    ['acetic acid', 100, false, false],
    ['Ac', 100, true, true],
  ] as const)(
    'replaces contracted %s with benzene (drag: %s, attached: %s, imported: %s)',
    async (name, drag, attached, imported) => {
      const editor = new Editor(
        '1',
        document as unknown as HTMLElement,
        {},
        {},
      );
      const removeFG = jest.fn(() => Promise.resolve());
      editor.event.removeFG.add(removeFG);
      const struct = groupStructure(name);
      if (attached) {
        const atomId = struct.atoms.add(
          new Atom({ label: 'N', pp: new Vec2(1, 0), fragment: 0 }),
        );
        struct.bonds.add(new Bond({ begin: 0, end: atomId, type: 1 }));
      }
      if (imported) {
        const group = [...struct.sgroups.values()][0];
        group.atoms = [1, 0, 2];
        [...group.getAttachmentPoints()].forEach((point) =>
          group.removeAttachmentPoint(point),
        );
      }
      editor.struct(struct);
      const before = chemicalState(editor.struct());
      const group = [...editor.struct().sgroups.values()][0];
      const position = group.getContractedPosition(editor.struct()).position;
      // JSDOM does not lay out SVG text. Supply the label's browser geometry;
      // the tool still uses the real hit testing and merge operations.
      const canvasPosition = Scale.modelToCanvas(
        position,
        editor.render.options,
      );
      const labelAtom = editor.render.ctab.atoms.get(
        group.getContractedPosition(editor.struct()).atomId,
      );
      if (!labelAtom) throw new Error('Group label atom not found');
      labelAtom.visel.boundingBox = new Box2Abs(
        canvasPosition.sub(new Vec2(10, 10)),
        canvasPosition.add(new Vec2(10, 10)),
      );
      const point = CoordinateTransformation.modelToView(
        position,
        editor.render,
      );
      const event = new MouseEvent('mousedown', {
        clientX: point.x,
        clientY: point.y,
      });
      const tool = editor.tool('template', { struct: templates[0].clone() });
      if (!(tool instanceof TemplateTool))
        throw new Error('Template tool not selected');
      const undoCount = editor.historySize().undo;

      await tool.mousedown(event);
      if (drag) {
        tool.mousemove(
          new MouseEvent('mousemove', {
            clientX: point.x + drag,
            clientY: point.y + drag,
          }),
        );
      }
      tool.mouseup(event);

      expect(removeFG).not.toHaveBeenCalled();
      const expectedSize = 6 + Number(attached) + Number(drag > 40);
      expect(editor.struct().atoms.size).toBe(expectedSize);
      expect(editor.struct().bonds.size).toBe(expectedSize);
      expect(editor.struct().sgroups.size).toBe(0);
      expectConnectedBenzene(editor.struct());
      if (attached) {
        const nitrogen = [...editor.struct().atoms].find(
          ([, atom]) => atom.label === 'N',
        );
        expect(nitrogen).toBeDefined();
        expect(
          editor
            .struct()
            .atomGetNeighbors(nitrogen?.[0] ?? -1)
            ?.map(({ aid }) => aid),
        ).toEqual([0]);
      }
      if (drag > 40) {
        const anchor = editor.struct().atoms.get(0);
        const ringNeighbor = editor
          .struct()
          .atomGetNeighbors(0)
          ?.find(({ aid }) => editor.struct().atoms.get(aid)?.label === 'C');
        const ringAtom = editor.struct().atoms.get(ringNeighbor?.aid ?? -1);
        if (!anchor || !ringAtom)
          throw new Error('Dragged ring attachment missing');
        const direction = ringAtom.pp.sub(anchor.pp);
        expect(direction.length()).toBeCloseTo(1);
        expect(direction.x).toBeGreaterThan(0.5);
        expect(direction.y).toBeGreaterThan(0.5);
      }
      expect(editor.historySize().undo).toBe(undoCount + 1);
      const after = chemicalState(editor.struct());
      editor.undo();
      expect(chemicalState(editor.struct())).toEqual(before);
      editor.redo();
      expect(chemicalState(editor.struct())).toEqual(after);
    },
  );

  it.each([
    ['Ac', false, false, false],
    ['acetic acid', false, false, false],
    ['Ac', true, false, false],
    ['acetic acid', true, false, false],
    ['Ac', false, true, false],
    ['Ac', true, true, false],
    ['Ac', false, false, true],
  ] as const)(
    'places a benzene vertex over %s with the cursor outside the label (motion: %s, attached import: %s, custom arrow: %s)',
    async (name, motion, attached, withArrow) => {
      const editor = new Editor(
        '1',
        document as unknown as HTMLElement,
        {},
        {},
      );
      const struct = groupStructure(name);
      if (attached) {
        const nitrogen = struct.atoms.add(
          new Atom({ label: 'N', pp: new Vec2(-2, 0), fragment: 0 }),
        );
        struct.bonds.add(new Bond({ begin: 0, end: nitrogen, type: 1 }));
        const group = [...struct.sgroups.values()][0];
        group.atoms = [1, 0, 2];
        [...group.getAttachmentPoints()].forEach((point) =>
          group.removeAttachmentPoint(point),
        );
      }
      editor.struct(struct);
      const before = chemicalState(editor.struct());
      const undoCount = editor.historySize().undo;
      const group = [...editor.struct().sgroups.values()][0];
      const target = group.getContractedPosition(editor.struct()).position;
      const template = templates[0].clone();
      if (withArrow) {
        template.addRxnArrow(
          new RxnArrow({
            mode: RxnArrowMode.OpenAngle,
            pos: [new Vec2(0, 3), new Vec2(2, 3)],
          }),
        );
      }
      const tool = editor.tool('template', { struct: template });
      if (!(tool instanceof TemplateTool))
        throw new Error('Template tool not selected');
      const eventAt = (position: Vec2) => {
        const page = CoordinateTransformation.modelToView(
          position,
          editor.render,
        );
        return new MouseEvent('mousemove', {
          clientX: page.x,
          clientY: page.y,
        });
      };
      const previewCenter = target.add(new Vec2(4, 0));
      tool.mousemove(eventAt(previewCenter));
      const previewVertex = [...editor.struct().atoms.values()].find(
        (atom) => atom.isPreview,
      );
      if (!previewVertex) throw new Error('Toolbar preview missing');
      const cursor = target.sub(previewVertex.pp.sub(previewCenter));
      tool.mousemove(eventAt(cursor));
      const labelAtom = editor.render.ctab.atoms.get(
        group.getContractedPosition(editor.struct()).atomId,
      );
      if (!labelAtom) throw new Error('Group label atom missing');
      const labelCenter = Scale.modelToCanvas(target, editor.render.options);
      labelAtom.visel.boundingBox = new Box2Abs(
        labelCenter.sub(new Vec2(10, 10)),
        labelCenter.add(new Vec2(10, 10)),
      );
      const event = eventAt(cursor);
      expect(
        editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']),
      ).toBeNull();
      const alignedVertex = [...editor.struct().atoms.values()].find(
        (atom) => atom.isPreview && Vec2.dist(atom.pp, target) < 0.01,
      );
      expect(alignedVertex).toBeDefined();

      await tool.mousedown(event);
      if (motion) tool.mousemove(event);
      tool.mouseup(event);

      if (withArrow) {
        expect(editor.struct().rxnArrows.size).toBe(1);
        expect(editor.struct().sgroups.size).toBe(1);
        const after = chemicalState(editor.struct());
        editor.undo();
        expect(chemicalState(editor.struct())).toEqual(before);
        editor.redo();
        expect(chemicalState(editor.struct())).toEqual(after);
        return;
      }
      expect(editor.struct().sgroups.size).toBe(0);
      expect(editor.struct().atoms.size).toBe(attached ? 7 : 6);
      expect(editor.struct().bonds.size).toBe(attached ? 7 : 6);
      expectConnectedBenzene(editor.struct());
      expect(editor.historySize().undo).toBe(undoCount + 1);
      if (attached) {
        expect(
          editor
            .struct()
            .atomGetNeighbors(3)
            ?.map(({ aid }) => aid),
        ).toEqual([0]);
      }
      const after = chemicalState(editor.struct());
      editor.undo();
      expect(chemicalState(editor.struct())).toEqual(before);
      editor.redo();
      expect(chemicalState(editor.struct())).toEqual(after);
    },
  );

  it('keeps a custom template abbreviation when it has no existing canvas merge target', async () => {
    const editor = new Editor('1', document as unknown as HTMLElement, {}, {});
    const customTemplate = new KetSerializer().deserialize(
      JSON.stringify({
        root: { nodes: [{ $ref: 'mol0' }] },
        mol0: {
          type: 'molecule',
          atoms: [{ label: 'C', location: [0, 0, 0] }],
          bonds: [],
          sgroups: [
            { id: 0, type: 'SUP', name: 'Custom', atoms: [0], expanded: false },
          ],
        },
      }),
    );
    const tool = editor.tool('template', { struct: customTemplate });
    if (!(tool instanceof TemplateTool))
      throw new Error('Template tool not selected');
    const point = CoordinateTransformation.modelToView(
      new Vec2(),
      editor.render,
    );
    const event = new MouseEvent('mousedown', {
      clientX: point.x,
      clientY: point.y,
    });
    await tool.mousedown(event);
    tool.mouseup();
    expect(editor.struct().atoms.size).toBe(1);
    expect(
      [...editor.struct().sgroups.values()].map((group) => group.data.name),
    ).toEqual(['Custom']);
    const after = chemicalState(editor.struct());
    editor.undo();
    expect(editor.struct().atoms.size).toBe(0);
    editor.redo();
    expect(chemicalState(editor.struct())).toEqual(after);
  });

  it('still requests abbreviation removal when placing a ring on an expanded group atom', async () => {
    const editor = new Editor('1', document as unknown as HTMLElement, {}, {});
    const struct = groupStructure('Ac');
    const group = [...struct.sgroups.values()][0];
    group.data.expanded = true;
    editor.struct(struct);
    const removeFG = jest.fn(() => Promise.resolve());
    editor.event.removeFG.add(removeFG);
    const before = chemicalState(editor.struct());
    const atom = [...editor.struct().atoms.values()][1];
    const point = CoordinateTransformation.modelToView(atom.pp, editor.render);
    const event = new MouseEvent('mousedown', {
      clientX: point.x,
      clientY: point.y,
    });
    const tool = editor.tool('template', { struct: templates[0].clone() });
    if (!(tool instanceof TemplateTool))
      throw new Error('Template tool not selected');
    await tool.mousedown(event);
    tool.mouseup(event);
    expect(removeFG).toHaveBeenCalledTimes(1);
    expect(chemicalState(editor.struct())).toEqual(before);
  });

  it.each(['canvas', 'atom', 'bond'])(
    'preserves ordinary %s template placement and Undo/Redo',
    async (target) => {
      const editor = new Editor(
        '1',
        document as unknown as HTMLElement,
        {},
        {},
      );
      const struct = new Struct();
      if (target !== 'canvas') {
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
      }
      if (target === 'bond') {
        struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
        struct.bonds.add(new Bond({ begin: 0, end: 1, type: 1 }));
      }
      editor.struct(struct);
      const before = chemicalState(editor.struct());
      const position =
        target === 'canvas'
          ? new Vec2()
          : [...editor.struct().atoms.values()]
              .reduce((sum, atom) => sum.add(atom.pp), new Vec2())
              .scaled(1 / editor.struct().atoms.size);
      const point = CoordinateTransformation.modelToView(
        position,
        editor.render,
      );
      if (target === 'bond') {
        const bond = editor.render.ctab.bonds.get(0);
        if (!bond) throw new Error('Target bond not found');
        const center = Scale.modelToCanvas(position, editor.render.options);
        jest
          .spyOn(bond, 'getSelectionPoints')
          .mockReturnValue([
            center.add(new Vec2(-10, -5)),
            center.add(new Vec2(-10, 5)),
            center.add(new Vec2(10, 5)),
            center.add(new Vec2(10, -5)),
          ]);
      }
      const event = new MouseEvent('mousedown', {
        clientX: point.x,
        clientY: point.y,
      });
      const tool = editor.tool('template', { struct: templates[0].clone() });
      if (!(tool instanceof TemplateTool))
        throw new Error('Template tool not selected');
      await tool.mousedown(event);
      tool.mouseup(event);
      expect(editor.struct().atoms.size).toBe(6);
      expect(editor.struct().bonds.size).toBe(6);
      expectConnectedBenzene(editor.struct());
      const after = chemicalState(editor.struct());
      editor.undo();
      expect(chemicalState(editor.struct())).toEqual(before);
      editor.redo();
      expect(chemicalState(editor.struct())).toEqual(after);
    },
  );
});
