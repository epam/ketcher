import {
  getImplicitHydrogenSide,
  ImplicitHydrogenSide,
  isLabelAnchoredLeft,
  isStackedSide,
} from '../implicitHydrogenSide';

// The tables state bonds as visual angles, 0 = right and 90 = up, as the
// scenarios of openspec/specs/atom-editing/spec.md do. The helper takes model
// directions, where y points down, so each angle goes through direction().
type Row = [string, number[], boolean, ImplicitHydrogenSide];

function direction(visualAngleDeg: number) {
  const radians = (visualAngleDeg * Math.PI) / 180;
  return { x: Math.cos(radians), y: -Math.sin(radians) };
}

function sideFor(angles: number[], hasRadical: boolean) {
  return getImplicitHydrogenSide(angles.map(direction), hasRadical);
}

describe('getImplicitHydrogenSide', () => {
  describe('terminal atom', () => {
    const rows: Row[] = [
      ['no bond', [], false, 'right'],
      ['bond up-right at 30 degrees', [30], false, 'left'],
      ['bond down-left at 210 degrees', [210], false, 'right'],
      ['bond exactly right', [0], false, 'left'],
      ['bond exactly left', [180], false, 'right'],
      ['bond exactly up', [90], false, 'right'],
      ['bond exactly down', [270], false, 'right'],
      ['bond 0.4 degrees right of up', [89.6], false, 'right'],
      ['bond 0.4 degrees left of up', [90.4], false, 'right'],
      ['bond 0.5 degrees right of up', [89.5], false, 'right'],
      ['bond 0.4 degrees left of down', [269.6], false, 'right'],
      ['bond 0.4 degrees right of down', [270.4], false, 'right'],
      ['bond 1 degree right of up', [89], false, 'left'],
      ['bond 1 degree right of down', [271], false, 'left'],
      ['bond 1 degree left of up', [91], false, 'right'],
      ['bond given as negative angle to the right', [-30], false, 'left'],
      ['bond given as angle above 360 to the right', [390], false, 'left'],
      ['one bond with a radical', [30], true, 'left'],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(sideFor(angles, hasRadical)).toBe(expected);
    });
  });

  describe('internal atom', () => {
    const rows: Row[] = [
      ['two bonds pointing down (210, 330) go top', [210, 330], false, 'top'],
      ['bonds in top and bottom quadrants go right', [90, 270], false, 'right'],
      [
        'right and left bonds with a radical go bottom',
        [0, 180],
        true,
        'bottom',
      ],
      [
        'all four quadrants occupied go right',
        [0, 90, 180, 270],
        false,
        'right',
      ],
      ['no bond with a radical', [], true, 'right'],
      ['three bonds leave top free', [30, 150, 270], false, 'top'],
      [
        'six bonds leave no free quadrant',
        [0, 60, 120, 180, 240, 300],
        false,
        'right',
      ],
      [
        'left is preferred over top when right is taken',
        [10, 80],
        false,
        'left',
      ],
      ['top is preferred over bottom', [0, 180, 270], false, 'top'],
      ['radical with right, left and top bonds', [0, 180, 90], true, 'bottom'],
      [
        'radical with right, left and bottom bonds',
        [0, 180, 270],
        true,
        'right',
      ],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(sideFor(angles, hasRadical)).toBe(expected);
    });
  });

  describe('top and bottom both free: hydrogens go away from the bonds', () => {
    const rows: Row[] = [
      ['peak, both bonds down (210, 330), go top', [210, 330], false, 'top'],
      [
        'valley, both bonds up (30, 150), go bottom',
        [30, 150],
        false,
        'bottom',
      ],
      ['bonds at 20 and 160 go bottom', [20, 160], false, 'bottom'],
      ['level bonds (0, 180) go top', [0, 180], false, 'top'],
      [
        'one bond up, one down, in balance (330, 150) go top',
        [330, 150],
        false,
        'top',
      ],
      [
        'bonds pointing down on balance (350, 190) go top',
        [350, 190],
        false,
        'top',
      ],
      [
        'bonds pointing up on balance (20, 190) go bottom',
        [20, 190],
        false,
        'bottom',
      ],
      [
        'three bonds pointing up on balance (10, 170, 190) go bottom',
        [10, 170, 190],
        false,
        'bottom',
      ],
      [
        'three bonds pointing down on balance (350, 170, 190) go top',
        [350, 170, 190],
        false,
        'top',
      ],
      [
        'a radical with bonds 30 and 150 goes bottom',
        [30, 150],
        true,
        'bottom',
      ],
      [
        'a radical with bonds 210 and 330 goes bottom',
        [210, 330],
        true,
        'bottom',
      ],
      // sin(179) is 0.0175, above the 0.01 tolerance; sin(179.5) is 0.0087, within it
      [
        'balance above the tolerance (0, 179) goes bottom',
        [0, 179],
        false,
        'bottom',
      ],
      [
        'balance within the tolerance (0, 179.5) goes top',
        [0, 179.5],
        false,
        'top',
      ],
      [
        'balance within the tolerance (0, 180.5) goes top',
        [0, 180.5],
        false,
        'top',
      ],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(sideFor(angles, hasRadical)).toBe(expected);
    });

    it.each(rows)(
      '%s, with bond directions of length 5',
      (_name, angles, hasRadical, expected) => {
        const scaled = angles
          .map(direction)
          .map(({ x, y }) => ({ x: x * 5, y: y * 5 }));

        expect(getImplicitHydrogenSide(scaled, hasRadical)).toBe(expected);
      },
    );

    it('counts each bond once, whatever its length', () => {
      // Unit directions at 30 and 210 balance to zero: top. A long bond up
      // and a short bond down would tip the sum of raw vectors to bottom.
      const long = {
        x: 10 * Math.cos(Math.PI / 6),
        y: -10 * Math.sin(Math.PI / 6),
      };
      const short = {
        x: 0.1 * Math.cos((Math.PI * 7) / 6),
        y: -0.1 * Math.sin((Math.PI * 7) / 6),
      };

      expect(getImplicitHydrogenSide([long, short], false)).toBe('top');
    });
  });

  describe('quadrant boundaries belong to the quadrant that starts there', () => {
    const rows: Row[] = [
      // 45 is top, so right is free
      ['45 is top, not right', [45, 180], false, 'right'],
      // 135 is left, so right is taken by the 0 bond and top and bottom are
      // free; the 135 bond points up, so the hydrogens go bottom (were it top,
      // left would be free and win)
      ['135 is left, not top', [135, 0], false, 'bottom'],
      // 225 is bottom, so left is free
      ['225 is bottom, not left', [225, 0], false, 'left'],
      // 315 is right, so top is free
      ['315 is right, not bottom', [315, 180], false, 'top'],
      ['just below 315 is bottom', [314.99, 180], false, 'right'],
      ['rounded to 315 is right', [314.996, 180], false, 'top'],
      ['-45 normalises to 315', [-45, 180], false, 'top'],
      ['405 normalises to 45', [405, 180], false, 'right'],
      ['360 normalises to 0', [360, 180], false, 'top'],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(sideFor(angles, hasRadical)).toBe(expected);
    });
  });
});

