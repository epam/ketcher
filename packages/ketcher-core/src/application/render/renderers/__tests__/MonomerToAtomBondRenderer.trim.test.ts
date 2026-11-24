import { AtomRenderer } from '../AtomRenderer';
import { MonomerToAtomBondRenderer } from '../MonomerToAtomBondRenderer';
import { AtomLabel } from 'domain/constants';
import { Vec2 } from 'domain/entities/vec2';
import {
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

// Positions are model coordinates, y down; degrees are visual (0 is right,
// 90 is up). The atom sits at the origin, drawn at scale 40.
const at = (deg: number, length = 1) =>
  new Vec2(
    Math.cos((deg * Math.PI) / 180) * length,
    -Math.sin((deg * Math.PI) / 180) * length,
  );

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

describe('MonomerToAtomBondRenderer trims by the symbol of a stacked label', () => {
  let restoreBoxes: () => void;

  beforeEach(() => {
    createCanvas();
    installEditorStub();
    restoreBoxes = mockTextBoxes(BOXES);
  });

  afterEach(() => restoreBoxes());

  // Si bonded to an atom at 210 degrees and to a monomer at 30 degrees keeps
  // the top free, so its two H are drawn on top. Returns where the line to the
  // monomer ends, as a distance from the atom.
  function endOfBondToMonomerAt30Degrees() {
    const si = createAtom(new Vec2(0, 0), {}, AtomLabel.Si);
    connect(si, createAtom(at(210)));
    const { monomer, bondTo } = createMonomer(at(30, 3));
    const bond = bondTo(si);
    bond.moveBondStartAbsolute(monomer.position.x, monomer.position.y);
    bond.moveBondEndAbsolute(si.position.x, si.position.y);
    const atomRenderer = new AtomRenderer(si);
    atomRenderer.show();
    expect(atomRenderer.bondTrimBBoxes).toHaveLength(1);

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
