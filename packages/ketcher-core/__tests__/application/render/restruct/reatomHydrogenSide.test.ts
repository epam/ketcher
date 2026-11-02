import ReAtom from 'application/render/restruct/reatom';
import ReStruct from 'application/render/restruct/restruct';
import { ShowHydrogenLabels } from 'application/render/restruct/showHydrogenLabels';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import type { Box2Abs } from 'domain/entities/box2Abs';
import type { AtomListParams } from 'domain/entities/atomList';
import type { ImplicitHydrogenSide } from 'domain/helpers';

// A real Raphael paper needs SVG geometry that jsdom does not implement, so
// the paper is a fake whose shapes have deterministic boxes: every text is
// as high as its font size and 0.6 of it wide per character, centered on the
// point it was created at, and moves with translateAbs like a Raphael element.
const FONT_PX = 13;
const SUB_FONT_PX = 10;
const CHAR_WIDTH_RATIO = 0.6;
const LINE_WIDTH = 1;
const BOND_LENGTH = 40;

interface FakeShape {
  attr: (values?: Record<string, unknown>) => FakeShape;
  push: () => void;
  getBBox: () => { x: number; y: number; width: number; height: number };
  translateAbs: (dx: number, dy: number) => void;
  insertBefore: () => void;
  node: SVGElement;
}

type Size = () => { width: number; height: number };

function createShape(cx: number, cy: number, size: Size) {
  const center = { x: cx, y: cy };
  const shape: FakeShape = {
    attr: () => shape,
    push: () => undefined,
    getBBox: () => {
      const { width, height } = size();
      return {
        x: center.x - width / 2,
        y: center.y - height / 2,
        width,
        height,
      };
    },
    translateAbs: (dx, dy) => {
      center.x += dx;
      center.y += dy;
    },
    insertBefore: () => undefined,
    node: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
  };
  return shape;
}

function createPaper() {
  const small: Size = () => ({ width: 2 * LINE_WIDTH, height: 2 * LINE_WIDTH });
  const texts: Array<{ x: number; y: number; text: string }> = [];
  return {
    texts,
    text: (x: number, y: number, text: string) => {
      texts.push({ x, y, text });
      let fontSize = FONT_PX;
      const shape = createShape(x, y, () => ({
        width: fontSize * CHAR_WIDTH_RATIO * text.length,
        height: fontSize,
      }));
      const { attr } = shape;
      shape.attr = (values) => {
        if (typeof values?.['font-size'] === 'number') {
          fontSize = values['font-size'];
        }
        return attr(values);
      };
      return shape;
    },
    set: () => createShape(0, 0, small),
    circle: (x: number, y: number) => createShape(x, y, small),
    path: () => createShape(0, 0, small),
    rect: jest.fn(),
  };
}

const options = {
  microModeScale: BOND_LENGTH,
  zoom: 1,
  lineWidth: LINE_WIDTH,
  font: '13px Arial',
  fontszInPx: FONT_PX,
  fontszsubInPx: SUB_FONT_PX,
  radiusScaleFactor: 0.2,
  showHydrogenLabels: ShowHydrogenLabels.On,
  showCharge: true,
  showValence: true,
  showAtomIds: false,
  offset: null,
} as unknown as RenderOptions;

interface AtomFixture {
  reatom: ReAtom;
  paper: ReturnType<typeof createPaper>;
  render: object;
  /** The symbol box, the first box of the atom's visel. */
  symbolBox: () => Box2Abs;
}

/**
 * An atom (N by default) at the origin with a bond to a neighbor at each given visual angle
 * (degrees, 0 is right, 90 is up), drawn through ReAtom.show.
 */