describe('model directions', () => {
  it('reads y as pointing down: an up bond is { x: 0, y: -1 }', () => {
    const right = { x: 1, y: 0 };
    const up = { x: 0, y: -1 };
    const left = { x: -1, y: 0 };

    // Right, up and left bonds leave only the bottom quadrant free. A y-up
    // reading of the same vectors would put the up bond at the bottom and
    // return top.
    expect(getImplicitHydrogenSide([right, up, left], false)).toBe('bottom');
  });

  it('puts hydrogens opposite a bond that points up and right', () => {
    expect(getImplicitHydrogenSide([{ x: 1, y: -1 }], false)).toBe('left');
    expect(getImplicitHydrogenSide([{ x: -1, y: 1 }], false)).toBe('right');
  });

  it('does not depend on the length of a direction', () => {
    expect(getImplicitHydrogenSide([{ x: -30, y: 0 }], false)).toBe('right');
    expect(getImplicitHydrogenSide([{ x: 0.001, y: 0 }], false)).toBe('left');
  });
});

describe('isStackedSide', () => {
  it.each<[ImplicitHydrogenSide, boolean]>([
    ['top', true],
    ['bottom', true],
    ['left', false],
    ['right', false],
  ])('%s gives %s', (side, expected) => {
    expect(isStackedSide(side)).toBe(expected);
  });
});

describe('isLabelAnchoredLeft', () => {
  // Label alignment is anchored left for an atom with one visible bond that
  // points right (hydrogens on the left), and for a bondless atom whose element
  // is flagged leftH (O, F, S, Cl, Se, Br, I) or has no element (atom lists,
  // R#, pseudoatoms, generic atoms). A bondless D or T, a carbon, a nitrogen
  // and an atom with two or more bonds are not.
  it.each<[string, number, ImplicitHydrogenSide, boolean]>([
    ['D', 0, 'right', false],
    ['T', 0, 'right', false],
    ['C', 0, 'right', false],
    ['N', 0, 'right', false],
    ['O', 0, 'right', true],
    ['F', 0, 'right', true],
    ['S', 0, 'right', true],
    ['Cl', 0, 'right', true],
    ['Se', 0, 'right', true],
    ['Br', 0, 'right', true],
    ['I', 0, 'right', true],
    ['L#', 0, 'right', true],
    ['R#', 0, 'right', true],
    ['A', 0, 'right', true],
    ['Q', 0, 'right', true],
    ['L', 0, 'right', true],
    ['N', 1, 'left', true],
    ['O', 1, 'left', true],
    ['N', 1, 'right', false],
    ['Cl', 1, 'right', false],
    ['L#', 1, 'right', false],
    ['N', 2, 'left', false],
    ['Cl', 2, 'right', false],
    ['L#', 2, 'top', false],
    ['O', 4, 'bottom', false],
  ])(
    'for label %s with %i visible bonds and side %s is %s',
    (label, visibleBondCount, side, expected) => {
      expect(isLabelAnchoredLeft({ side, visibleBondCount, label })).toBe(
        expected,
      );
    },
  );

  it('is false for an internal atom whose free quadrant on the left was picked', () => {
    // A bond right and one up leave the left free, so the side is left, but
    // label alignment looks at the bond count: an internal atom is not
    // anchored left.
    const side = sideFor([0, 90], false);

    expect(side).toBe('left');
    expect(isLabelAnchoredLeft({ side, visibleBondCount: 2, label: 'N' })).toBe(
      false,
    );
  });
});
