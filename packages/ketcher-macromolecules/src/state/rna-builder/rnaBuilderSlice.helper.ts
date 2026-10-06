import omit from 'lodash/omit';
import {
  buildRnaPresetConnections,
  getRnaPresetPhosphatePosition,
  IRnaLabeledPreset,
  IRnaPreset,
  RnaPresetWithOptionalFields,
  MonomerItemType,
  setAmbiguousMonomerTemplatePrefix,
  setMonomerTemplatePrefix,
} from 'ketcher-core';
import { IRnaPreset as IRnaPresetWithAliases } from 'components/monomerLibrary/RnaBuilder/types';

// Returns null when any component id is missing so that incomplete presets
// (which can be saved without a base or phosphate) never match each other or a
// default preset through empty-string keys like "||".
const getPresetComponentsKey = (
  preset: IRnaPresetWithAliases,
): string | null => {
  const getComponentId = (monomer?: MonomerItemType) =>
    monomer?.props?.id ?? '';

  const ids = [preset.sugar, preset.base, preset.phosphate].map(getComponentId);
  if (ids.some((id) => !id)) {
    return null;
  }

  return ids.join('|');
};

// A newly created custom preset has no IDT alias of its own. When it is built
// from the same monomers as one of the default library presets, copy that
// default preset's IDT alias (and AxoLabs alias) so the preview tooltip shows
// it. Only fields the preset is missing are filled in; existing aliases are
// left untouched.
export const deriveRnaPresetAliasesFromDefaults = (
  preset: IRnaPresetWithAliases,
  defaultPresets: ReadonlyArray<IRnaPresetWithAliases>,
): Partial<Pick<IRnaPresetWithAliases, 'idtAliases' | 'aliasAxoLabs'>> => {
  if (preset.idtAliases && preset.aliasAxoLabs) {
    return {};
  }

  const presetKey = getPresetComponentsKey(preset);
  if (presetKey === null) {
    return {};
  }

  const matchingDefaultPreset = defaultPresets.find(
    (defaultPreset) => getPresetComponentsKey(defaultPreset) === presetKey,
  );

  if (!matchingDefaultPreset) {
    return {};
  }

  return {
    ...(!preset.idtAliases &&
      matchingDefaultPreset.idtAliases && {
        idtAliases: matchingDefaultPreset.idtAliases,
      }),
    ...(!preset.aliasAxoLabs &&
      matchingDefaultPreset.aliasAxoLabs && {
        aliasAxoLabs: matchingDefaultPreset.aliasAxoLabs,
      }),
  };
};

// transform preset from IRnaPreset to IRnaLabeledPreset
export const transformRnaPresetToRnaLabeledPreset = (
  rnaPreset: IRnaPreset,
): IRnaLabeledPreset => {
  const fieldsToLabel = ['sugar', 'base', 'phosphate'];
  const rnaLabeledPreset = omit(rnaPreset, fieldsToLabel) as IRnaLabeledPreset;

  rnaLabeledPreset.templates = [];
  for (const monomerName of fieldsToLabel) {
    const monomerLibraryItem = rnaPreset[monomerName];
    const templateId = monomerLibraryItem?.props?.id ?? monomerLibraryItem?.id;

    if (!templateId) continue;

    rnaLabeledPreset.templates.push({
      $ref: monomerLibraryItem.isAmbiguous
        ? setAmbiguousMonomerTemplatePrefix(templateId)
        : setMonomerTemplatePrefix(templateId),
    });
  }

  rnaLabeledPreset.connections = buildRnaPresetConnections(
    rnaPreset as RnaPresetWithOptionalFields,
    getRnaPresetPhosphatePosition(rnaPreset as RnaPresetWithOptionalFields),
  );

  return rnaLabeledPreset;
};