function showAtom({
  label = 'N',
  bondAnglesDeg = [],
  implicitH = 1,
  radical = 0,
  charge = 0,
  explicitValence = -1,
  aam = 0,
  atomList,
  showAtomIds = false,
}: {
  label?: string;
  bondAnglesDeg?: number[];
  implicitH?: number;
  radical?: number;
  charge?: number;
  explicitValence?: number;
  aam?: number;
  atomList?: AtomListParams;
  showAtomIds?: boolean;
}): AtomFixture {
  const struct = new Struct();
  const atom = new Atom({
    label,
    pp: new Vec2(0, 0),
    radical,
    charge,
    explicitValence,
    aam,
    atomList,
  });
  atom.implicitH = implicitH;
  const aid = struct.atoms.add(atom);
  bondAnglesDeg.forEach((angleDeg) => {
    const radians = (angleDeg * Math.PI) / 180;
    const neighborId = struct.atoms.add(
      new Atom({
        label: 'C',
        pp: new Vec2(Math.cos(radians), -Math.sin(radians)),
      }),
    );
    struct.bonds.add(
      new Bond({ begin: aid, end: neighborId, type: Bond.PATTERN.TYPE.SINGLE }),
    );
  });
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.updateHalfBonds([...struct.atoms.keys()]);
  struct.sortNeighbors([...struct.atoms.keys()]);

  const paper = createPaper();
  const atomOptions = { ...options, showAtomIds } as RenderOptions;
  const render = { paper, options: atomOptions };
  const layers = new Proxy({}, { get: () => ({ node: { parentNode: {} } }) });
  const restructContext = { layers, render };
  const restruct = {
    molecule: struct,
    render,
    addReObjectPath: (...args: Parameters<ReStruct['addReObjectPath']>) =>
      ReStruct.prototype.addReObjectPath.apply(restructContext, args),
  } as unknown as ReStruct;

  const reatom = new ReAtom(atom);
  jest.spyOn(reatom, 'setHover').mockImplementation(() => undefined);
  reatom.show(restruct, aid, atomOptions);

  return {
    reatom,
    paper,
    render: { paper, options: atomOptions, ctab: { render } },
    symbolBox: () => reatom.visel.boxes[0],
  };
}

function boxCenter(box: Box2Abs) {
  return { x: (box.p0.x + box.p1.x) / 2, y: (box.p0.y + box.p1.y) / 2 };
}

describe('ReAtom hydrogenSide', () => {
  it.each<{
    name: string;
    label?: string;
    bondAnglesDeg: number[];
    radical?: number;
    expected: ImplicitHydrogenSide;
  }>([
    { name: 'no bond', bondAnglesDeg: [], expected: 'right' },
    { name: 'no bond on O', label: 'O', bondAnglesDeg: [], expected: 'right' },
    {
      name: 'no bond on Cl',
      label: 'Cl',
      bondAnglesDeg: [],
      expected: 'right',
    },
    { name: 'no bond on D', label: 'D', bondAnglesDeg: [], expected: 'right' },
    { name: 'no bond on T', label: 'T', bondAnglesDeg: [], expected: 'right' },
    { name: 'one bond going right', bondAnglesDeg: [30], expected: 'left' },
    { name: 'one bond going left', bondAnglesDeg: [210], expected: 'right' },
    { name: 'one bond going up', bondAnglesDeg: [90], expected: 'right' },
    { name: 'one bond going down', bondAnglesDeg: [270], expected: 'right' },
    {
      name: 'two bonds going down',
      bondAnglesDeg: [210, 330],
      expected: 'top',
    },
    {
      name: 'bonds in the top and bottom quadrants',
      bondAnglesDeg: [90, 270],
      expected: 'right',
    },
    {
      name: 'bonds on the left and right and a radical',
      bondAnglesDeg: [0, 180],
      radical: 2,
      expected: 'bottom',
    },
    {
      name: 'a bond on every quadrant',
      bondAnglesDeg: [0, 90, 180, 270],
      expected: 'right',
    },
  ])(
    'is $expected for $name',
    ({ label, bondAnglesDeg, radical, expected }) => {
      const { reatom } = showAtom({ label, bondAnglesDeg, radical });

      expect(reatom.hydrogenSide).toBe(expected);
    },
  );
});

