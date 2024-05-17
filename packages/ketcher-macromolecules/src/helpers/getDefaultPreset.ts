import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import {
  IKetMonomerGroupTemplate,
  monomerFactory,
  MonomerItemType,
  setMonomerTemplatePrefix,
  KetMonomerClass,
} from 'ketcher-core';
import { getMonomerUniqueKey } from 'state/library';

export const getDefaultPresets = (
  monomers: MonomerItemType[],
  rnaPresetsTemplates: IKetMonomerGroupTemplate[],
): IRnaPreset[] => {
  const monomerIdToMonomerLibraryItem = {};

  monomers.forEach((monomer) => {
    const monomerKey = getMonomerUniqueKey(monomer);
    monomerIdToMonomerLibraryItem[setMonomerTemplatePrefix(monomerKey)] =
      monomer;
  });

  return rnaPresetsTemplates.map((rnaPresetsTemplate) => {
    const rnaPartsMonomerLibraryItems = rnaPresetsTemplate.templates.map(
      (rnaPartsMonomerTemplateRef) =>
        monomerIdToMonomerLibraryItem[rnaPartsMonomerTemplateRef.$ref],
    );
    const rnaPartsMonomerTemplatesClasses = rnaPartsMonomerLibraryItems.map(
      (rnaPartsMonomerLibraryItem) =>
        monomerFactory(rnaPartsMonomerLibraryItem)[2],
    );
    const ribose =
      rnaPartsMonomerLibraryItems[
        rnaPartsMonomerTemplatesClasses.findIndex(
          (rnaPartsMonomerTemplatesClass) =>
            rnaPartsMonomerTemplatesClass === KetMonomerClass.Sugar,
        )
      ];
    const rnaBase =
      rnaPartsMonomerLibraryItems[
        rnaPartsMonomerTemplatesClasses.findIndex(
          (rnaPartsMonomerTemplatesClass) =>
            rnaPartsMonomerTemplatesClass === KetMonomerClass.Base,
        )
      ];
    const phosphate =
      rnaPartsMonomerLibraryItems[
        rnaPartsMonomerTemplatesClasses.findIndex(
          (rnaPartsMonomerTemplatesClass) =>
            rnaPartsMonomerTemplatesClass === KetMonomerClass.Phosphate,
        )
      ];
    return {
      base: { ...rnaBase, label: rnaBase.props.MonomerName },
      sugar: { ...ribose, label: ribose.props.MonomerName },
      phosphate: { ...phosphate, label: phosphate.props.MonomerName },
      name: rnaPresetsTemplate.name,
      default: true,
    };
  });
};
