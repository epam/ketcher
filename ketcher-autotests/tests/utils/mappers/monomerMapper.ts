import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Monomer, MonomerType } from '@utils/types';

const monomersByMonomerTypes: Partial<
  Record<MonomerType, Record<string, Monomer>>
> = {
  [MonomerType.Base]: Base,
  [MonomerType.Sugar]: Sugar,
  [MonomerType.Peptide]: Peptide,
  [MonomerType.Phosphate]: Phosphate,
  [MonomerType.UnsplitNucleotide]: Nucleotide,
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
