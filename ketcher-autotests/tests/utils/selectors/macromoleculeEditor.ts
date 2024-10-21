export const ALANINE = "[data-testid='A___Alanine']";
export const Peptides = {
  BetaAlanine: 'bAla___beta-Alanine',
  Ethylthiocysteine: 'Edc___S-ethylthiocysteine',
  Tza: 'Tza___3-(4-Thiazolyl)-alanine',
  D2Nal: 'D-2Nal___D-3-(2-naphthyl)-alanine',
  D_OAla: 'D-OAla___D-Lactic acid',
  Phe4Me: 'Phe4Me___p-Methylphenylalanine',
  meM: 'meM___N-Methyl-Methionine',
};

export const Chems = {
  SMPEG2: 'SMPEG2___SM(PEG)2',
  hxy: 'hxy___5-hexyn-1-ol',
  Test_6_Ch: 'Test-6-Ch___Test-6-AP-Chem',
};

export function getFavoriteButtonSelector(molecule: string): string {
  return `${molecule} .star`;
}
