import { CoreEditor } from 'application/editor';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { ReStruct, Render } from 'application/render';
import {
  Atom,
  Bond,
  SGroup,
  SGroupBracketType,
  Struct,
  Vec2,
} from 'domain/entities';
import type { SGroupBrackets } from 'domain/entities/sgroup';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

const positionedBrackets: SGroupBrackets = {
  opening: {
    type: SGroupBracketType.Square,
    position: { start: { x: -2, y: 1 }, end: { x: -2, y: -1 } },
  },
  closing: {
    type: SGroupBracketType.Square,
    position: { start: { x: 3, y: 2 }, end: { x: 3, y: -2 } },
  },
};

function createStruct(brackets?: SGroupBrackets) {
  const struct = new Struct();
  const first = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  const second = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
  const bond = new Bond({ begin: first, end: second, type: 1 });
  const bondId = struct.bonds.add(bond);
  struct.bondInitHalfBonds(bondId, bond);
  const group = new SGroup(SGroup.TYPES.MUL);
  group.id = struct.sgroups.add(group);
  struct.atomAddToSGroup(group.id, first);
  struct.atomAddToSGroup(group.id, second);
  struct.sGroupForest.insert(group);
  group.data.brackets = brackets;
  struct.initNeighbors();
  struct.setImplicitHydrogen();
  struct.markFragments();
  return { struct, group };
}

function renderMicro(struct: Struct) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const render = new Render(container, {
    microModeScale: 20,
    width: 500,
    height: 500,
  });
  render.ctab = new ReStruct(struct, render);
  render.ctab.update(true);
  return { container, scale: render.options.microModeScale };
}

function renderMacro(struct: Struct) {
  const canvas = createPolymerEditorCanvas();
  const editor = new CoreEditor({
    canvas,
    theme: {},
    renderersContainer: createRenderersManager(),
  });
  const { modelChanges } =
    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );
  editor.renderersContainer.update(modelChanges);
  return { container: canvas, scale: 40, editor };
}

function coordinates(path: Element) {
  return (
    path.getAttribute('d')?.match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)/g) ?? []
  ).map(Number);
}

