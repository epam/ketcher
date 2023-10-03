export const ALANINE = "[data-testid='A___Alanine']";

export function getFavoriteButtonSelector(molecule: string): string {
  return `${molecule} .star`;
}
