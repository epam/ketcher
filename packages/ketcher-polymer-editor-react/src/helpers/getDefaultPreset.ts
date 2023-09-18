import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { MonomerItemType } from 'ketcher-core';

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
    presets = defaultBases.map((base) => {
      const nucleotide: IRnaPreset = {
        base: { ...base, label: base.props.MonomerName },
        sugar: { ...ribose, label: ribose.props.MonomerName },
        phosphate: { ...phosphate, label: phosphate.props.MonomerName },
        name: base.props.MonomerName,
      };
      return nucleotide;
    });
  } else {
    presets = [];
  }
  return presets;
};
