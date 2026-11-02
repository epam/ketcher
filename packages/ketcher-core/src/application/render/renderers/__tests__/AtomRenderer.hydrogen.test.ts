import { select, type Selection } from 'd3';
import type { ImplicitHydrogenSide } from 'domain/helpers';
import { AtomRenderer } from '../AtomRenderer';
import { AtomLabel, type CoreAtomLabel } from 'domain/constants';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { Vec2 } from 'domain/entities/vec2';
import { BAD_VALENCE_LINE_OFFSET } from 'application/render/renderers/constants';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import type { Atom } from 'domain/entities/CoreAtom';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';

// The singleton needs a live canvas; the renderer only reads its viewModel.
jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

interface FakeAtom {
  label: CoreAtomLabel;
  properties: {
    radical?: number;
    isotope?: number;
    charge?: number;
    explicitValence?: number;
  };
  hydrogenAmount: number;
  hasCharge: boolean;
  hasRadical: boolean;
  hasAlias: boolean;
  hasExplicitIsotope: boolean;
  hasExplicitValence: boolean;
  hasBadValence: boolean;
  position: Vec2;
  bonds: MonomerToAtomBond[];
  calculateValence: () => { hydrogenAmount: number };
}

function fakeAtom({
  label = AtomLabel.N,
  hydrogenAmount = 1,
  radical = 0,
  isotope,
  charge,
  explicitValence,
  hasBadValence = false,
}: {
  label?: CoreAtomLabel;
  hydrogenAmount?: number;
  radical?: number;
  isotope?: number;
  charge?: number;
  explicitValence?: number;
  hasBadValence?: boolean;
} = {}): FakeAtom {
  return {
    label,
    properties: { radical, isotope, charge, explicitValence },
    hydrogenAmount,
    hasCharge: charge !== undefined,
    hasRadical: radical !== 0,
    hasAlias: false,
    hasExplicitIsotope: isotope !== undefined,
    hasExplicitValence: explicitValence !== undefined,
    hasBadValence,
    position: new Vec2(0, 0),
    bonds: [],
    calculateValence: () => ({ hydrogenAmount }),
  };
}

// Model directions point down on the canvas: y > 0 is below the atom.
const degToModelDir = (visualDeg: number) => ({
  direction: new Vec2(
    Math.cos((visualDeg * Math.PI) / 180),
    -Math.sin((visualDeg * Math.PI) / 180),
  ),
});

// A bond from the atom to a monomer that sits in the given visual direction.
function bondToMonomer(atom: FakeAtom, visualDeg: number) {
  const monomer = {
    position: degToModelDir(visualDeg).direction,
  } as unknown as BaseMonomer;
  return new MonomerToAtomBond(monomer, atom as unknown as Atom);
}

function stubViewModel(atom: FakeAtom, bondAnglesDeg: number[]) {
  (provideEditorInstance as jest.Mock).mockReturnValue({
    viewModel: {
      atomsToHalfEdges: new Map([[atom, bondAnglesDeg.map(degToModelDir)]]),
    },
  });
}

// AtomRenderer's constructor needs a live canvas and editor, so the renderer
// is built with Object.create and the private drawing steps (appendLabel,
// appendAtomProperties, ...) are called one by one the way show() calls them. The
// existing AtomRenderer.test.ts only calls public getters, which is not enough
// to read back the drawn text.
type RendererUnderTest = Pick<
  AtomRenderer,
  | 'getHoverContour'
  | 'labelBBoxes'
  | 'bondTrimBBoxes'
  | 'redrawLabelIfHydrogenSideChanged'
> & {
  appendLabel: () => Selection<SVGTextElement, unknown, null, undefined>;
  appendExplicitIsotope: () => void;
  appendAtomProperties: () => void;
  appendBadValenceWarning: () => void;
  textElement: Selection<SVGTextElement, unknown, null, undefined>;
  computeHydrogenSide: () => ImplicitHydrogenSide;
};

function createRenderer(
  atom: FakeAtom,
  bondAnglesDeg: number[],
  monomerBondAnglesDeg: number[] = [],
) {
  stubViewModel(atom, bondAnglesDeg);
  atom.bonds = monomerBondAnglesDeg.map((deg) => bondToMonomer(atom, deg));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const rootElement = select(svg).append('g');
  const renderer = Object.create(AtomRenderer.prototype);
  Object.assign(renderer, { atom, rootElement });
  return renderer as RendererUnderTest;
}

