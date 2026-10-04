import { KetMonomerClass } from 'ketcher-core';
import { isNaturalAnalogueRequired } from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';

export const getMonomerPropertyVisibility = (
  type: KetMonomerClass | 'rnaPreset' | undefined,
) => {
  const displayNaturalAnalogue = isNaturalAnalogueRequired(type);
  const displayModificationTypes = type === KetMonomerClass.AminoAcid;
  const displayHelmAlias =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.Sugar ||
    type === KetMonomerClass.Phosphate ||
    type === KetMonomerClass.CHEM;
  const displayBilnAlias =
    type === KetMonomerClass.AminoAcid || type === KetMonomerClass.CHEM;

  return {
    displayNaturalAnalogue,
    displayModificationTypes,
    displayAliases: displayHelmAlias || displayBilnAlias,
    displayHelmAlias,
    displayBilnAlias,
  };
};
