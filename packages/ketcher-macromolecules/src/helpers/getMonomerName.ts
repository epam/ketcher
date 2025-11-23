import { AmbiguousMonomer, BaseMonomer, KetMonomerClass } from 'ketcher-core';
import { DNA_TEMPLATE_NAME_PART, RNA_TEMPLATE_NAME_PART } from '../constants';

const getMonomerName = (monomer: BaseMonomer) => {
  if (monomer instanceof AmbiguousMonomer) {
    const { label, monomerClass, variantMonomerItem } = monomer;

    // For Amino Acids
    if (monomerClass === KetMonomerClass.AminoAcid) {
      if (label === 'X') {
        return 'Any Amino acid';
      }
      if (['B', 'J', 'Z'].includes(label)) {
        return 'Ambiguous Amino acid';
      }
    }

    // For Bases (DNA/RNA)
    if (monomerClass === KetMonomerClass.Base) {
      // Check if it's DNA or RNA by checking the template IDs
      const isDNA = variantMonomerItem.options.some((option) =>
        option.templateId.toLowerCase().includes(DNA_TEMPLATE_NAME_PART),
      );
      const isRNA = variantMonomerItem.options.some((option) =>
        option.templateId.toLowerCase().includes(RNA_TEMPLATE_NAME_PART),
      );

      // DNA-specific labels (only if it's DNA and not RNA)
      if (isDNA && !isRNA && label === 'N') {
        return 'Any DNA base';
      }
      if (isDNA && !isRNA && ['B', 'D', 'H', 'K', 'W', 'Y'].includes(label)) {
        return 'Ambiguous DNA Base';
      }

      // RNA-specific labels (only if it's RNA and not DNA)
      if (isRNA && !isDNA && label === 'N') {
        return 'Any RNA Base';
      }
      if (isRNA && !isDNA && ['B', 'D', 'H', 'K', 'W', 'Y'].includes(label)) {
        return 'Ambiguous RNA Base';
      }

      // For generic bases (neither DNA nor RNA specific, or both)
      if (['M', 'R', 'S', 'V'].includes(label)) {
        return 'Ambiguous Base';
      }

      // For mixed DNA/RNA or other ambiguous cases with N, B, D, H, K, W, Y
      if (['N', 'B', 'D', 'H', 'K', 'W', 'Y'].includes(label)) {
        // If both DNA and RNA, or neither, fall back to generic label
        return 'Ambiguous Base';
      }
    }

    // Default fallback
    return `Ambiguous ${monomerClass}`;
  }

  return monomer.monomerItem.props.Name;
};

export default getMonomerName;
