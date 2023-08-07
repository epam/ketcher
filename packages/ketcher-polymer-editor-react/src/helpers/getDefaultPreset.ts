import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { MonomerItemType } from 'components/monomerLibrary/monomerLibraryItem/types';

const defaultPresetBases = {
  A: 'Adenine',
  C: 'Cytosine',
  G: 'Guanine',
  T: 'Thymine',
  U: 'Uracil',
};
const SUGAR = 'Ribose';
const PHOSPHATE = 'Phosphate';

export const getDefaultPresets = (
  monomers: MonomerItemType[],
): IRnaPreset[] => {
  const defaultBaseNames = Object.values(defaultPresetBases);
  const ribose = monomers.find((item) => item.props.Name === SUGAR);
  const phosphate = monomers.find((item) => item.props.Name === PHOSPHATE);
  const defaultBases = monomers.filter((item) => {
    const base = defaultBaseNames.find(
      (defaultName) => defaultName === item.props.Name,
    );
    return !!base;
  });
  let presets;
  if (ribose && phosphate) {
    presets = defaultBases.map((item) => {
      const nucleotide: IRnaPreset = {
        base: item,
        sugar: ribose,
        phosphate,
        name: item.props.MonomerName,
      };
      return nucleotide;
    });
  } else {
    presets = [];
  }
  return presets;
};