describe.each([
  ['Raphael', renderMicro],
  ['D3', renderMacro],
])('%s S-group bracket positions', (_name, render) => {
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeEach(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    });
    const matrix = {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
      inverse() {
        return this;
      },
      multiply() {
        return this;
      },
      translate() {
        return this;
      },
      scale() {
        return this;
      },
      rotate() {
        return this;
      },
    };
    Object.defineProperty(SVGSVGElement.prototype, 'createSVGMatrix', {
      configurable: true,
      value: () => matrix,
    });
    Object.defineProperty(SVGSVGElement.prototype, 'createSVGPoint', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        matrixTransform() {
          return this;
        },
      }),
    });
  });

  afterEach(() => {
    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', {
        configurable: true,
        value: originalGetBBox,
      });
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
    Reflect.deleteProperty(SVGSVGElement.prototype, 'createSVGMatrix');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'createSVGPoint');
    document.body.innerHTML = '';
  });

  it('draws both supplied spines and anchors the label to the closing bracket', () => {
    const { struct } = createStruct(positionedBrackets);
    const { container, scale } = render(struct);
    const opening = container.querySelector(
      '[data-testid="s-group-bracket"][data-bracket-side="opening"]',
    );
    const closing = container.querySelector(
      '[data-testid="s-group-bracket"][data-bracket-side="closing"]',
    );
    if (!opening || !closing) {
      throw new Error('Expected both positioned S-group bracket paths');
    }
    const openingCoordinates = coordinates(opening);
    const closingCoordinates = coordinates(closing);
    expect(openingCoordinates[2]).toBeCloseTo(-2 * scale);
    expect(openingCoordinates[3]).toBeCloseTo(-1 * scale);
    expect(openingCoordinates[4]).toBeCloseTo(-2 * scale);
    expect(openingCoordinates[5]).toBeCloseTo(scale);
    expect(closingCoordinates[2]).toBeCloseTo(3 * scale);
    expect(closingCoordinates[3]).toBeCloseTo(-2 * scale);
    expect(closingCoordinates[4]).toBeCloseTo(3 * scale);
    expect(closingCoordinates[5]).toBeCloseTo(2 * scale);
    const label = container.querySelector('[data-testid="s-group-label"]');
    expect(label).not.toBeNull();
    expect(Number(label?.getAttribute('x'))).toBeGreaterThanOrEqual(3 * scale);
    expect(Number(label?.getAttribute('y'))).toBeGreaterThanOrEqual(2 * scale);
  });

  it('uses the closing side for the label even when it is on the left', () => {
    const brackets: SGroupBrackets = {
      opening: positionedBrackets.closing,
      closing: positionedBrackets.opening,
    };
    const { struct } = createStruct(brackets);
    const { container, scale } = render(struct);
    const label = container.querySelector('[data-testid="s-group-label"]');
    expect(label).not.toBeNull();
    expect(Number(label?.getAttribute('x'))).toBeLessThan(-1.5 * scale);
    expect(Number(label?.getAttribute('y'))).toBeGreaterThanOrEqual(scale);
  });

  it.each([
    ['round', SGroupBracketType.Round],
    ['curly', SGroupBracketType.Curly],
  ])('draws %s shapes at the supplied positions', (_name, type) => {
    const brackets: SGroupBrackets = {
      opening: { ...positionedBrackets.opening, type },
      closing: { ...positionedBrackets.closing, type },
    };
    const { struct } = createStruct(brackets);
    const { container } = render(struct);
    const paths = [
      ...container.querySelectorAll('[data-testid="s-group-bracket"]'),
    ];
    expect(paths).toHaveLength(2);
    paths.forEach((path) => {
      expect(path.getAttribute('d')).toContain(
        type === SGroupBracketType.Round ? 'C' : 'Q',
      );
    });
  });

  it('draws diagonal brackets with hooks pointing toward the atoms', () => {
    const brackets: SGroupBrackets = {
      opening: {
        type: SGroupBracketType.Square,
        position: { start: { x: 0, y: 1 }, end: { x: -1, y: -1 } },
      },
      closing: {
        type: SGroupBracketType.Square,
        position: { start: { x: 2, y: -1 }, end: { x: 3, y: 1 } },
      },
    };
    const { struct } = createStruct(brackets);
    const { container, scale } = render(struct);
    const paths = [
      ...container.querySelectorAll('[data-testid="s-group-bracket"]'),
    ];
    expect(paths).toHaveLength(2);
    paths.forEach((path) => {
      const [arcX, arcY, spineX, spineY, endX, endY] = coordinates(path);
      const centerX = (spineX + endX) / 2;
      const centerY = (spineY + endY) / 2;
      const towardAtomsX = 0.5 * scale - centerX;
      const towardAtomsY = -centerY;
      const hookX = arcX - spineX;
      const hookY = arcY - spineY;
      expect(hookX * towardAtomsX + hookY * towardAtomsY).toBeGreaterThan(0);
    });
  });

  it.each([
    ['opening', { x: 1, y: 1 }, undefined],
    ['closing', undefined, { x: 3, y: 3 }],
    ['both', { x: 0, y: 0 }, { x: 0, y: 0 }],
  ])('draws no pair when %s is zero-length', (_case, opening, closing) => {
    const brackets: SGroupBrackets = {
      opening: {
        ...positionedBrackets.opening,
        position: opening
          ? { start: opening, end: opening }
          : positionedBrackets.opening.position,
      },
      closing: {
        ...positionedBrackets.closing,
        position: closing
          ? { start: closing, end: closing }
          : positionedBrackets.closing.position,
      },
    };
    const { struct, group } = createStruct(brackets);
    const { container } = render(struct);
    expect(
      container.querySelectorAll('[data-testid="s-group-bracket"]'),
    ).toHaveLength(0);
    expect(group.data.brackets).toEqual(brackets);
  });

  it('uses automatic brackets when neither position is supplied', () => {
    const { struct } = createStruct();
    const { container } = render(struct);
    expect(
      container.querySelectorAll('[data-testid="s-group-bracket"]'),
    ).toHaveLength(2);
  });
});