function drawLabel(
  atom: FakeAtom,
  bondAnglesDeg: number[],
  monomerBondAnglesDeg: number[] = [],
) {
  const renderer = createRenderer(atom, bondAnglesDeg, monomerBondAnglesDeg);
  const text = renderer.appendLabel();
  renderer.textElement = text;
  return { renderer, textNode: text.node() as SVGTextElement };
}

function tspansOf(textNode: SVGTextElement) {
  return Array.from(textNode.querySelectorAll('tspan')).map((tspan) => ({
    text: tspan.textContent,
    x: tspan.getAttribute('x'),
    dy: Number(tspan.getAttribute('dy') ?? 0),
  }));
}

// The text baseline of each tspan relative to the symbol line (0 is the line
// of the atom symbol), the way SVG accumulates `dy`.
function baselines(spans: { dy: number }[]) {
  let total = 0;
  return spans.map(({ dy }) => (total += dy));
}

describe('AtomRenderer hydrogen side', () => {
  const sideOf = (
    atom: FakeAtom,
    anglesDeg: number[],
    monomerAnglesDeg: number[] = [],
  ) => createRenderer(atom, anglesDeg, monomerAnglesDeg).computeHydrogenSide();

  it('puts hydrogens right of a terminal atom bonded on its left', () => {
    expect(sideOf(fakeAtom(), [180])).toBe('right');
  });

  it('puts hydrogens left of a terminal atom bonded on its right', () => {
    expect(sideOf(fakeAtom(), [0])).toBe('left');
  });

  it('puts hydrogens right of an isolated atom', () => {
    expect(sideOf(fakeAtom({ label: AtomLabel.O }), [])).toBe('right');
  });

  it('puts hydrogens on top of an internal atom with bonds down-left and down-right', () => {
    expect(sideOf(fakeAtom(), [330, 210])).toBe('top');
  });

  it('puts hydrogens at the bottom of an internal atom with bonds right, up and left', () => {
    expect(sideOf(fakeAtom(), [0, 90, 180])).toBe('bottom');
  });

  it('counts a bond to a monomer like a bond to an atom', () => {
    // A bond on the left and a monomer on the right leave the top free. With
    // the monomer ignored the atom would look terminal and put H on the right,
    // on top of the monomer bond.
    expect(sideOf(fakeAtom(), [180], [0])).toBe('top');
  });

  it('puts hydrogens opposite the only bond when that bond goes to a monomer', () => {
    expect(sideOf(fakeAtom(), [], [0])).toBe('left');
  });

  it('keeps the top quadrant for the radical of an internal atom', () => {
    expect(sideOf(fakeAtom({ radical: 1 }), [330, 210])).toBe('bottom');
  });
});

