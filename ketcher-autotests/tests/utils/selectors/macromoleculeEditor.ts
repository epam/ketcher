export const ALANINE = "[data-testid='A___Alanine']";
export const Peptides = {
  BetaAlanine: 'Bal___beta-Alanine',
  Ethylthiocysteine: 'Edc___S-ethylthiocysteine',
};

export function getFavoriteButtonSelector(molecule: string): string {
  return `${molecule} .star`;
}