describe('ReAtom hydrogen layout', () => {
  it('draws hydrogens left of the symbol for a bond going right', () => {
    const { reatom, symbolBox } = showAtom({ bondAnglesDeg: [30] });
    const hydrogenBox = reatom.visel.boxes[1];

    expect(boxCenter(hydrogenBox).x).toBeLessThan(symbolBox().p0.x);
    expect(boxCenter(hydrogenBox).y).toBeCloseTo(boxCenter(symbolBox()).y);
  });

  it('draws hydrogens right of the symbol for a bond going left', () => {
    const { reatom, symbolBox } = showAtom({ bondAnglesDeg: [210] });
    const hydrogenBox = reatom.visel.boxes[1];

    expect(boxCenter(hydrogenBox).x).toBeGreaterThan(symbolBox().p1.x);
    expect(boxCenter(hydrogenBox).y).toBeCloseTo(boxCenter(symbolBox()).y);
  });

  it('stacks hydrogens above the symbol, centered on it, for top', () => {
    const { reatom, symbolBox } = showAtom({ bondAnglesDeg: [210, 330] });
    const hydrogenBox = reatom.visel.boxes[1];

    // Canvas y grows downward, so "above" is a smaller y.
    expect(hydrogenBox.p1.y).toBeLessThanOrEqual(symbolBox().p0.y);
    expect(boxCenter(hydrogenBox).x).toBeCloseTo(boxCenter(symbolBox()).x);
    expect(boxCenter(symbolBox()).y - boxCenter(hydrogenBox).y).toBeCloseTo(
      FONT_PX,
    );
  });

  it('stacks hydrogens below the symbol, centered on it, for bottom', () => {
    const { reatom, symbolBox } = showAtom({
      bondAnglesDeg: [0, 180],
      radical: 2,
    });
    // The radical is drawn before the hydrogens: symbol, radical, H.
    const [, radicalBox, hydrogenBox] = reatom.visel.boxes;

    expect(radicalBox.p1.y).toBeLessThanOrEqual(symbolBox().p0.y);
    expect(hydrogenBox.p0.y).toBeGreaterThanOrEqual(symbolBox().p1.y);
    expect(boxCenter(hydrogenBox).x).toBeCloseTo(boxCenter(symbolBox()).x);
  });

  it('puts the count of top hydrogens as a subscript right of H', () => {
    const { reatom } = showAtom({ bondAnglesDeg: [210, 330], implicitH: 2 });
    const [, hydrogenBox, countBox] = reatom.visel.boxes;

    expect(countBox.p0.x).toBeGreaterThanOrEqual(hydrogenBox.p1.x - 1e-9);
    // A subscript sits lower than the middle of H.
    expect(boxCenter(countBox).y).toBeGreaterThan(boxCenter(hydrogenBox).y);
  });

  it('records right hydrogens in the visel exts and boxes', () => {
    const { reatom } = showAtom({ bondAnglesDeg: [210], implicitH: 2 });

    // symbol, H, count
    expect(reatom.visel.boxes).toHaveLength(3);
    expect(reatom.visel.exts).toHaveLength(3);
  });

  it('records stacked hydrogens in the visel boxes and exts', () => {
    const { reatom } = showAtom({ bondAnglesDeg: [210, 330], implicitH: 2 });

    // symbol, H, count: the exts are what label placement clears
    expect(reatom.visel.boxes).toHaveLength(3);
    expect(reatom.visel.exts).toHaveLength(3);
  });

  it('places the atom-mapping number clear of top hydrogens', () => {
    // The free sector of this atom points up, where the H line is drawn.
    const { reatom } = showAtom({
      bondAnglesDeg: [210, 330],
      implicitH: 2,
      aam: 5,
    });
    const hydrogenBox = reatom.visel.boxes[1];
    const aamBox = reatom.visel.boxes[reatom.visel.boxes.length - 1];

    expect(aamBox.p1.y).toBeLessThanOrEqual(hydrogenBox.p0.y);
  });

  it('covers the symbol and top hydrogens with the selection contour', () => {
    const { reatom, render, paper } = showAtom({ bondAnglesDeg: [210, 330] });
    const padding = FONT_PX * 0.2;

    reatom.getSelectionContour(render as never);

    const [, y, , height] = paper.rect.mock.calls[0];
    // The symbol and H are stacked, each FONT_PX high.
    expect(height).toBeCloseTo(2 * FONT_PX + 2 * padding);
    expect(y).toBeCloseTo(-1.5 * FONT_PX - padding);
  });

  it('covers the stacked hydrogens and their count with the selection contour', () => {
    const { reatom, render, paper } = showAtom({
      bondAnglesDeg: [210, 330],
      implicitH: 2,
    });
    const padding = FONT_PX * 0.2;

    reatom.getSelectionContour(render as never);

    const [, y, , height] = paper.rect.mock.calls[0];
    expect(height).toBeCloseTo(2 * FONT_PX + 2 * padding);
    expect(y).toBeCloseTo(-1.5 * FONT_PX - padding);
  });

  it('keeps the selection contour of left or right hydrogens one line high', () => {
    const { reatom, render, paper } = showAtom({ bondAnglesDeg: [210] });
    const padding = FONT_PX * 0.2;

    reatom.getSelectionContour(render as never);

    const [, , , height] = paper.rect.mock.calls[0];
    expect(height).toBeCloseTo(FONT_PX + 2 * padding);
  });
});

