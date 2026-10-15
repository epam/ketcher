import { AmbiguousMonomer, BaseMonomer, KetMonomerClass } from 'ketcher-core';
import type { TFunction } from 'i18next';

const DNA_TEMPLATE_NAME_PART = 'thymine';
const RNA_TEMPLATE_NAME_PART = 'uracil';

const getAmbiguousMonomerName = (
  monomer: AmbiguousMonomer,
  t: TFunction,
): string => {
  const { monomerClass, variantMonomerItem } = monomer;
  const label = variantMonomerItem.label;
  const options = variantMonomerItem.options ?? [];

  if (monomerClass === KetMonomerClass.Base) {
    const isDNA = options.some((option) =>
      option.templateId.toLowerCase().includes(DNA_TEMPLATE_NAME_PART),
    );
    const isRNA = options.some((option) =>
      option.templateId.toLowerCase().includes(RNA_TEMPLATE_NAME_PART),
    );

    if (isDNA) {
      return label === 'N'
        ? t('monomerName.anyDnaBase')
        : t('monomerName.ambiguousDnaBase');
    }
    if (isRNA) {
      return label === 'N'
        ? t('monomerName.anyRnaBase')
        : t('monomerName.ambiguousRnaBase');
    }
    // Generic ambiguous base (M, R, S, V)
    return t('monomerName.ambiguousBase');
  }

  if (monomerClass === KetMonomerClass.AminoAcid) {
    return label === 'X'
      ? t('monomerName.anyAminoAcid')
      : t('monomerName.ambiguousAminoAcid');
  }

  return t('monomerName.ambiguousGeneric', { class: monomerClass });
};

const getMonomerName = (monomer: BaseMonomer, t: TFunction) => {
  if (monomer instanceof AmbiguousMonomer) {
    return getAmbiguousMonomerName(monomer, t);
  }

  return monomer.monomerItem.props.Name;
};

export default getMonomerName;
