import { Monomer, MonomerType } from '@utils/types';

export function createMonomerGroup<
  T extends Record<string, Omit<Monomer, 'monomerType'>>,
>(monomerType: MonomerType, group: T): { [K in keyof T]: Monomer } {
  const result = {} as { [K in keyof T]: Monomer };

  for (const key in group) {
    result[key] = {
      ...group[key],
      monomerType,
    };
  }

  return result;
}