describe('ReAtom charge and valence next to stacked hydrogens', () => {
  const TOP = [210, 330];

  it('draws the charge right of the count of top hydrogens', () => {
    const { reatom } = showAtom({
      bondAnglesDeg: TOP,
      implicitH: 2,
      charge: 1,
    });
    // symbol, H, count, charge
    const [, , countBox, chargeBox] = reatom.visel.boxes;

    expect(chargeBox.p0.x).toBeGreaterThanOrEqual(countBox.p1.x);
  });

  it('draws the charge right of the count of bottom hydrogens', () => {
    const { reatom } = showAtom({
      bondAnglesDeg: [0, 180],
      radical: 2,
      implicitH: 2,
      charge: 1,
    });
    // symbol, radical, H, count, charge
    const [, , , countBox, chargeBox] = reatom.visel.boxes;

    expect(reatom.hydrogenSide).toBe('bottom');
    expect(chargeBox.p0.x).toBeGreaterThanOrEqual(countBox.p1.x);
  });

  it('draws the explicit valence right of the count when there is no charge', () => {
    const { reatom } = showAtom({
      bondAnglesDeg: TOP,
      implicitH: 2,
      explicitValence: 2,
    });
    const [, , countBox, valenceBox] = reatom.visel.boxes;

    expect(valenceBox.p0.x).toBeGreaterThanOrEqual(countBox.p1.x);
  });

  it('draws the valence right of the charge, which is right of the count', () => {
    const { reatom } = showAtom({
      bondAnglesDeg: TOP,
      implicitH: 2,
      charge: 1,
      explicitValence: 2,
    });
    const [, , countBox, chargeBox, valenceBox] = reatom.visel.boxes;

    expect(chargeBox.p0.x).toBeGreaterThanOrEqual(countBox.p1.x);
    expect(valenceBox.p0.x).toBeGreaterThanOrEqual(chargeBox.p1.x);
  });

  it('keeps the charge where it is without hydrogens when H has no count', () => {
    const oneHydrogen = showAtom({
      bondAnglesDeg: TOP,
      implicitH: 1,
      charge: 1,
    });
    const noHydrogen = showAtom({
      bondAnglesDeg: TOP,
      implicitH: 0,
      charge: 1,
    });
    // symbol, H, charge versus symbol, charge
    const stackedCharge = oneHydrogen.reatom.visel.boxes[2];
    const plainCharge = noHydrogen.reatom.visel.boxes[1];

    expect(boxCenter(stackedCharge).x).toBeCloseTo(boxCenter(plainCharge).x);
    expect(boxCenter(stackedCharge).y).toBeCloseTo(boxCenter(plainCharge).y);
  });

  it('keeps the charge of right hydrogens after their count', () => {
    const { reatom } = showAtom({
      bondAnglesDeg: [210],
      implicitH: 2,
      charge: 1,
    });
    const [, , countBox, chargeBox] = reatom.visel.boxes;

    expect(chargeBox.p0.x).toBeGreaterThanOrEqual(countBox.p1.x);
  });
});