describe('AtomRenderer.appendLabel hydrogen layout', () => {
  it('draws the symbol, then H, for a terminal atom bonded on its left', () => {
    const { textNode } = drawLabel(fakeAtom(), [180]);

    expect(tspansOf(textNode).map(({ text }) => text)).toEqual(['N', 'H']);
  });

  it('draws the symbol, then H and its count, for an isolated atom', () => {
    const { textNode } = drawLabel(
      fakeAtom({ label: AtomLabel.O, hydrogenAmount: 2 }),
      [],
    );

    expect(tspansOf(textNode).map(({ text }) => text)).toEqual(['O', 'H', '2']);
  });

  it('draws H on a line above the symbol for hydrogens on top', () => {
    const { textNode } = drawLabel(fakeAtom(), [330, 210]);
    const spans = tspansOf(textNode);
    const lines = baselines(spans);

    expect(spans.map(({ text }) => text)).toEqual(['H', 'N']);
    // H is above the symbol line, the symbol stays on it.
    expect(lines[0]).toBeLessThan(0);
    expect(lines[1]).toBe(0);
    // Both lines are centred on the atom.
    expect(spans[0].x).toBe('0');
    expect(spans[1].x).toBe('0');
    expect(textNode.getAttribute('text-anchor')).toBe('middle');
  });

  it('draws H on a line below the symbol for hydrogens at the bottom', () => {
    const { textNode } = drawLabel(fakeAtom(), [0, 90, 180]);
    const spans = tspansOf(textNode);
    const lines = baselines(spans);

    expect(spans.map(({ text }) => text)).toEqual(['H', 'N']);
    expect(lines[0]).toBeGreaterThan(0);
    expect(lines[1]).toBe(0);
  });

  it('keeps the hydrogen count on the H line, lower than H, and centred H', () => {
    const { textNode } = drawLabel(fakeAtom({ hydrogenAmount: 2 }), [330, 210]);
    const spans = tspansOf(textNode);
    const lines = baselines(spans);

    expect(spans.map(({ text }) => text)).toEqual(['H', '2', 'N']);
    expect(lines[1]).toBeGreaterThan(lines[0]);
    expect(lines[1]).toBeLessThan(0);
    expect(lines[2]).toBe(0);
    // H stays centred over the symbol, the count sits to its right.
    expect(spans[0].x).toBe('0');
    expect(Number(spans[1].x)).toBeGreaterThan(0);
    expect(spans[2].x).toBe('0');
  });

  it('draws no hydrogen line for an atom without implicit hydrogens', () => {
    const { textNode } = drawLabel(fakeAtom({ hydrogenAmount: 0 }), [330, 210]);

    expect(tspansOf(textNode).map(({ text }) => text)).toEqual(['N']);
  });

  it('puts the isotope on the symbol line, not on the H line', () => {
    const { renderer, textNode } = drawLabel(
      fakeAtom({ isotope: 15 }),
      [330, 210],
    );
    renderer.appendExplicitIsotope();
    const spans = tspansOf(textNode);
    const lines = baselines(spans);

    expect(spans.map(({ text }) => text)).toEqual(['H', '15', 'N']);
    // The isotope is a superscript of the symbol: above the symbol line,
    // below the H line, and centred with the symbol.
    expect(lines[1]).toBeLessThan(0);
    expect(lines[1]).toBeGreaterThan(lines[0]);
    expect(lines[2]).toBe(0);
    expect(spans[1].x).toBe('0');
    expect(spans[2].x).toBeNull();
  });
});

describe('AtomRenderer charge and valence with stacked hydrogens', () => {
  // Half the advance of one digit of the 13px Arial label: the least a text
  // that starts at the center of the count must be moved to clear it.
  const HALF_DIGIT = (0.556 * 13) / 2;

  function drawWithProperties(
    options: Parameters<typeof fakeAtom>[0],
    bondAnglesDeg: number[],
  ) {
    const { renderer, textNode } = drawLabel(fakeAtom(options), bondAnglesDeg);
    renderer.appendAtomProperties();
    return tspansOf(textNode);
  }

  it('starts the charge to the right of the count of top hydrogens', () => {
    const spans = drawWithProperties(
      { hydrogenAmount: 2, charge: 1 },
      [330, 210],
    );

    expect(spans.map(({ text }) => text)).toEqual(['H', '2', 'N', '+']);
    const [, count, , charge] = spans;
    expect(Number(charge.x)).toBeGreaterThanOrEqual(
      Number(count.x) + HALF_DIGIT,
    );
  });

  it('left-aligns the charge text at its start so it grows away from the count', () => {
    const { renderer, textNode } = drawLabel(
      fakeAtom({ hydrogenAmount: 2, charge: 1 }),
      [330, 210],
    );
    renderer.appendAtomProperties();
    const charge = textNode.querySelectorAll('tspan')[3];

    expect(charge.getAttribute('text-anchor')).toBe('start');
  });

  it('keeps the charge above the symbol line, as without hydrogens', () => {
    const spans = drawWithProperties(
      { hydrogenAmount: 2, charge: 1 },
      [330, 210],
    );
    const lines = baselines(spans);

    expect(lines[2]).toBe(0);
    expect(lines[3]).toBeLessThan(0);
  });

  it('starts the explicit valence right of the count when there is no charge', () => {
    const spans = drawWithProperties(
      { hydrogenAmount: 2, explicitValence: 2 },
      [330, 210],
    );

    expect(spans.map(({ text }) => text)).toEqual(['H', '2', 'N', '(II)']);
    const [, count, , valence] = spans;
    expect(Number(valence.x)).toBeGreaterThanOrEqual(
      Number(count.x) + HALF_DIGIT,
    );
  });

  it('draws the valence after the charge on the same run of text', () => {
    const spans = drawWithProperties(
      { hydrogenAmount: 2, charge: 1, explicitValence: 2 },
      [330, 210],
    );

    expect(spans.map(({ text }) => text)).toEqual(['H', '2', 'N', '+', '(II)']);
    const [, count, , charge, valence] = spans;
    expect(Number(charge.x)).toBeGreaterThanOrEqual(
      Number(count.x) + HALF_DIGIT,
    );
    expect(valence.x).toBeNull();
  });

  it('keeps the charge on the symbol run when H has no count', () => {
    const spans = drawWithProperties(
      { hydrogenAmount: 1, charge: 1 },
      [330, 210],
    );

    expect(spans.map(({ text }) => text)).toEqual(['H', 'N', '+']);
    expect(spans[2].x).toBeNull();
  });

  it('keeps the charge on the symbol run for hydrogens on the right', () => {
    const spans = drawWithProperties({ hydrogenAmount: 2, charge: 1 }, [180]);

    expect(spans.map(({ text }) => text)).toEqual(['N', 'H', '2', '+']);
    expect(spans[3].x).toBeNull();
  });
});

