import { RenderersManager } from '../RenderersManager';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel } from 'domain/constants';
import type { AtomRenderer } from '../AtomRenderer';
import type { BaseRenderer } from '../BaseRenderer';
import type { BondRenderer } from '../BondRenderer';
import type { MonomerToAtomBondRenderer } from '../MonomerToAtomBondRenderer';

// The singleton needs a live canvas; the manager only forwards to renderers.
jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

// An atom whose renderer reports whether its label was redrawn for a new
// hydrogen side, and records the calls the manager makes.
function atomWithRenderer(labelRedrawn: boolean) {
  const atom = new Atom(new Vec2(0, 0), {} as BaseMonomer, 1, AtomLabel.N);
  const renderer = {
    redrawLabelIfHydrogenSideChanged: jest.fn(() => labelRedrawn),
    moveSelection: jest.fn(),
    drawSelection: jest.fn(),
    move: jest.fn(),
    remove: jest.fn(),
  };
  atom.renderer = renderer as unknown as AtomRenderer;
  atom.baseRenderer = renderer as unknown as BaseRenderer;
  return { atom, renderer };
}

function bondBetween(first: Atom, second: Atom) {
  const bond = new Bond(first, second, 1);
  const renderer = { move: jest.fn(), remove: jest.fn() };
  bond.renderer = renderer as unknown as BondRenderer;
  return { bond, renderer };
}

function bondWithMonomer(atom: Atom) {
  const monomer = { position: new Vec2(1, 0) } as BaseMonomer;
  const bond = new MonomerToAtomBond(monomer, atom);
  const renderer = { move: jest.fn(), remove: jest.fn() };
  bond.renderer = renderer as unknown as MonomerToAtomBondRenderer;
  return { monomer, bond, renderer };
}

describe('RenderersManager hydrogen side of atom labels', () => {
  const createManager = () => new RenderersManager({ theme: {} });

  describe('deleteBond', () => {
    it('redraws the labels of both atoms of the deleted bond for their new bonds', () => {
      const first = atomWithRenderer(false);
      const second = atomWithRenderer(false);
      const { bond } = bondBetween(first.atom, second.atom);

      createManager().deleteBond(bond);

      expect(
        first.renderer.redrawLabelIfHydrogenSideChanged,
      ).toHaveBeenCalled();
      expect(
        second.renderer.redrawLabelIfHydrogenSideChanged,
      ).toHaveBeenCalled();
    });

    it('re-trims the remaining bonds of an atom whose label was redrawn', () => {
      const first = atomWithRenderer(true);
      const second = atomWithRenderer(false);
      const third = atomWithRenderer(false);
      const fourth = atomWithRenderer(false);
      const { bond } = bondBetween(first.atom, second.atom);
      const redrawnNeighbour = bondBetween(first.atom, third.atom);
      const untouchedNeighbour = bondBetween(second.atom, fourth.atom);
      // The deleted bond is already out of the model when the manager runs.
      first.atom.bonds = [redrawnNeighbour.bond];
      second.atom.bonds = [untouchedNeighbour.bond];

      createManager().deleteBond(bond);

      expect(redrawnNeighbour.renderer.move).toHaveBeenCalled();
      expect(untouchedNeighbour.renderer.move).not.toHaveBeenCalled();
    });

    it('leaves a removed atom alone', () => {
      const first = atomWithRenderer(false);
      const second = atomWithRenderer(false);
      second.atom.renderer = undefined;
      const { bond } = bondBetween(first.atom, second.atom);

      expect(() => createManager().deleteBond(bond)).not.toThrow();
    });
  });

  describe('moveDrawingEntity', () => {
    it('redraws the label of the moved atom and of its bonded atoms, and of no other atom', () => {
      const moved = atomWithRenderer(false);
      const neighbour = atomWithRenderer(false);
      const farAtom = atomWithRenderer(false);
      moved.atom.bonds = [bondBetween(moved.atom, neighbour.atom).bond];

      createManager().moveDrawingEntity(moved.atom);

      expect(
        moved.renderer.redrawLabelIfHydrogenSideChanged,
      ).toHaveBeenCalled();
      expect(
        neighbour.renderer.redrawLabelIfHydrogenSideChanged,
      ).toHaveBeenCalled();
      expect(
        farAtom.renderer.redrawLabelIfHydrogenSideChanged,
      ).not.toHaveBeenCalled();
    });

    it('re-trims the bonds of a bonded atom whose label was redrawn', () => {
      const moved = atomWithRenderer(false);
      const neighbour = atomWithRenderer(true);
      const other = atomWithRenderer(false);
      const moving = bondBetween(moved.atom, neighbour.atom);
      const behind = bondBetween(neighbour.atom, other.atom);
      moved.atom.bonds = [moving.bond];
      neighbour.atom.bonds = [moving.bond, behind.bond];

      createManager().moveDrawingEntity(moved.atom);

      expect(behind.renderer.move).toHaveBeenCalled();
    });
  });

  describe('moveMonomer', () => {
    it('redraws the label of an atom bonded to the moved monomer', () => {
      const bonded = atomWithRenderer(false);
      const { monomer, bond, renderer } = bondWithMonomer(bonded.atom);
      bonded.atom.bonds = [bond];
      Object.assign(monomer, {
        monomerToAtomBonds: [bond],
        renderer: { move: jest.fn(), drawSelection: jest.fn() },
      });
      bonded.renderer.redrawLabelIfHydrogenSideChanged.mockReturnValue(true);

      createManager().moveMonomer(monomer);

      expect(
        bonded.renderer.redrawLabelIfHydrogenSideChanged,
      ).toHaveBeenCalled();
      // The label moved, so the monomer bond is trimmed again.
      expect(renderer.move).toHaveBeenCalled();
    });
  });
});