describe('ReAtom bond trimming with hydrogens', () => {
  const canvasDirection = (angleDeg: number) => {
    const radians = (angleDeg * Math.PI) / 180;
    return new Vec2(Math.cos(radians), -Math.sin(radians));
  };

  it('does not shorten a bond because of hydrogens on top', () => {
    const bondAnglesDeg = [210, 330];
    const withHydrogens = showAtom({ bondAnglesDeg, implicitH: 2 });
    const withoutHydrogens = showAtom({ bondAnglesDeg, implicitH: 0 });

    bondAnglesDeg.forEach((angleDeg) => {
      const direction = canvasDirection(angleDeg);
      const shifted = withHydrogens.reatom.getShiftedSegmentPosition(
        options,
        direction,
      );
      const reference = withoutHydrogens.reatom.getShiftedSegmentPosition(
        options,
        direction,
      );
      expect(shifted.x).toBeCloseTo(reference.x);
      expect(shifted.y).toBeCloseTo(reference.y);
    });
  });

  it.each([41, 44])(
    'does not shorten a bond at %s degrees because of the count of top hydrogens',
    (angleDeg) => {
      // An atom with bonds at this angle and at 180 degrees has its hydrogens
      // on top; the bond passes through the box of the count but not the symbol.
      const bondAnglesDeg = [angleDeg, 180];
      const withHydrogens = showAtom({ bondAnglesDeg, implicitH: 2 });
      const withoutHydrogens = showAtom({ bondAnglesDeg, implicitH: 0 });
      const direction = canvasDirection(angleDeg);

      const shifted = withHydrogens.reatom.getShiftedSegmentPosition(
        options,
        direction,
      );
      const reference = withoutHydrogens.reatom.getShiftedSegmentPosition(
        options,
        direction,
      );

      expect(withHydrogens.reatom.hydrogenSide).toBe('top');
      expect(shifted.x).toBeCloseTo(reference.x);
      expect(shifted.y).toBeCloseTo(reference.y);
    },
  );

  it('does not shorten a bond that points away from hydrogens on the right', () => {
    const withHydrogens = showAtom({ bondAnglesDeg: [210], implicitH: 2 });
    const withoutHydrogens = showAtom({ bondAnglesDeg: [210], implicitH: 0 });
    const direction = canvasDirection(210);

    const shifted = withHydrogens.reatom.getShiftedSegmentPosition(
      options,
      direction,
    );
    const reference = withoutHydrogens.reatom.getShiftedSegmentPosition(
      options,
      direction,
    );

    expect(shifted.x).toBeCloseTo(reference.x);
    expect(shifted.y).toBeCloseTo(reference.y);
  });

  it('shortens a bond that runs into hydrogens on the left', () => {
    const withHydrogens = showAtom({ bondAnglesDeg: [30], implicitH: 2 });
    const withoutHydrogens = showAtom({ bondAnglesDeg: [30], implicitH: 0 });
    const direction = canvasDirection(180);

    const shifted = withHydrogens.reatom.getShiftedSegmentPosition(
      options,
      direction,
    );
    const reference = withoutHydrogens.reatom.getShiftedSegmentPosition(
      options,
      direction,
    );

    expect(withHydrogens.reatom.hydrogenSide).toBe('left');
    expect(shifted.x).toBeLessThan(reference.x);
  });

  it('shortens a bond that runs into hydrogens on the right', () => {
    const withHydrogens = showAtom({ bondAnglesDeg: [210], implicitH: 2 });
    const withoutHydrogens = showAtom({ bondAnglesDeg: [210], implicitH: 0 });
    const direction = canvasDirection(0);

    const shifted = withHydrogens.reatom.getShiftedSegmentPosition(
      options,
      direction,
    );
    const reference = withoutHydrogens.reatom.getShiftedSegmentPosition(
      options,
      direction,
    );

    expect(shifted.x).toBeGreaterThan(reference.x);
  });
});

