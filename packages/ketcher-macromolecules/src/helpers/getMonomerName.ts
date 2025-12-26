import { AmbiguousMonomer, BaseMonomer, KetMonomerClass } from 'ketcher-core';

const DNA_TEMPLATE_NAME_PART = 'thymine';
const RNA_TEMPLATE_NAME_PART = 'uracil';

const getAmbiguousMonomerName = (monomer: AmbiguousMonomer): string => {
  const { monomerClass, variantMonomerItem } = monomer;
  const label = variantMonomerItem.label;
  const options = variantMonomerItem.options || [];

  if (monomerClass === KetMonomerClass.Base) {
    const isDNA = options.some((option) =>
      option.templateId.toLowerCase().includes(DNA_TEMPLATE_NAME_PART),
    );
    const isRNA = options.some((option) =>
      option.templateId.toLowerCase().includes(RNA_TEMPLATE_NAME_PART),
    );

    if (isDNA) {
      return label === 'N' ? 'Any DNA base' : 'Ambiguous DNA Base';
    }
    if (isRNA) {
      return label === 'N' ? 'Any RNA Base' : 'Ambiguous RNA Base';
    }
    // Generic ambiguous base (M, R, S, V)
    return 'Ambiguous Base';
  }

  if (monomerClass === KetMonomerClass.AminoAcid) {
    return label === 'X' ? 'Any Amino acid' : 'Ambiguous Amino acid';
  }

  return `Ambiguous ${monomerClass}`;
};

const getMonomerName = (monomer: BaseMonomer) => {
  if (monomer instanceof AmbiguousMonomer) {
    return getAmbiguousMonomerName(monomer);
  }

  return monomer.monomerItem.props.Name;
};

export default getMonomerName;
