import omit from 'lodash/omit';
import {
  IRnaLabeledPreset,
  IRnaPreset,
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
    if (!rnaPreset[monomerName]?.props?.id) continue;
    rnaLabeledPreset.templates.push({
      $ref: setMonomerTemplatePrefix(rnaPreset[monomerName].props.id),
    });
  }

  return rnaLabeledPreset as IRnaLabeledPreset;
};