// The atom-list label and the atom id are aligned left for an atom with one
// bond going right, and for a bondless atom that is not D, T or a carbon-like
// element (see isLabelAnchoredLeft). A free left quadrant of an internal atom
// moves hydrogens only, so they stay on the right branch.
describe('ReAtom label alignment next to a free left quadrant', () => {
  const ATOM_LIST: AtomListParams = { notList: false, ids: [6, 7] };

  // The fake paper creates a text centered on the atom, so the label's center
  // is its shift.
  const labelShift = (bondAnglesDeg: number[]) => {
    const { reatom } = showAtom({
      label: 'L',
      bondAnglesDeg,
      atomList: ATOM_LIST,
    });
    const box = reatom.label?.path.getBBox();
    return box ? box.x + box.width / 2 : NaN;
  };

  // The id of the atom at the origin is '0'; the label is drawn at the same y
  // minus the shift of a label, so only x tells the sides apart.
  const idX = (bondAnglesDeg: number[], label?: string) => {
    const { paper } = showAtom({ label, bondAnglesDeg, showAtomIds: true });
    return paper.texts.find(({ text }) => text === '0')?.x ?? NaN;
  };

  it('shifts the atom-list label of an atom with two bonds to the right', () => {
    // A bond right and one up leave the left quadrant free.
    expect(showAtom({ bondAnglesDeg: [0, 90] }).reatom.hydrogenSide).toBe(
      'left',
    );
    expect(labelShift([0, 90])).toBeGreaterThan(0);
  });

  it('shifts the atom-list label of an atom with one bond going right to the left', () => {
    expect(labelShift([0])).toBeLessThan(0);
  });

  it('shifts the atom-list label of an atom with one bond going left to the right', () => {
    expect(labelShift([180])).toBeGreaterThan(0);
  });

  it('shifts the atom-list label by the same amount for both branches', () => {
    expect(labelShift([0, 90])).toBeCloseTo(-labelShift([0]));
  });

  it('puts the atom id of an atom with two bonds right of the atom', () => {
    expect(idX([0, 90])).toBeGreaterThan(0);
  });

  it('puts the atom id of an atom with one bond going right left of the atom', () => {
    expect(idX([0])).toBeLessThan(0);
  });

  it('puts the atom id of an atom with one bond going left right of the atom', () => {
    expect(idX([180])).toBeGreaterThan(0);
  });

  it('shifts the atom-list label of a bondless atom to the left', () => {
    expect(labelShift([])).toBeLessThan(0);
  });

  it('shifts a bondless atom-list label as far as one with a bond going right', () => {
    expect(labelShift([])).toBeCloseTo(labelShift([0]));
  });

  it.each(['Cl', 'O', 'L#'])(
    'puts the atom id of a bondless %s left of the atom',
    (label) => {
      expect(idX([], label)).toBeLessThan(0);
    },
  );

  it.each(['C', 'N', 'D', 'T'])(
    'puts the atom id of a bondless %s right of the atom',
    (label) => {
      expect(idX([], label)).toBeGreaterThan(0);
    },
  );

  it('keeps hydrogens of a bondless O on the right while its id is on the left', () => {
    const { reatom } = showAtom({
      label: 'O',
      implicitH: 2,
      showAtomIds: true,
    });

    expect(reatom.hydrogenSide).toBe('right');
    expect(reatom.labelAnchoredLeft).toBe(true);
  });
});
