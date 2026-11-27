import { SGroup, Vec2, type Struct } from 'ketcher-core';

const SUPERATOM_LABEL_GAP = 0.5;

type PptxStructureNormalization = {
  struct: Struct;
  positionAdjusted: boolean;
};

export function normalizePptxStructure(
  struct: Struct,
): PptxStructureNormalization {
  const normalizedStruct = struct.clone();
  const labeledSuperatoms = [...normalizedStruct.sgroups.values()].filter(
    (sgroup) =>
      sgroup.type === SGroup.TYPES.SUP && !sgroup.isSuperatomWithoutLabel,
  );
  const components = normalizedStruct.findConnectedComponents(true);

  if (labeledSuperatoms.length !== 1 || components.length !== 2) {
    return { struct, positionAdjusted: false };
  }

  const [superatom] = labeledSuperatoms;
  const superatomAtomIds = new Set(superatom.atoms);
  if (
    superatomAtomIds.size === 0 ||
    superatomAtomIds.size !== superatom.atoms.length
  ) {
    return { struct, positionAdjusted: false };
  }

  const superatomComponent = components.find(
    (component) =>
      component.size === superatomAtomIds.size &&
      [...superatomAtomIds].every((atomId) => component.has(atomId)),
  );
  const mainComponent = components.find(
    (component) => component !== superatomComponent,
  );

  if (
    !superatomComponent ||
    !mainComponent ||
    mainComponent.size <= superatomComponent.size
  ) {
    return { struct, positionAdjusted: false };
  }

  const mainBounds = normalizedStruct.getCoordBoundingBox(mainComponent);
  const currentPosition =
    superatom.getContractedPosition(normalizedStruct).position;
  const targetPosition = new Vec2(
    mainBounds.max.x,
    mainBounds.min.y - SUPERATOM_LABEL_GAP,
  );
  const offset = targetPosition.sub(currentPosition);
  if (offset.x === 0 && offset.y === 0) {
    return { struct, positionAdjusted: false };
  }

  normalizedStruct.atoms.forEach((atom, atomId) => {
    if (superatomComponent.has(atomId)) {
      atom.pp = atom.pp.add(offset);
    }
  });

  if (superatom.pp) {
    superatom.pp = superatom.pp.add(offset);
  }

  return { struct: normalizedStruct, positionAdjusted: true };
}
