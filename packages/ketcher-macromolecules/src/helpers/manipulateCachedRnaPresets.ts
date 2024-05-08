import { IRnaLabeledPreset, IRnaPreset } from 'ketcher-core';
import { localStorageWrapper } from './localStorage';
import { CUSTOM_PRESETS } from '../constants';
import omit from 'lodash/omit';

// Get custom presets from LocalStorage
export const getCachedCustomRnaPresets = (): IRnaLabeledPreset[] | undefined =>
  localStorageWrapper.getItem(CUSTOM_PRESETS);

const getPresetIndexInList = (name?: string): number => {
  const presets = getCachedCustomRnaPresets();
  return presets?.findIndex((cachedPreset) => cachedPreset.name === name) ?? -1;
};

// Save or update custom preset in LocalStorage
export const setCachedCustomRnaPreset = (
  preset: IRnaPreset | IRnaLabeledPreset,
) => {
  const presetToSet = { ...preset };
  const cachedPresets = getCachedCustomRnaPresets() || [];
  const isLabeledPreset =
    typeof presetToSet.sugar === 'string' ||
    typeof presetToSet.base === 'string' ||
    typeof presetToSet.phosphate === 'string';
  const fieldsToLabel = ['sugar', 'base', 'phosphate'];
  const newLabeledPreset = isLabeledPreset
    ? (presetToSet as IRnaLabeledPreset)
    : (omit(presetToSet, fieldsToLabel) as Partial<IRnaLabeledPreset>);

  if (!isLabeledPreset) {
    for (const monomerName of fieldsToLabel) {
      newLabeledPreset[monomerName] = presetToSet[monomerName]?.label;
    }
  }

  const presetIndexInCachedList = getPresetIndexInList(
    newLabeledPreset.nameInList,
  );

  newLabeledPreset.nameInList = newLabeledPreset.name;

  if (presetIndexInCachedList > -1) {
    cachedPresets.splice(presetIndexInCachedList, 1, newLabeledPreset);
    localStorageWrapper.setItem(CUSTOM_PRESETS, cachedPresets);
  } else {
    localStorageWrapper.setItem(CUSTOM_PRESETS, [
      ...cachedPresets,
      newLabeledPreset,
    ]);
  }
};

// Delete custom preset from LocalStorage
export const deleteCachedCustomRnaPreset = (presetName?: string) => {
  if (!presetName) return;

  const cachedPresets = getCachedCustomRnaPresets();
  const presetIndexInCachedList = getPresetIndexInList(presetName);

  if (cachedPresets) {
    cachedPresets.splice(presetIndexInCachedList, 1);

    if (cachedPresets.length)
      localStorageWrapper.setItem(CUSTOM_PRESETS, cachedPresets);
    else localStorageWrapper.removeItem(CUSTOM_PRESETS);
  }
};

// Toggle 'favorite' field in custom preset from LocalStorage
export const toggleCachedCustomRnaPresetFavorites = (presetName?: string) => {
  if (!presetName) return;

  const cachedPresets = getCachedCustomRnaPresets();
  const presetIndexInCachedList = getPresetIndexInList(presetName);

  if (cachedPresets && presetIndexInCachedList > -1) {
    cachedPresets[presetIndexInCachedList].favorite =
      !cachedPresets[presetIndexInCachedList].favorite;
    localStorageWrapper.setItem(CUSTOM_PRESETS, cachedPresets);
  }
};