describe('AtomRenderer label contour with stacked hydrogens', () => {
  // A text box that holds an H line above the symbol, as SVG measures it.
  const stackedBox = { x: -5, y: -18, width: 10, height: 28 };

  function hoverContourOf(bondAnglesDeg: number[]) {
    const { renderer, textNode } = drawLabel(fakeAtom(), bondAnglesDeg);
    Object.defineProperty(textNode, 'getBBox', {
      value: () => stackedBox,
    });
    Object.defineProperty(renderer, 'center', {
      value: new Vec2(100, 200),
    });
    Object.defineProperty(renderer, 'isLabelVisible', { value: true });
    Object.defineProperty(renderer, 'labelLength', { value: 2 });
    return { contour: renderer.getHoverContour(), renderer };
  }

  it('wraps the H line above the symbol in the hover contour', () => {
    const { contour } = hoverContourOf([330, 210]);

    expect(contour).toMatchObject({
      type: 'rect',
      // top of the label box (-18) less the 4px padding, from the atom at y=200
      y: 200 - 18 - 4,
      height: 28 + 8,
    });
  });

  it('keeps a zero measured height for hydrogens on the right, as before', () => {
    const { renderer, textNode } = drawLabel(fakeAtom(), [180]);
    Object.defineProperty(textNode, 'getBBox', {
      value: () => ({ x: -5, y: -8, width: 10, height: 0 }),
    });
    Object.defineProperty(renderer, 'center', { value: new Vec2(100, 200) });
    Object.defineProperty(renderer, 'isLabelVisible', { value: true });
    Object.defineProperty(renderer, 'labelLength', { value: 2 });

    expect(renderer.getHoverContour()).toMatchObject({
      y: 200 - 4,
      height: 8,
    });
  });

  it('keeps the contour centred on the symbol for hydrogens on the right', () => {
    const { contour } = hoverContourOf([180]);

    expect(contour).toMatchObject({
      type: 'rect',
      y: 200 - (28 / 2 + 4),
      height: 28 + 8,
    });
  });
});

