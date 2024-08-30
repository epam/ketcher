import omit from 'lodash/omit';
import {
  IRnaLabeledPreset,
  IRnaPreset,
  setAmbiguousMonomerTemplatePrefix,
  setMonomerTemplatePrefix,
} from 'ketcher-core';

// transform preset from IRnaPreset to IRnaLabeledPreset
export const transformRnaPresetToRnaLabeledPreset = (rnaPreset: IRnaPreset) => {
  const fieldsToLabel = ['sugar', 'base', 'phosphate'];
  const rnaLabeledPreset = omit(
    rnaPreset,
    fieldsToLabel,
  ) as Partial<IRnaLabeledPreset>;

  rnaLabeledPreset.templates = [];
  for (const monomerName of fieldsToLabel) {
    const monomerLibraryItem = rnaPreset[monomerName];
    const templateId = monomerLibraryItem?.props?.id || monomerLibraryItem?.id;

    if (!templateId) continue;

    rnaLabeledPreset.templates.push({
      $ref: monomerLibraryItem.isAmbiguous
        ? setAmbiguousMonomerTemplatePrefix(templateId)
        : setMonomerTemplatePrefix(templateId),
    });
  }

  return rnaLabeledPreset as IRnaLabeledPreset;
};
