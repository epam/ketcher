import {
  AtomLabel,
  BaseMonomer,
  BaseSequenceItemRenderer,
  CoreAtom,
  type CoreEditor,
  HydrogenBond,
  KetMonomerClass,
  MonomerToAtomBond,
  Peptide,
  PolymerBond,
  Vec2,
} from 'ketcher-core';
import {
  canCreateMonomer,
  getMonomerCreationMenuState,
  highlightMonomers,
} from './monomerCreation.helpers';

type DrawingEntitiesManager = CoreEditor['drawingEntitiesManager'];

const createMonomer = (
  code = 'A',
  monomerClass = KetMonomerClass.AminoAcid,
): BaseMonomer =>
  Object.assign(Object.create(Peptide.prototype), {
    selected: true,
    hovered: false,
    monomerItem: {
      label: code,
      props: { MonomerCode: code, MonomerClass: monomerClass },
    },
  });

const addAtom = (manager: DrawingEntitiesManager, monomer: BaseMonomer) => {
  const atom = new CoreAtom(new Vec2(), monomer, 0, AtomLabel.C);
  atom.selected = true;
  manager.atoms.set(atom.id, atom);
  return atom;
};

describe('macromolecule monomer creation menu', () => {
  let manager: DrawingEntitiesManager;
  beforeEach(() => {
    manager = {
      monomers: new Map(),
      atoms: new Map(),
      bonds: new Map(),
      polymerBonds: new Map(),
      monomerToAtomBonds: new Map(),
      rxnArrows: new Map(),
      rxnPluses: new Map(),
      multitailArrows: new Map(),
      get monomersArray() {
        return [...this.monomers.values()];
      },
    } as DrawingEntitiesManager;
  });

  it('offers creation for one small molecule but not an empty canvas', () => {
    expect(canCreateMonomer(manager, [])).toBe(false);
    addAtom(manager, createMonomer());
    expect(canCreateMonomer(manager, [])).toBe(true);
  });

  it('requires the selected structure to be continuous', () => {
    const first = createMonomer();
    const second = createMonomer('C');
    expect(canCreateMonomer(manager, [first])).toBe(false);
    expect(canCreateMonomer(manager, [first, second])).toBe(false);
    const bond = new PolymerBond(first, second);
    manager.polymerBonds.set(bond.id, bond);
    expect(canCreateMonomer(manager, [first, second])).toBe(true);
  });

  it('accepts a monomer connected to a selected chemical structure', () => {
    const monomer = createMonomer();
    const atom = addAtom(manager, createMonomer());
    expect(canCreateMonomer(manager, [monomer])).toBe(false);
    const bond = new MonomerToAtomBond(monomer, atom);
    manager.monomerToAtomBonds.set(bond.id, bond);
    expect(canCreateMonomer(manager, [monomer])).toBe(true);
    atom.selected = false;
    expect(canCreateMonomer(manager, [monomer])).toBe(false);
  });

  it('does not connect a selection through an unselected monomer', () => {
    const [first, middle, last] = [
      createMonomer(),
      createMonomer(),
      createMonomer(),
    ];
    [new PolymerBond(first, middle), new PolymerBond(middle, last)].forEach(
      (bond) => manager.polymerBonds.set(bond.id, bond),
    );
    expect(canCreateMonomer(manager, [first, last])).toBe(false);
  });

  it('does not treat hydrogen bonds as structural connectivity', () => {
    const first = createMonomer();
    const second = createMonomer();
    const bond = new HydrogenBond(first, second);
    manager.polymerBonds.set(bond.id, bond);
    expect(canCreateMonomer(manager, [first, second])).toBe(false);
  });

  it('matches all instances by both code and class', () => {
    const first = createMonomer();
    const second = createMonomer();
    const base = createMonomer('A', KetMonomerClass.Base);
    [first, second, base].forEach((monomer, id) =>
      manager.monomers.set(id, monomer),
    );
    const state = getMonomerCreationMenuState(manager, [first]);
    expect(state.matchingMonomers).toEqual([first, second]);
    expect(state.editDisabled).toBe(false);
    expect(state.editAllDisabled).toBe(false);
    expect(state.canCreate).toBe(false);
  });

  it('limits Edit All to a homogeneous multi-selection', () => {
    const monomers = [createMonomer(), createMonomer(), createMonomer()];
    monomers.forEach((monomer, id) => manager.monomers.set(id, monomer));
    const selected = monomers.slice(0, 2);
    const state = getMonomerCreationMenuState(manager, selected);
    expect(state.matchingMonomers).toEqual(selected);
    expect(state.editDisabled).toBe(true);
    expect(state.editAllDisabled).toBe(false);
    expect(
      getMonomerCreationMenuState(manager, [monomers[0], createMonomer('C')])
        .editAllDisabled,
    ).toBe(true);
  });

  it('keeps both edit options disabled for a multi-monomer sequence symbol', () => {
    const state = getMonomerCreationMenuState(
      manager,
      [createMonomer(), createMonomer()],
      true,
    );
    expect(state.showEdit).toBe(true);
    expect(state.editDisabled).toBe(true);
    expect(state.editAllDisabled).toBe(true);
  });

  it('disables editing unknown or ambiguous monomers and mixed selections', () => {
    const monomer = createMonomer();
    monomer.monomerItem.props.unresolved = true;
    expect(
      getMonomerCreationMenuState(manager, [monomer]).editAllDisabled,
    ).toBe(true);
    monomer.monomerItem.props.unresolved = false;
    monomer.monomerItem.isAmbiguous = true;
    expect(getMonomerCreationMenuState(manager, [monomer]).editDisabled).toBe(
      true,
    );
    monomer.monomerItem.isAmbiguous = false;
    addAtom(manager, createMonomer());
    expect(
      getMonomerCreationMenuState(manager, [monomer]).editAllDisabled,
    ).toBe(true);
  });

  it('restores hover state without changing the selection', () => {
    const monomer = createMonomer();
    const redrawHover = jest.fn();
    monomer.renderer = { redrawHover } as unknown as BaseMonomer['renderer'];
    const clear = highlightMonomers([monomer]);
    expect(monomer.hovered).toBe(true);
    expect(monomer.selected).toBe(true);
    expect(redrawHover).toHaveBeenCalledTimes(1);
    clear();
    expect(monomer.hovered).toBe(false);
    expect(monomer.selected).toBe(true);
    expect(redrawHover).toHaveBeenCalledTimes(2);
  });

  it('highlights sequence symbols using their background renderer', () => {
    const monomer = createMonomer();
    const drawBackgroundElementHover = jest.fn();
    const removeBackgroundElementHover = jest.fn();
    monomer.renderer = Object.assign(
      Object.create(BaseSequenceItemRenderer.prototype),
      { drawBackgroundElementHover, removeBackgroundElementHover },
    );
    const clear = highlightMonomers([monomer]);
    expect(drawBackgroundElementHover).toHaveBeenCalledTimes(1);
    clear();
    expect(removeBackgroundElementHover).toHaveBeenCalledTimes(1);
  });
});
