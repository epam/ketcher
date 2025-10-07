import {
  IRnaLabeledPreset,
  IRnaPreset,
  setAmbiguousMonomerTemplatePrefix,
  setMonomerTemplatePrefix,
} from 'ketcher-core';

// transform preset from IRnaPreset to IRnaLabeledPreset
export const transformRnaPresetToRnaLabeledPreset = (rnaPreset: IRnaPreset) => {
  const fieldsToLabel = ['sugar', 'base', 'phosphate'] as const;
  const { sugar, base, phosphate, ...rest } = rnaPreset;
  const monomerEntries = { sugar, base, phosphate };
  const rnaLabeledPreset: IRnaLabeledPreset = {
    ...rest,
    templates: [],
  };

  for (const monomerName of fieldsToLabel) {
    const monomerLibraryItem = monomerEntries[monomerName];
    const templateId = monomerLibraryItem?.props?.id || monomerLibraryItem?.id;

    if (!templateId) continue;

    rnaLabeledPreset.templates.push({
      $ref: monomerLibraryItem.isAmbiguous
        ? setAmbiguousMonomerTemplatePrefix(templateId)
        : setMonomerTemplatePrefix(templateId),
    });
  }

  return rnaLabeledPreset;
};
