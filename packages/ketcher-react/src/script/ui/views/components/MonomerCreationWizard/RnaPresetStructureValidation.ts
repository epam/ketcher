import { Bond, Struct } from 'ketcher-core';

import { RnaPresetWizardState } from './MonomerCreationWizard.types';

type RnaPresetComponentStructures = Pick<
  RnaPresetWizardState,
  'base' | 'sugar' | 'phosphate'
>;

const hasComponentStructure = (
  structure?: RnaPresetWizardState['base']['structure'],
) => {
  return Boolean(structure?.atoms?.length);
};

const hasBondBetweenComponents = (
  bond: Pick<Bond, 'begin' | 'end'>,
  firstComponentAtomIds: number[],
  secondComponentAtomIds: number[],
) => {
  return (
    (firstComponentAtomIds.includes(bond.begin) ||
      firstComponentAtomIds.includes(bond.end)) &&
    (secondComponentAtomIds.includes(bond.begin) ||
      secondComponentAtomIds.includes(bond.end))
  );
};

export const isValidRnaPresetStructure = (
  wizardStruct: Pick<Struct, 'atoms' | 'bonds'>,
  componentStructures: RnaPresetComponentStructures,
) => {
  const sugarAtomIds = componentStructures.sugar.structure?.atoms || [];
  const baseAtomIds = componentStructures.base.structure?.atoms || [];
  const phosphateAtomIds = componentStructures.phosphate.structure?.atoms || [];
  const hasSugar = hasComponentStructure(componentStructures.sugar.structure);
  const hasBase = hasComponentStructure(componentStructures.base.structure);
  const hasPhosphate = hasComponentStructure(
    componentStructures.phosphate.structure,
  );
  const allComponentAtomIds = [
    ...sugarAtomIds,
    ...baseAtomIds,
    ...phosphateAtomIds,
  ];
  const atomIdsInComponents = new Set(allComponentAtomIds);
  let sugarBaseBondCount = 0;
  let sugarPhosphateBondCount = 0;
  let basePhosphateBondCount = 0;
  let hasAtomsOutsideComponents = false;

  wizardStruct.bonds.forEach((bond) => {
    if (hasBondBetweenComponents(bond, sugarAtomIds, baseAtomIds)) {
      sugarBaseBondCount += 1;
    }

    if (hasBondBetweenComponents(bond, sugarAtomIds, phosphateAtomIds)) {
      sugarPhosphateBondCount += 1;
    }

    if (hasBondBetweenComponents(bond, baseAtomIds, phosphateAtomIds)) {
      basePhosphateBondCount += 1;
    }
  });

  wizardStruct.atoms.forEach((_, atomId) => {
    if (!atomIdsInComponents.has(atomId)) {
      hasAtomsOutsideComponents = true;
    }
  });

  return (
    hasSugar &&
    (hasBase || hasPhosphate) &&
    atomIdsInComponents.size === allComponentAtomIds.length &&
    !hasAtomsOutsideComponents &&
    sugarBaseBondCount === (hasBase ? 1 : 0) &&
    sugarPhosphateBondCount === (hasPhosphate ? 1 : 0) &&
    basePhosphateBondCount === 0
  );
};
