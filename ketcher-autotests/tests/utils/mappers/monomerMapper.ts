import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { Monomer, MonomerType } from '@utils/types';

const monomersByMonomerTypes: Partial<
  Record<MonomerType, Record<string, Monomer>>
> = {
  [MonomerType.Base]: Bases,
  [MonomerType.Sugar]: Sugars,
  [MonomerType.Peptide]: Peptides,
  [MonomerType.Phosphate]: Phosphates,
  [MonomerType.UnsplitNucleotide]: Nucleotides,
  [MonomerType.CHEM]: Chem,
};

const monomerTypeByMonomer = new Map<Monomer, MonomerType>();

for (const [monomerType, monomers] of Object.entries(monomersByMonomerTypes)) {
  for (const monomer of Object.values(monomers)) {
    monomerTypeByMonomer.set(monomer, monomerType as MonomerType);
  }
}

export const getMonomerType = (monomer: Monomer) => {
  const monomerType = monomerTypeByMonomer.get(monomer);

  if (!monomerType) {
    throw new Error(`Monomer type not found for monomer ${monomer.alias}`);
  }

  return monomerType;
};
