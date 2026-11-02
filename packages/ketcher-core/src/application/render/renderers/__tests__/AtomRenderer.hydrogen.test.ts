import { select, type Selection } from 'd3';
import type { ImplicitHydrogenSide } from 'domain/helpers';
import { AtomRenderer } from '../AtomRenderer';
import { AtomLabel, type CoreAtomLabel } from 'domain/constants';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { Vec2 } from 'domain/entities/vec2';

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
  calculateValence: () => { hydrogenAmount: number };
}

function fakeAtom({
  label = AtomLabel.N,
  hydrogenAmount = 1,
  radical = 0,
  isotope,
  charge,
  explicitValence,
}: {
  label?: CoreAtomLabel;
  hydrogenAmount?: number;
  radical?: number;
  isotope?: number;
  charge?: number;
  explicitValence?: number;
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
    hasBadValence: false,
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

function stubViewModel(atom: FakeAtom, bondAnglesDeg: number[]) {
  (provideEditorInstance as jest.Mock).mockReturnValue({
    viewModel: {
      atomsToHalfEdges: new Map([[atom, bondAnglesDeg.map(degToModelDir)]]),
    },
  });
}

// The private members this test reaches, as the existing renderer tests do.
type RendererUnderTest = Pick<
  AtomRenderer,
  'getHoverContour' | 'labelBoundingBox'
> & {
  appendLabel: () => Selection<SVGTextElement, unknown, null, undefined>;
  appendExplicitIsotope: () => void;
  appendCharge: () => void;
  appendExplicitValence: () => void;
  textElement: Selection<SVGTextElement, unknown, null, undefined>;
  hydrogenSide: ImplicitHydrogenSide;
};

function createRenderer(atom: FakeAtom, bondAnglesDeg: number[]) {
  stubViewModel(atom, bondAnglesDeg);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const rootElement = select(svg).append('g');
  const renderer = Object.create(AtomRenderer.prototype);
  Object.assign(renderer, { atom, rootElement });
  return renderer as RendererUnderTest;
}

function drawLabel(atom: FakeAtom, bondAnglesDeg: number[]) {
  const renderer = createRenderer(atom, bondAnglesDeg);
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
  const sideOf = (atom: FakeAtom, anglesDeg: number[]) =>
    createRenderer(atom, anglesDeg).hydrogenSide;

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
    renderer.appendCharge();
    renderer.appendExplicitValence();
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
    renderer.appendCharge();
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

  it('reads the label box from the text that holds the stacked H', () => {
    const { renderer } = hoverContourOf([330, 210]);

    expect(renderer.labelBoundingBox).toEqual(stackedBox);
  });

  it('wraps the H line above the symbol in the hover contour', () => {
    const { contour } = hoverContourOf([330, 210]);

    expect(contour).toMatchObject({
      type: 'rect',
      // top of the label box (-18) less the 4px padding, from the atom at y=200
      y: 200 - 18 - 4,
      height: 28 + 8,
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