describe('AtomRenderer label layout stays what was drawn', () => {
  // Position and size of the text lines as SVG would measure them; jsdom has
  // no layout, so each element reports the box its text would have.
  const boxes: Record<
    string,
    { x: number; y: number; width: number; height: number }
  > = {
    H: { x: -4, y: -21, width: 9, height: 10 },
    '2': { x: 6, y: -18, width: 7, height: 10 },
    N: { x: -5, y: -8, width: 10, height: 10 },
    '+': { x: 6, y: -14, width: 7, height: 10 },
  };
  const textBox = (element: Element) => {
    const own = boxes[element.textContent ?? ''];
    if (own) return own;
    // The whole text element: the union of the lines drawn into it.
    const tspans = Array.from(element.querySelectorAll('tspan'));
    const top = Math.min(...tspans.map((t) => boxes[t.textContent ?? ''].y));
    return { x: -5, y: top, width: 18, height: 10 - top - 2 };
  };

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value(this: Element) {
        return textBox(this);
      },
    });
  });

  afterAll(() => {
    delete (SVGElement.prototype as { getBBox?: unknown }).getBBox;
  });

  function drawStacked(options: Parameters<typeof fakeAtom>[0] = {}) {
    const atom = fakeAtom({ hydrogenAmount: 2, ...options });
    const drawn = drawLabel(atom, [330, 210]);
    Object.defineProperty(drawn.renderer, 'center', {
      value: new Vec2(100, 200),
    });
    return { ...drawn, atom };
  }

  function topOf(boxList: { y: number }[]) {
    return Math.min(...boxList.map(({ y }) => y));
  }

  it('keeps the contour of the drawn label when a bond is deleted before the label is redrawn', () => {
    const { renderer, atom } = drawStacked();

    // The bond on the right is gone: the live side is now `right`.
    stubViewModel(atom, [210]);

    expect(renderer.getHoverContour()).toMatchObject({
      type: 'rect',
      y: 200 + topOf([boxes.H]) - 4,
    });
  });

  it('draws the bad valence line under the drawn label when a bond is deleted before the label is redrawn', () => {
    const { renderer, atom, textNode } = drawStacked({ hasBadValence: true });
    stubViewModel(atom, [210]);

    renderer.appendBadValenceWarning();
    const line = (textNode.parentNode as Element).querySelector('line');
    const textBottom = textBox(textNode).y + textBox(textNode).height;

    expect(Number(line?.getAttribute('y1'))).toBe(
      textBottom + BAD_VALENCE_LINE_OFFSET,
    );
  });

  it('redraws the label for the new side when the side changed', () => {
    const { renderer, atom } = drawStacked();
    stubViewModel(atom, [210]);

    expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(true);

    const spans = tspansOf(renderer.textElement.node() as SVGTextElement);
    expect(spans.map(({ text }) => text)).toEqual(['N', 'H', '2']);
  });

  it('does not redraw the label while the side is the same', () => {
    const { renderer, atom } = drawStacked();
    const drawnText = renderer.textElement.node();
    // A neighbour moved but the bonds still leave the top free.
    stubViewModel(atom, [320, 200]);

    expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(false);
    expect(renderer.textElement.node()).toBe(drawnText);
  });

  it('redraws the label when a monomer bond takes the side the hydrogens were on', () => {
    const atom = fakeAtom();
    const { renderer } = drawLabel(atom, [330, 210]);
    // The peptide on the atom now sits at the top.
    atom.bonds = [bondToMonomer(atom, 90)];

    expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(true);
  });

  describe('bonds are trimmed by the symbol, not by the hydrogens drawn elsewhere', () => {
    it('leaves the H line out of the boxes that trim bonds for hydrogens on top', () => {
      const { renderer } = drawStacked();

      // Nothing above the symbol box: a bond at 30 degrees stops at N.
      expect(topOf(renderer.bondTrimBBoxes)).toBeGreaterThanOrEqual(boxes.N.y);
    });

    it('leaves the H line out of the boxes that trim bonds for hydrogens at the bottom', () => {
      const atom = fakeAtom({ hydrogenAmount: 2 });
      const { renderer } = drawLabel(atom, [0, 90, 180]);
      const bottomOf = (boxList: { y: number; height: number }[]) =>
        Math.max(...boxList.map(({ y, height }) => y + height));

      expect(bottomOf(renderer.bondTrimBBoxes)).toBeLessThanOrEqual(
        boxes.N.y + boxes.N.height,
      );
    });

    it('trims by the charge too, since it sits next to the symbol', () => {
      const { renderer } = drawStacked({ charge: 1 });
      renderer.appendAtomProperties();

      expect(renderer.bondTrimBBoxes).toContainEqual(boxes['+']);
    });

    it('keeps the H line in the boxes the stereo label placement avoids', () => {
      const { renderer } = drawStacked();

      expect(topOf(renderer.labelBBoxes)).toBe(boxes.H.y);
    });

    it('keeps every box for hydrogens beside the symbol', () => {
      const { renderer } = drawLabel(fakeAtom({ hydrogenAmount: 2 }), [180]);

      expect(renderer.bondTrimBBoxes).toHaveLength(3);
      expect(renderer.bondTrimBBoxes).toEqual(renderer.labelBBoxes);
    });
  });
});
