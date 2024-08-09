import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

export const getValidations = (
  newPreset: IRnaPreset,
): {
  sugarValidations: string[];
  phosphateValidations: string[];
  baseValidations: string[];
} => {
  const sugarValidations: string[] = [];
  const phosphateValidations: string[] = [];
  const baseValidations: string[] = [];

  if (newPreset?.phosphate) {
    sugarValidations.push('R2');
  }
  if (newPreset?.base) {
    sugarValidations.push('R3');
  }
  baseValidations.push('R1');
  if (
    newPreset?.sugar?.props?.MonomerCaps &&
    !('R3' in newPreset.sugar.props.MonomerCaps)
  ) {
    baseValidations.push('DISABLED');
  }
  phosphateValidations.push('R1');
  if (
    newPreset?.sugar?.props?.MonomerCaps &&
    !('R2' in newPreset.sugar.props.MonomerCaps)
  ) {
    phosphateValidations.push('DISABLED');
  }

  return {
    sugarValidations,
    phosphateValidations,
    baseValidations,
  };
};
