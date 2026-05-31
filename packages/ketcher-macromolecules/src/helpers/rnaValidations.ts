import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { MonomerItemType, RnaPhosphatePosition } from 'ketcher-core';

const hasCap = (
  presetPart: MonomerItemType | undefined,
  cap: 'R1' | 'R2' | 'R3',
) =>
  Boolean(
    presetPart?.props?.MonomerCaps && cap in presetPart.props.MonomerCaps,
  );

export const getPhosphatePositionAvailability = (newPreset: IRnaPreset) => {
  const is3PrimeAvailable =
    (!newPreset?.sugar || hasCap(newPreset.sugar, 'R2')) &&
    (!newPreset?.phosphate || hasCap(newPreset.phosphate, 'R1'));
  const is5PrimeAvailable =
    (!newPreset?.sugar || hasCap(newPreset.sugar, 'R1')) &&
    (!newPreset?.phosphate || hasCap(newPreset.phosphate, 'R2'));

  return { is3PrimeAvailable, is5PrimeAvailable };
};

export const getValidations = (
  newPreset: IRnaPreset,
  isEditMode: boolean,
  selectedPhosphatePosition?: RnaPhosphatePosition,
): {
  sugarValidations: string[];
  phosphateValidations: string[];
  baseValidations: string[];
} => {
  const sugarValidations: string[] = [];
  const phosphateValidations: string[] = [];
  const baseValidations: string[] = [];

  if (
    !isEditMode ||
    (!newPreset?.sugar && !newPreset?.phosphate && !newPreset?.base)
  ) {
    return {
      sugarValidations,
      phosphateValidations,
      baseValidations,
    };
  }

  const { is3PrimeAvailable, is5PrimeAvailable } =
    getPhosphatePositionAvailability(newPreset);

  if (selectedPhosphatePosition === 'right') {
    sugarValidations.push('R2');
    phosphateValidations.push('R1');
  } else if (selectedPhosphatePosition === 'left') {
    sugarValidations.push('R1');
    phosphateValidations.push('R2');
  } else {
    if (!is5PrimeAvailable) {
      phosphateValidations.push('R1');
      sugarValidations.push('R2');
    }

    if (!is3PrimeAvailable) {
      phosphateValidations.push('R2');
      sugarValidations.push('R1');
    }
  }

  if (newPreset?.base) {
    sugarValidations.push('R3');
  }
  baseValidations.push('R1');
  if (newPreset?.sugar?.props?.MonomerCaps && !hasCap(newPreset.sugar, 'R3')) {
    baseValidations.push('DISABLED');
  }

  return {
    sugarValidations,
    phosphateValidations,
    baseValidations,
  };
};
