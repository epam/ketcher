import { RenderersManager } from '../RenderersManager';
import { AtomRenderer } from '../AtomRenderer';
import { AtomCIP } from 'domain/entities/types';
import type { Atom } from 'domain/entities/CoreAtom';
import type { Bond } from 'domain/entities/CoreBond';
import type { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import type { BaseRenderer } from '../BaseRenderer';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Vec2 } from 'domain/entities/vec2';
import {
  at,
  connect,
  createAtom,
  createCanvas,
  createMonomer,
  disconnect,
  drawnLabel,
  installEditorStub,
  labelElementOf,
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

// The atoms are real and drawn by real AtomRenderers. A bond renderer needs
// the whole view model, so a bond only records that it was trimmed again.
function drawBond(bond: Bond) {
  const move = jest.fn();
  bond.renderer = { move, remove: jest.fn() } as unknown as Bond['renderer'];
  return move;
}

function drawAtom(atom: Atom) {
  new AtomRenderer(atom).show();
}

describe('RenderersManager hydrogen side of atom labels', () => {
  let restoreBoxes: () => void;
  let manager: RenderersManager;

  beforeEach(() => {
    createCanvas();
    installEditorStub();
    restoreBoxes = mockTextBoxes();
    manager = new RenderersManager({ theme: {} });
  });

  afterEach(() => {
    restoreBoxes();
    jest.restoreAllMocks();
  });

  // An N with bonds down-left and down-right puts its H on top. Taking the
  // lower-left neighbour to the upper right frees the left side instead.
  function stereocentre() {
    const centre = createAtom(new Vec2(0, 0), {
      cip: AtomCIP.R,
      stereoLabel: '&1',
    });
    const lowerRight = createAtom(at(330));
    const flipping = createAtom(at(210));
    const bondToFlipping = connect(centre, flipping);
    const bondToLowerRight = connect(centre, lowerRight);
    [centre, flipping, lowerRight].forEach(drawAtom);
    return {
      centre,
      flipping,
      lowerRight,
      bondToFlipping,
      bondToLowerRight,
      retrimmed: drawBond(bondToLowerRight),
    };
  }

  const TOP = { anchor: 'middle', texts: ['H', 'N'] };
  const LEFT = { anchor: 'end', texts: ['H', 'N'] };

  describe('moveDrawingEntity', () => {
    it('puts H of a neighbour on the new side once the update ran', () => {
      const { centre, flipping } = stereocentre();
      expect(drawnLabel(centre)).toEqual(TOP);

      flipping.moveAbsolute(at(30));
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();

      expect(drawnLabel(centre)).toEqual(LEFT);
    });

    it('puts H of the moved atom on the new side too', () => {
      const { flipping } = stereocentre();
      // Its only bond leaves to the upper right, so its two H go left.
      expect(drawnLabel(flipping).anchor).toBe('end');

      flipping.moveAbsolute(at(30));
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();

      // Now the bond leaves to the lower left.
      expect(drawnLabel(flipping).anchor).toBe('start');
    });

    it('keeps the CIP and stereo labels of the atom whose side changed', () => {
      const { centre, flipping } = stereocentre();

      flipping.moveAbsolute(at(30));
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();

      expect(
        document.querySelector(`#cip-atom-${centre.id} text`)?.textContent,
      ).toBe('(R)');
      expect(
        document.querySelector(`#stereo-atom-${centre.id} text`)?.textContent,
      ).toBe('&1');
    });

    it('leaves the label of an atom that is not next to a moved atom untouched', () => {
      const { flipping } = stereocentre();
      const far = createAtom(at(90, 10));
      drawAtom(far);
      const farLabel = labelElementOf(far);

      flipping.moveAbsolute(at(30));
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();

      expect(farLabel).not.toBeNull();
      expect(labelElementOf(far)).toBe(farLabel);
    });

    it('trims the bonds of an atom whose label was redrawn, once', () => {
      const { flipping, retrimmed } = stereocentre();

      flipping.moveAbsolute(at(30));
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();

      // moveDrawingEntity moves the moved atom's own bonds; the bond of the
      // centre to the lower atom is only trimmed because the label changed.
      expect(retrimmed).toHaveBeenCalledTimes(1);
    });

    it('does not trim bonds of atoms whose label stayed', () => {
      const { flipping, retrimmed } = stereocentre();

      flipping.moveAbsolute(at(200));
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();

      expect(retrimmed).not.toHaveBeenCalled();
    });

    it('checks each atom once for a drag that moves all of a molecule', () => {
      const { centre, flipping, lowerRight } = stereocentre();
      const checkSide = jest.spyOn(
        AtomRenderer.prototype,
        'redrawLabelIfHydrogenSideChanged',
      );

      [centre, flipping, lowerRight].forEach((atom) => {
        atom.moveRelative(new Vec2(1, 1));
        manager.moveDrawingEntity(atom);
      });
      manager.runPostRenderMethods();

      expect(checkSide).toHaveBeenCalledTimes(3);
    });

    it('checks nothing the second time when nothing was scheduled', () => {
      const { flipping } = stereocentre();
      manager.moveDrawingEntity(flipping);
      manager.runPostRenderMethods();
      const checkSide = jest.spyOn(
        AtomRenderer.prototype,
        'redrawLabelIfHydrogenSideChanged',
      );

      manager.runPostRenderMethods();

      expect(checkSide).not.toHaveBeenCalled();
    });
  });

  describe('deleteBond', () => {
    it('puts H of both atoms of the deleted bond on the side the remaining bonds leave', () => {
      const { centre, flipping, bondToFlipping } = stereocentre();
      expect(drawnLabel(flipping).anchor).toBe('end');

      disconnect(bondToFlipping);
      manager.deleteBond(bondToFlipping);
      manager.runPostRenderMethods();

      // Left with one bond down-right, the centre has two H on its left.
      expect(drawnLabel(centre)).toEqual({
        anchor: 'end',
        texts: ['H', '2', 'N'],
      });
      // Without bonds the other N draws its three H on the right.
      expect(drawnLabel(flipping)).toEqual({
        anchor: 'start',
        texts: ['N', 'H', '3'],
      });
    });

    it('trims the remaining bonds of an atom whose label was redrawn', () => {
      const { bondToFlipping, retrimmed } = stereocentre();

      disconnect(bondToFlipping);
      manager.deleteBond(bondToFlipping);
      manager.runPostRenderMethods();

      expect(retrimmed).toHaveBeenCalledTimes(1);
    });

    it('leaves a removed atom alone', () => {
      const { centre, flipping, bondToFlipping } = stereocentre();
      manager.deleteAtom(flipping);

      disconnect(bondToFlipping);
      manager.deleteBond(bondToFlipping);
      expect(() => manager.runPostRenderMethods()).not.toThrow();

      // Nothing of the removed atom came back, and the other atom followed
      // its new bonds.
      expect(labelElementOf(flipping)).toBeNull();
      expect(
        document.querySelector(`[data-atomid="${flipping.id}"]`),
      ).toBeNull();
      expect(drawnLabel(centre).texts).toEqual(['H', '2', 'N']);
    });
  });

  describe('a monomer bonded to an atom', () => {
    // An NH2 bonded only to a monomer on its right: the H go left.
    function atomBondedToMonomerOnTheRight() {
      const atom = createAtom(new Vec2(0, 0));
      const { monomer, moveTo, bondTo } = createMonomer(at(0, 2));
      const bond = bondTo(atom);
      drawAtom(atom);
      const moveBond = jest.fn();
      bond.renderer = {
        move: moveBond,
        remove: jest.fn(),
      } as unknown as MonomerToAtomBond['renderer'];
      return { atom, monomer, moveTo, moveBond };
    }

    const H_LEFT = { anchor: 'end', texts: ['H', '2', 'N'] };
    const H_RIGHT = { anchor: 'start', texts: ['N', 'H', '2'] };

    it('puts H of the atom on the other side when the monomer is dragged across it', () => {
      const { atom, monomer, moveTo, moveBond } =
        atomBondedToMonomerOnTheRight();
      expect(drawnLabel(atom)).toEqual(H_LEFT);
      // A drag of a selected monomer goes through moveDrawingEntity.
      monomer.baseRenderer = {
        moveSelection: jest.fn(),
        drawSelection: jest.fn(),
      } as unknown as BaseRenderer;

      moveTo(at(180, 2));
      manager.moveDrawingEntity(monomer);
      manager.runPostRenderMethods();

      expect(drawnLabel(atom)).toEqual(H_RIGHT);
      expect(moveBond).toHaveBeenCalledTimes(1);
    });

    it('puts H of the atom on the other side when the monomer is moved by a move operation', () => {
      const { atom, monomer, moveTo } = atomBondedToMonomerOnTheRight();
      monomer.renderer = {
        move: jest.fn(),
        drawSelection: jest.fn(),
      } as unknown as BaseMonomer['renderer'];

      moveTo(at(180, 2));
      manager.moveMonomer(monomer);
      manager.runPostRenderMethods();

      expect(drawnLabel(atom)).toEqual(H_RIGHT);
    });

    it('keeps the label of the atom while the monomer stays on the same side', () => {
      const { atom, monomer, moveTo, moveBond } =
        atomBondedToMonomerOnTheRight();
      monomer.renderer = {
        move: jest.fn(),
        drawSelection: jest.fn(),
      } as unknown as BaseMonomer['renderer'];
      const label = labelElementOf(atom);

      moveTo(at(10, 3));
      manager.moveMonomer(monomer);
      manager.runPostRenderMethods();

      expect(labelElementOf(atom)).toBe(label);
      expect(moveBond).not.toHaveBeenCalled();
    });
  });
});
