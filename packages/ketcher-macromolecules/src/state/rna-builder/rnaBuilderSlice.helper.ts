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

// Build a key identifying the sugar/base/phosphate components of a preset so
// that two presets built from the same monomers can be recognized as equal.
const getPresetComponentsKey = (preset: IRnaPresetWithAliases): string => {
  const getComponentId = (monomer?: MonomerItemType) =>
    monomer?.props?.id ?? '';

  return [
    getComponentId(preset.sugar),
    getComponentId(preset.base),
    getComponentId(preset.phosphate),
  ].join('|');
};

// A newly created custom preset has no IDT alias of its own. When it is built
// from the same monomers as one of the default library presets, reuse that
// preset's IDT alias (and AxoLabs alias) so the preview tooltip shows it. This
// mirrors the behavior of duplicating a preset, where the aliases are kept.
export const deriveRnaPresetAliasesFromDefaults = (
  preset: IRnaPresetWithAliases,
  defaultPresets: ReadonlyArray<IRnaPresetWithAliases>,
): Partial<Pick<IRnaPresetWithAliases, 'idtAliases' | 'aliasAxoLabs'>> => {
  if (preset.idtAliases) {
    return {};
  }

  const presetKey = getPresetComponentsKey(preset);
  const matchingDefaultPreset = defaultPresets.find(
    (defaultPreset) => getPresetComponentsKey(defaultPreset) === presetKey,
  );

  if (!matchingDefaultPreset) {
    return {};
  }

  return {
    ...(matchingDefaultPreset.idtAliases && {
      idtAliases: matchingDefaultPreset.idtAliases,
    }),
    ...(matchingDefaultPreset.aliasAxoLabs && {
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
