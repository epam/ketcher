import { getSGroupBracketLayout } from 'application/render/sgroupBracketLayout';
import { SGroupRenderer } from 'application/render/renderers/SGroupRenderer';
import ReSGroup from 'application/render/restruct/resgroup';
import { SGroup, SGroupBracketType } from 'domain/entities/sgroup';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

describe('same-atom S-group bracket layout', () => {
  let struct: Struct;

  beforeEach(() => {
    struct = new Struct();
  });

  function group(
    id: number,
    type: string,
    atoms: number[],
    parent = -1,
  ): SGroup {
    const result = new SGroup(type);
    result.id = id;
    result.atoms = atoms;
    struct.sGroupForest.insert(result, parent, []);
    return result;
  }

  function layout(groups: SGroup[], extents = new Map<SGroup, Vec2>()) {
    return getSGroupBracketLayout(
      struct,
      groups,
      (sgroup) => sgroup.type !== 'DAT' && sgroup.isExpanded(),
      (sgroup) => extents.get(sgroup) ?? new Vec2(),
    );
  }

  it('leaves a single group and groups with different atoms unchanged', () => {
    const first = group(10, 'SRU', [1, 2]);
    const second = group(20, 'MUL', [2, 3]);
    const measure = jest.fn(() => new Vec2());

    expect(
      getSGroupBracketLayout(struct, [first], () => true, measure).size,
    ).toBe(0);
    expect(
      getSGroupBracketLayout(struct, [first, second], () => true, measure).size,
    ).toBe(0);
    expect(measure).not.toHaveBeenCalled();
  });

  it('orders three same-style peers by hierarchy rather than atom or input order', () => {
    const outer = group(10, 'SRU', [1, 2, 3]);
    const middle = group(20, 'MUL', [3, 1, 2], outer.id);
    const inner = group(30, 'SRU', [2, 3, 1], middle.id);
    const groups = [outer, inner, middle];
    const before = groups.map((item) => ({
      atoms: [...item.atoms],
      bracketType: item.data.bracketType,
    }));

    const result = layout(groups);

    expect(result.get(inner)).toEqual(new Vec2(0, 0));
    expect(result.get(middle)?.x).toBeCloseTo(0.65);
    expect(result.get(middle)?.y).toBeCloseTo(0.65);
    expect(result.get(outer)?.x).toBeCloseTo(1.3);
    expect(result.get(outer)?.y).toBeCloseTo(1.3);
    expect(
      groups.map((item) => ({
        atoms: item.atoms,
        bracketType: item.data.bracketType,
      })),
    ).toEqual(before);
  });

  it('accounts for a wider COP padding without overlapping a smaller outer group', () => {
    const outer = group(10, 'SRU', [1, 2]);
    const inner = group(20, 'COP', [2, 1], outer.id);
    inner.data.bracketType = SGroupBracketType.Round;

    const result = layout([outer, inner]);
    const innerPadding = SGroup.getBracketPadding(inner);
    const outerPadding = SGroup.getBracketPadding(outer);
    const innerOffset = result.get(inner);
    const outerOffset = result.get(outer);
    expect(innerOffset).toEqual(new Vec2(0, 0));
    expect(outerOffset).toBeDefined();
    if (!innerOffset || !outerOffset) {
      throw new Error('Expected layout offsets for both visible groups');
    }
    expect(outerPadding.x + outerOffset.x - innerPadding.x).toBeCloseTo(0.65);
    expect(outerPadding.y + outerOffset.y - innerPadding.y).toBeCloseTo(0.65);
  });

  it('does not add unnecessary offset when the outer COP padding already separates peers', () => {
    const outer = group(10, 'COP', [1, 2]);
    const inner = group(20, 'SRU', [1, 2], outer.id);

    const result = layout([outer, inner]);

    expect(result.get(inner)).toEqual(new Vec2(0, 0));
    expect(result.get(outer)).toEqual(new Vec2(0, 0));
  });

  it('reserves the measured label extent as well as the next bracket width', () => {
    const outer = group(10, 'SRU', [1, 2]);
    const inner = group(20, 'SUP', [1, 2], outer.id);
    inner.data.expanded = true;
    const extents = new Map([
      [inner, new Vec2(2.5, 0.3)],
      [outer, new Vec2(0.1, 0.4)],
    ]);

    const result = layout([outer, inner], extents);
    expect(result.get(inner)).toEqual(new Vec2(0, 0));
    expect(result.get(outer)?.x).toBeCloseTo(2.85);
    expect(result.get(outer)?.y).toBeCloseTo(0.8);
  });

  it('excludes DATA and contracted groups and reflows after a peer is removed', () => {
    const outer = group(10, 'SRU', [1, 2]);
    const visible = group(20, 'MUL', [2, 1], outer.id);
    const data = group(30, 'DAT', [1, 2], visible.id);
    const contracted = group(40, 'SUP', [1, 2], data.id);

    const initial = layout([outer, visible, data, contracted]);
    expect(initial.size).toBe(2);
    expect(initial.has(data)).toBe(false);
    expect(initial.has(contracted)).toBe(false);
    expect(initial.get(visible)).toEqual(new Vec2(0, 0));
    expect(initial.get(outer)?.x).toBeCloseTo(0.65);
    expect(initial.get(outer)?.y).toBeCloseTo(0.65);

    struct.sGroupForest.remove(visible.id);
    expect(layout([outer, data, contracted]).size).toBe(0);
  });

  it('excludes positioned and zero-length pairs from automatic peer layout', () => {
    const outer = group(10, 'SRU', [1, 2]);
    const visible = group(20, 'MUL', [1, 2], outer.id);
    const positioned = group(30, 'SRU', [1, 2], visible.id);
    const suppressed = group(40, 'SRU', [1, 2], positioned.id);
    positioned.data.brackets = {
      opening: { position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } } },
      closing: { position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } } },
    };
    suppressed.data.brackets = {
      opening: { position: { start: { x: 4, y: 4 }, end: { x: 4, y: 4 } } },
      closing: { position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } } },
    };

    const result = layout([outer, visible, positioned, suppressed]);
    expect(result.size).toBe(2);
    expect(result.get(visible)).toEqual(new Vec2(0, 0));
    expect(result.get(outer)?.x).toBeCloseTo(0.65);
    expect(result.has(positioned)).toBe(false);
    expect(result.has(suppressed)).toBe(false);
    expect(ReSGroup.hasVisibleBrackets(suppressed)).toBe(false);
    expect(SGroupRenderer.hasVisibleBrackets(suppressed)).toBe(false);
  });

  it.each([
    ['Raphael', ReSGroup.hasVisibleBrackets],
    ['D3', SGroupRenderer.hasVisibleBrackets],
  ])(
    '%s excludes groups without visible brackets',
    (_renderer, hasBrackets) => {
      const data = group(10, 'DAT', [1, 2]);
      const superatom = group(20, 'SUP', [1, 2]);
      superatom.data.name = 'Boc';
      const sru = group(30, 'SRU', [1, 2]);

      expect(hasBrackets(data)).toBe(false);
      expect(hasBrackets(superatom)).toBe(false);
      expect(hasBrackets(sru)).toBe(true);
      superatom.data.expanded = true;
      expect(hasBrackets(superatom)).toBe(true);
    },
  );
});
