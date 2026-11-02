import { AtomRenderer } from '../AtomRenderer';
import { AtomLabel } from 'domain/constants';
import { AtomCIP } from 'domain/entities/types';
import { Vec2 } from 'domain/entities/vec2';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import {
  connect,
  createAtom,
  createCanvas,
  disconnect,
  drawnLabel,
  installEditorStub,
  mockTextBoxes,
} from './atomRendererHarness';

// The singleton needs a live canvas; the renderer only reads its view model.
jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));
jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: {
    getKetcher: () => ({ settingsService: undefined }),
  },
}));

// Positions are model coordinates, y down. Directions in degrees are visual:
// 0 is right and 90 is up.
const at = (deg: number, length = 1) =>
  new Vec2(
    Math.cos((deg * Math.PI) / 180) * length,
    -Math.sin((deg * Math.PI) / 180) * length,
  );

function draw(atom: ReturnType<typeof createAtom>) {
  const renderer = new AtomRenderer(atom);
  renderer.show();
  return renderer;
}

describe('AtomRenderer redraw for a new hydrogen side', () => {
  let restoreBoxes: () => void;

  beforeEach(() => {
    createCanvas();
    installEditorStub();
    restoreBoxes = mockTextBoxes();
  });

  afterEach(() => {
    restoreBoxes();
    jest.restoreAllMocks();
  });

  // An N with two bonds down-left and down-right puts its H on top; moving
  // one neighbour up-right frees the left instead.
  function stereocentre() {
    const centre = createAtom(new Vec2(0, 0), {
      cip: AtomCIP.R,
      stereoLabel: '&1',
    });
    const lower = createAtom(at(330));
    const flipping = createAtom(at(210));
    connect(centre, lower);
    connect(centre, flipping);
    return { centre, flipping, renderer: draw(centre) };
  }

  const stereoAndCip = (atom: { id: number }) => ({
    stereo: document.querySelectorAll(`#stereo-atom-${atom.id}`).length,
    cip: document.querySelectorAll(`#cip-atom-${atom.id}`).length,
  });

  it('puts H on the new side', () => {
    const { centre, flipping, renderer } = stereocentre();
    expect(drawnLabel(centre).texts).toEqual(['H', 'N']);
    expect(drawnLabel(centre).anchor).toBe('middle');

    flipping.moveAbsolute(at(30));

    expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(true);
    expect(drawnLabel(centre)).toEqual({ anchor: 'end', texts: ['H', 'N'] });
  });

  it('keeps the CIP and stereo labels of the atom after the side changed', () => {
    const { centre, flipping, renderer } = stereocentre();
    expect(stereoAndCip(centre)).toEqual({ stereo: 1, cip: 1 });

    flipping.moveAbsolute(at(30));
    renderer.redrawLabelIfHydrogenSideChanged();

    expect(stereoAndCip(centre)).toEqual({ stereo: 1, cip: 1 });
    expect(
      document.querySelector(`#cip-atom-${centre.id} text`)?.textContent,
    ).toBe('(R)');
    expect(
      document.querySelector(`#stereo-atom-${centre.id} text`)?.textContent,
    ).toBe('&1');
  });

  it('keeps the selection of a selected atom, CIP background included', () => {
    const { centre, flipping, renderer } = stereocentre();
    centre.turnOnSelection();
    renderer.drawSelection();

    flipping.moveAbsolute(at(30));
    renderer.redrawLabelIfHydrogenSideChanged();

    expect(
      document
        .querySelector(`#cip-atom-${centre.id} rect`)
        ?.getAttribute('fill'),
    ).toBe(SELECTION_COLOR);
    expect(
      document.querySelectorAll(`[data-atomid="${centre.id}"] rect`),
    ).toHaveLength(2);
  });

  it('does not touch the label while the side is the same', () => {
    const { centre, flipping, renderer } = stereocentre();
    const labelBefore = document.querySelector(
      `[data-atomid="${centre.id}"] text`,
    );

    flipping.moveAbsolute(at(200));

    expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(false);
    expect(document.querySelector(`[data-atomid="${centre.id}"] text`)).toBe(
      labelBefore,
    );
  });

  describe('an atom that draws no hydrogens', () => {
    it('never computes a side, so moving its neighbours costs nothing', () => {
      const middle = createAtom(new Vec2(0, 0), {}, AtomLabel.C);
      const left = createAtom(at(210));
      const right = createAtom(at(330));
      connect(middle, left);
      connect(middle, right);
      const renderer = draw(middle);
      const computeSide = jest.spyOn(
        AtomRenderer.prototype as unknown as {
          computeHydrogenSide: () => void;
        },
        'computeHydrogenSide',
      );

      right.moveAbsolute(at(30));

      expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(false);
      expect(computeSide).not.toHaveBeenCalled();
    });

    it('does not redraw for a full-valence heteroatom whose neighbours move', () => {
      const centre = createAtom(new Vec2(0, 0));
      const bonded = [at(0), at(120), at(240)].map((position) => {
        const atom = createAtom(position);
        connect(centre, atom);
        return atom;
      });
      const renderer = draw(centre);
      expect(drawnLabel(centre).texts).toEqual(['N']);

      bonded[0].moveAbsolute(at(90));

      expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(false);
    });

    it('redraws once a deleted bond leaves it with hydrogens to draw', () => {
      const centre = createAtom(new Vec2(0, 0));
      const bonds = [at(0), at(120), at(240)].map((position) =>
        connect(centre, createAtom(position)),
      );
      const renderer = draw(centre);
      expect(drawnLabel(centre).texts).toEqual(['N']);

      disconnect(bonds[0]);

      expect(renderer.redrawLabelIfHydrogenSideChanged()).toBe(true);
      expect(drawnLabel(centre).texts).toContain('H');
    });
  });
});
