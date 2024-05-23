import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import {
  IKetMonomerGroupTemplate,
  monomerFactory,
  MonomerItemType,
  setMonomerTemplatePrefix,
  KetMonomerClass,
  IRnaLabeledPreset,
} from 'ketcher-core';
import { getMonomerUniqueKey } from 'state/library';

interface RnaPresetsTemplatesType
  extends Pick<IKetMonomerGroupTemplate, 'templates'>,
    Pick<IRnaLabeledPreset, 'default' | 'favorite' | 'name'> {}

export const getPresets = (
  monomers: MonomerItemType[],
  rnaPresetsTemplates: RnaPresetsTemplatesType[],
  isDefault?: boolean,
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

    const presetToReturn: IRnaPreset = {
      name: rnaPresetsTemplate.name,
      favorite: rnaPresetsTemplate.favorite,
      default: isDefault || rnaPresetsTemplate.default,
    };
    if (rnaBase)
      presetToReturn.base = { ...rnaBase, label: rnaBase?.props.MonomerName };
    if (ribose)
      presetToReturn.sugar = { ...ribose, label: ribose?.props.MonomerName };
    if (phosphate)
      presetToReturn.phosphate = {
        ...phosphate,
        label: phosphate?.props.MonomerName,
      };

    return presetToReturn;
  });
};
