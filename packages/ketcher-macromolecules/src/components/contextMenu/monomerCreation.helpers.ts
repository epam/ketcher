import {
  BaseMonomer,
  BaseSequenceItemRenderer,
  CoreAtom,
  type CoreEditor,
  HydrogenBond,
  isAmbiguousMonomerLibraryItem,
} from 'ketcher-core';

type DrawingEntitiesManager = CoreEditor['drawingEntitiesManager'];

const isEditableMonomer = (monomer: BaseMonomer) =>
  !isAmbiguousMonomerLibraryItem(monomer.monomerItem) &&
  !monomer.monomerItem.props.unresolved &&
  !monomer.monomerItem.props.isMicromoleculeFragment;

export const isSameMonomer = (first: BaseMonomer, second: BaseMonomer) =>
  first.monomerItem.props.MonomerClass ===
    second.monomerItem.props.MonomerClass &&
  (first.monomerItem.props.MonomerCode ?? first.monomerItem.label) ===
    (second.monomerItem.props.MonomerCode ?? second.monomerItem.label);

export const canCreateMonomer = (
  manager: DrawingEntitiesManager,
  monomers: BaseMonomer[],
) => {
  const atoms = [...manager.atoms.values()].filter((atom) => atom.selected);
  const nodes = new Set<BaseMonomer | CoreAtom>([...monomers, ...atoms]);
  if (
    nodes.size === 0 ||
    (monomers.length === 1 && atoms.length === 0) ||
    monomers.some((monomer) => !isEditableMonomer(monomer)) ||
    [
      ...manager.rxnArrows.values(),
      ...manager.rxnPluses.values(),
      ...manager.multitailArrows.values(),
    ].some((entity) => entity.selected)
  ) {
    return false;
  }

  const neighbours = new Map(
    [...nodes].map((node) => [node, new Set<BaseMonomer | CoreAtom>()]),
  );
  const connect = (
    first: BaseMonomer | CoreAtom,
    second?: BaseMonomer | CoreAtom,
  ) => {
    if (second && nodes.has(first) && nodes.has(second)) {
      neighbours.get(first)?.add(second);
      neighbours.get(second)?.add(first);
    }
  };
  manager.bonds.forEach((bond) => connect(bond.firstAtom, bond.secondAtom));
  manager.polymerBonds.forEach((bond) => {
    if (!(bond instanceof HydrogenBond)) {
      connect(bond.firstMonomer, bond.secondMonomer);
    }
  });
  manager.monomerToAtomBonds.forEach((bond) =>
    connect(bond.monomer, bond.atom),
  );

  const pending = [[...nodes][0]];
  const visited = new Set<BaseMonomer | CoreAtom>();
  while (pending.length) {
    const node = pending.pop();
    if (!node || visited.has(node)) continue;
    visited.add(node);
    pending.push(...(neighbours.get(node) ?? []));
  }
  return visited.size === nodes.size;
};

export const getMonomerCreationMenuState = (
  manager: DrawingEntitiesManager,
  selectedMonomers: BaseMonomer[],
  isCompositeSymbol = false,
) => {
  const monomers = selectedMonomers.filter(
    (monomer) => !monomer.monomerItem.props.isMicromoleculeFragment,
  );
  const monomer = monomers[0];
  const hasAtoms = [...manager.atoms.values()].some((atom) => atom.selected);
  const matchingMonomers = monomer
    ? (monomers.length > 1 ? monomers : manager.monomersArray).filter(
        (candidate) =>
          !candidate.monomerItem.props.isMicromoleculeFragment &&
          isSameMonomer(candidate, monomer),
      )
    : [];
  const editAllDisabled =
    !monomer ||
    isCompositeSymbol ||
    hasAtoms ||
    monomers.some(
      (candidate) =>
        !isEditableMonomer(candidate) || !isSameMonomer(candidate, monomer),
    );

  return {
    monomer,
    matchingMonomers,
    canCreate:
      monomers.every((candidate) => candidate.selected) &&
      canCreateMonomer(manager, monomers),
    showEdit: monomers.length > 0,
    editDisabled: editAllDisabled || monomers.length !== 1,
    editAllDisabled,
  };
};

export const highlightMonomers = (monomers: BaseMonomer[]) => {
  const previouslyHovered = new Map(
    monomers.map((monomer) => [monomer, monomer.hovered]),
  );
  monomers.forEach((monomer) => {
    monomer.turnOnHover();
    const renderer = monomer.renderer;
    if (renderer instanceof BaseSequenceItemRenderer) {
      renderer.drawBackgroundElementHover();
    } else {
      renderer?.redrawHover();
    }
  });

  return () => {
    monomers.forEach((monomer) => {
      if (previouslyHovered.get(monomer)) return;
      monomer.turnOffHover();
      const renderer = monomer.renderer;
      if (renderer instanceof BaseSequenceItemRenderer) {
        renderer.removeBackgroundElementHover();
      } else {
        renderer?.redrawHover();
      }
    });
  };
};
