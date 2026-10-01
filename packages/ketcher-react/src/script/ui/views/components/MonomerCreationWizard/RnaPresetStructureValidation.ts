import { Bond } from 'ketcher-core';

import type {
  RnaPresetWizardComponentStateFieldId,
  RnaPresetWizardState,
} from './MonomerCreationWizard.types';

export type RnaPresetValidationStruct = {
  atoms: {
    forEach: (callback: (_value: unknown, atomId: number) => void) => void;
  };
  bonds: {
    forEach: (
      callback: (
        bond: Pick<Bond, 'begin' | 'end'> &
          Partial<Pick<Bond, 'type' | 'stereo'>>,
        bondId: number,
      ) => void,
    ) => void;
  };
};

export type RnaPresetStructureValidationIssueId =
  | 'rnaPresetAtomsOutsideComponents'
  | 'rnaPresetAtomsInMultipleComponents'
  | 'rnaPresetMissingComponents'
  | 'rnaPresetInvalidSugarConnectionBonds'
  | 'rnaPresetUnexpectedBasePhosphateBond'
  | 'rnaPresetInvalidSugarBaseConnectionAttachmentPoints'
  | 'rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints';

export type RnaPresetStructureValidationResult = {
  issues: RnaPresetStructureValidationIssueId[];
  problematicAtomIds: Set<number>;
};

export type RnaPresetComponentStructures = {
  base: Pick<RnaPresetWizardState['base'], 'structure'>;
  sugar: Pick<RnaPresetWizardState['sugar'], 'structure'>;
  phosphate: Pick<RnaPresetWizardState['phosphate'], 'structure'>;
};

const hasComponentStructure = (
  structure?: RnaPresetWizardState['base']['structure'],
) => {
  return Boolean(structure?.atoms?.length);
};

export const getRnaPresetComponentKeysToSave = (
  componentStructures: RnaPresetComponentStructures,
) => {
  return (
    ['base', 'sugar', 'phosphate'] as RnaPresetWizardComponentStateFieldId[]
  ).filter((componentKey) =>
    hasComponentStructure(componentStructures[componentKey].structure),
  );
};

export const hasRequiredRnaPresetComponents = (
  componentStructures: RnaPresetComponentStructures,
) => {
  return (
    hasComponentStructure(componentStructures.sugar.structure) &&
    (hasComponentStructure(componentStructures.base.structure) ||
      hasComponentStructure(componentStructures.phosphate.structure))
  );
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

/**
 * RNA preset component connections allow only a single bond with none, up, or
 * down stereo, matching Ketcher's attachment-point bond rules.
 */
const isValidConnectionBond = (
  bond: Pick<Bond, 'begin' | 'end'> & Partial<Pick<Bond, 'type' | 'stereo'>>,
) => {
  const isSingleBond =
    bond.type === undefined || bond.type === Bond.PATTERN.TYPE.SINGLE;
  const validStereoTypes = new Set([
    undefined,
    Bond.PATTERN.STEREO.NONE,
    Bond.PATTERN.STEREO.UP,
    Bond.PATTERN.STEREO.DOWN,
  ]);

  return isSingleBond && validStereoTypes.has(bond.stereo);
};

export const findBondBetweenRnaPresetComponents = (
  wizardStruct: RnaPresetValidationStruct,
  firstComponentAtomIds: number[],
  secondComponentAtomIds: number[],
) => {
  let bondBetweenComponents: Pick<Bond, 'begin' | 'end'> | undefined;

  wizardStruct.bonds.forEach((bond) => {
    if (
      !bondBetweenComponents &&
      hasBondBetweenComponents(
        bond,
        firstComponentAtomIds,
        secondComponentAtomIds,
      )
    ) {
      bondBetweenComponents = bond;
    }
  });

  return bondBetweenComponents;
};

const countRnaPresetConnectionBonds = (
  wizardStruct: RnaPresetValidationStruct,
  firstComponentAtomIds: number[],
  secondComponentAtomIds: number[],
) => {
  let count = 0;
  let hasInvalidBond = false;

  wizardStruct.bonds.forEach((bond) => {
    if (
      hasBondBetweenComponents(
        bond,
        firstComponentAtomIds,
        secondComponentAtomIds,
      )
    ) {
      count += 1;
      hasInvalidBond = hasInvalidBond || !isValidConnectionBond(bond);
    }
  });

  return { count, hasInvalidBond };
};

export const getRnaPresetStructureValidationResult = (
  wizardStruct: RnaPresetValidationStruct,
  componentStructures: RnaPresetComponentStructures,
): RnaPresetStructureValidationResult => {
  const issues: RnaPresetStructureValidationIssueId[] = [];
  const problematicAtomIds = new Set<number>();
  const sugarAtomIds = componentStructures.sugar.structure?.atoms || [];
  const baseAtomIds = componentStructures.base.structure?.atoms || [];
  const phosphateAtomIds = componentStructures.phosphate.structure?.atoms || [];
  const hasBase = hasComponentStructure(componentStructures.base.structure);
  const hasPhosphate = hasComponentStructure(
    componentStructures.phosphate.structure,
  );
  const allComponentAtomIds = [
    ...sugarAtomIds,
    ...baseAtomIds,
    ...phosphateAtomIds,
  ];
  const atomComponentCount = new Map<number, number>();

  allComponentAtomIds.forEach((atomId) => {
    atomComponentCount.set(atomId, (atomComponentCount.get(atomId) ?? 0) + 1);
  });

  const hasAtomsInMultipleComponents = Array.from(
    atomComponentCount.entries(),
  ).some(([atomId, componentCount]) => {
    if (componentCount > 1) {
      problematicAtomIds.add(atomId);
      return true;
    }

    return false;
  });

  if (hasAtomsInMultipleComponents) {
    issues.push('rnaPresetAtomsInMultipleComponents');
  }

  let hasAtomsOutsideComponents = false;
  wizardStruct.atoms.forEach((_, atomId) => {
    if (!atomComponentCount.has(atomId)) {
      hasAtomsOutsideComponents = true;
      problematicAtomIds.add(atomId);
    }
  });

  if (hasAtomsOutsideComponents) {
    issues.push('rnaPresetAtomsOutsideComponents');
  }

  if (!hasRequiredRnaPresetComponents(componentStructures)) {
    issues.push('rnaPresetMissingComponents');
  }

  const sugarBaseBonds = countRnaPresetConnectionBonds(
    wizardStruct,
    sugarAtomIds,
    baseAtomIds,
  );
  const sugarPhosphateBonds = countRnaPresetConnectionBonds(
    wizardStruct,
    sugarAtomIds,
    phosphateAtomIds,
  );
  const basePhosphateBonds = countRnaPresetConnectionBonds(
    wizardStruct,
    baseAtomIds,
    phosphateAtomIds,
  );

  if (
    (hasBase &&
      (sugarBaseBonds.count !== 1 || sugarBaseBonds.hasInvalidBond)) ||
    (hasPhosphate &&
      (sugarPhosphateBonds.count !== 1 || sugarPhosphateBonds.hasInvalidBond))
  ) {
    issues.push('rnaPresetInvalidSugarConnectionBonds');
  }

  if (basePhosphateBonds.count > 0) {
    issues.push('rnaPresetUnexpectedBasePhosphateBond');
  }

  return {
    issues,
    problematicAtomIds,
  };
};

export const isValidRnaPresetStructure = (
  wizardStruct: RnaPresetValidationStruct,
  componentStructures: RnaPresetComponentStructures,
) => {
  return (
    getRnaPresetStructureValidationResult(wizardStruct, componentStructures)
      .issues.length === 0
  );
};
