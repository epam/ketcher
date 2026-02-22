import { scrollToElement } from 'helpers/dom';

export const scrollToSelectedPreset = (presetName) => {
  scrollToElement(`[data-rna-preset-item-name="${presetName}"]`);
};

export const scrollToSelectedMonomer = (monomerId) => {
  scrollToElement(`[data-monomer-item-id="${monomerId}"]`);
};
