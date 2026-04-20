import { scrollToElement } from 'helpers/dom';

export const scrollToSelectedPreset = (presetName: string | undefined) => {
  scrollToElement(`[data-rna-preset-item-name="${presetName}"]`);
};

export const scrollToSelectedMonomer = (monomerId: string) => {
  scrollToElement(`[data-monomer-item-id="${monomerId}"]`);
};
