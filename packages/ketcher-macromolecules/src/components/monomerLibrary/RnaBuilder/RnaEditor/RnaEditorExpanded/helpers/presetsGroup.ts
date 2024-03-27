import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';

const getPresetsMonomerGroupName = (nameSet): string => {
  return nameSet.size === 1 ? [...nameSet][0] : '[multiple]';
};

export const generatePresetsGroupNames = (presets: IRnaPreset[]) => {
  if (!presets?.length) return;

  const namesSets = {
    sugar: new Set(),
    base: new Set(),
    phosphate: new Set(),
  };

  for (let i = 0; i < presets.length; i++) {
    for (const item of ['sugar', 'base', 'phosphate'])
      namesSets[item].add(
        presets[i]?.[item]?.label || presets[i]?.[item]?.props.MonomerName,
      );
  }

  return {
    Sugars: getPresetsMonomerGroupName(namesSets.sugar),
    Bases: getPresetsMonomerGroupName(namesSets.base),
    Phosphates: getPresetsMonomerGroupName(namesSets.phosphate),
  };
};
