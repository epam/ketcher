export function entityNotFoundMessage(entityName: string, id: number): string {
  return `${entityName} ${id} not found`;
}

export function atomsForBondNotFoundMessage(
  bondId: number,
  beginAtomId: number,
  endAtomId: number,
): string {
  return `Atom(s) for bond ${bondId} not found: begin=${beginAtomId}, end=${endAtomId}`;
}
