export const ALANINE = "[data-testid='A___Alanine']";
export const Peptides = {
  BetaAlanine: 'bAla___beta-Alanine',
  Ethylthiocysteine: 'Edc___S-ethylthiocysteine',
  Tza: 'Tza___3-(4-Thiazolyl)-alanine',
  D2Nal: 'D-2Nal___D-3-(2-naphtyl)-alanine',
};

export const Chems = {
  SMPEG2: 'SMPEG2___SM(PEG)2',
  hxy: 'hxy___5-hexyn-1-ol',
};

export function getFavoriteButtonSelector(molecule: string): string {
  return `${molecule} .star`;
}
