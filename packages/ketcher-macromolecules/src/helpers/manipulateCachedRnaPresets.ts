import { IRnaLabeledPreset } from 'ketcher-core';
import { localStorageWrapper } from './localStorage';
import { CUSTOM_PRESETS } from '../constants';

// Get custom presets from LocalStorage
export const getCachedCustomRnaPresets = (): IRnaLabeledPreset[] | undefined =>
  localStorageWrapper.getItem(CUSTOM_PRESETS);

const getPresetIndexInList = (name?: string): number => {
  const presets = getCachedCustomRnaPresets();
  return presets?.findIndex((cachedPreset) => cachedPreset.name === name) ?? -1;
};

// Save or update custom preset in LocalStorage
export const setCachedCustomRnaPreset = (preset: IRnaLabeledPreset) => {
  const presetToSet = { ...preset };
  const cachedPresets = getCachedCustomRnaPresets() || [];

  const presetIndexInCachedList = getPresetIndexInList(presetToSet.nameInList);

  presetToSet.nameInList = presetToSet.name;

  if (presetIndexInCachedList > -1) {
    cachedPresets.splice(presetIndexInCachedList, 1, presetToSet);
    localStorageWrapper.setItem(CUSTOM_PRESETS, cachedPresets);
  } else {
    localStorageWrapper.setItem(CUSTOM_PRESETS, [
      ...cachedPresets,
      presetToSet,
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
