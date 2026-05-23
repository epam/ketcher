import { KetMonomerClass } from 'ketcher-core';

export const getMonomerAttributeFieldVisibility = (
  type: KetMonomerClass | 'rnaPreset' | undefined,
) => {
  const displayNaturalAnalogue =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.RNA;
  const displayModificationTypes = type === KetMonomerClass.AminoAcid;
  const displayHelmAlias =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.Sugar ||
    type === KetMonomerClass.Phosphate;
  const displayBilnAlias = false;

  return {
    displayNaturalAnalogue,
    displayModificationTypes,
    displayAliases: displayHelmAlias || displayBilnAlias,
    displayHelmAlias,
    displayBilnAlias,
  };
};
