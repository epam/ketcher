import { AtomRenderer } from '../AtomRenderer';
import { MonomerToAtomBondRenderer } from '../MonomerToAtomBondRenderer';
import { AtomLabel } from 'domain/constants';
import { Vec2 } from 'domain/entities/vec2';
import type { AtomProperties } from 'domain/entities/CoreAtom';
import {
  at,
  connect,
  createAtom,
  createCanvas,
  createMonomer,
  installEditorStub,
  mockTextBoxes,
} from './atomRendererHarness';

// The singleton needs a live canvas; the renderers only read its view model.
jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));
jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: {
    getKetcher: () => ({ settingsService: undefined }),
  },
}));

// The boxes of the 13px label as SVG measures them: the symbol on the atom
// line, H on the line above it and the count of H right of H and lower, so a
// ray at 30 degrees from the atom crosses the count.
const BOXES = {
  H: { x: -4.5, y: -17.3, width: 9, height: 9.3 },
  '2': { x: 6.5, y: -14.3, width: 7, height: 9.3 },
  Si: { x: -8, y: -4.3, width: 16, height: 9.3 },
};
const SYMBOL_RIGHT_EDGE = 8;
const COUNT_RIGHT_EDGE = 13.5;
// The line stops this far outside the box (MonomerToAtomBondRenderer).
const GAP = 6;

// Si bonded to an atom at `otherDeg` and to a monomer at `monomerDeg`.
// Returns where the line to the monomer ends, as a distance from the atom.
function endOfBondToMonomer(
  monomerDeg: number,
  otherDeg: number,
  properties: AtomProperties = {},
) {
  createCanvas();
  const si = createAtom(new Vec2(0, 0), properties, AtomLabel.Si);
  connect(si, createAtom(at(otherDeg)));
  const { monomer, bondTo } = createMonomer(at(monomerDeg, 3));
  const bond = bondTo(si);
  bond.moveBondStartAbsolute(monomer.position.x, monomer.position.y);
  bond.moveBondEndAbsolute(si.position.x, si.position.y);
  const atomRenderer = new AtomRenderer(si);
  atomRenderer.show();

  const renderer = new MonomerToAtomBondRenderer(bond);
  renderer.show();

  const root = document.querySelector('[data-testid="bond"]');
  const line = root?.querySelector('line');
  const [startX, startY] = (root?.getAttribute('transform') ?? '')
    .match(/-?[\d.]+(?:e-?\d+)?/g)!
    .map(Number);
  const endX = startX + Number(line?.getAttribute('x2'));
  const endY = startY + Number(line?.getAttribute('y2'));
  return Math.hypot(endX, endY);
}

describe('MonomerToAtomBondRenderer trims by the symbol of a stacked label', () => {
  let restoreBoxes: () => void;

  beforeEach(() => {
    createCanvas();
    installEditorStub();
    restoreBoxes = mockTextBoxes(BOXES);
  });

  afterEach(() => restoreBoxes());

  // Si bonded to an atom at 210 degrees and to a monomer at 30 degrees keeps
  // the top free, so its two H are drawn on top.
  function endOfBondToMonomerAt30Degrees() {
    return endOfBondToMonomer(30, 210);
  }

  it('ends at the edge of the symbol, not past the count of H', () => {
    const distance = endOfBondToMonomerAt30Degrees();

    // The ray crosses the symbol box at its right edge, 8 / cos(30deg) from
    // the centre; shiftRayBox is a little short of the exact crossing.
    const atSymbolEdge = SYMBOL_RIGHT_EDGE / Math.cos(Math.PI / 6) + GAP;
    const atCountEdge = COUNT_RIGHT_EDGE / Math.cos(Math.PI / 6) + GAP;
    expect(distance).toBeGreaterThan(SYMBOL_RIGHT_EDGE + GAP);
    expect(distance).toBeLessThanOrEqual(atSymbolEdge);
    expect(distance).toBeLessThan(atCountEdge - 3);
  });
});

describe('MonomerToAtomBondRenderer trims by the text of a label with a radical', () => {
  // The radical is drawn above the label: its circle stands for a box that
  // reaches up to y=-14, past the top of the symbol at y=-4.3. H and its count
  // stay level with the symbol, as hydrogens on the right do.
  const RADICAL_BOX = { x: -6, y: -14, width: 12, height: 4 };
  let restoreBoxes: () => void;

  beforeEach(() => {
    createCanvas();
    installEditorStub();
    restoreBoxes = mockTextBoxes({
      ...BOXES,
      H: { x: 8, y: -4.3, width: 9, height: 9.3 },
      '2': { x: 17, y: -1.3, width: 7, height: 9.3 },
      '': RADICAL_BOX,
    });
  });

  afterEach(() => restoreBoxes());

  it('ends where it does without the radical, for a bond that runs up to it', () => {
    // A bond at 80 degrees crosses the top of the symbol box; the radical box
    // above it would stop the bond about 7 px further out.
    const withRadical = endOfBondToMonomer(80, 210, { radical: 2 });
    const withoutRadical = endOfBondToMonomer(80, 210);

    expect(withRadical).toBeCloseTo(withoutRadical);
  });

  it('still stops an atom-to-atom bond at the radical', () => {
    const atom = createAtom(new Vec2(0, 0), { radical: 2 }, AtomLabel.Si);
    const renderer = new AtomRenderer(atom);
    renderer.show();

    expect(renderer.bondTrimBBoxes).toContainEqual(RADICAL_BOX);
    expect(renderer.monomerBondTrimBBoxes).not.toContainEqual(RADICAL_BOX);
  });
});
