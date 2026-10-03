import {
  isAmbiguousMonomerLibraryItem,
  KetMonomerClass,
  type MonomerItemType,
  type MonomerOrAmbiguousType,
} from 'ketcher-core';

export const isNaturalAnalogueRequired = (
  type: KetMonomerClass | 'rnaPreset' | undefined,
) =>
  type === KetMonomerClass.AminoAcid ||
  type === KetMonomerClass.Base ||
  type === KetMonomerClass.RNA;

export const getMonomerPropertyVisibility = (
  type: KetMonomerClass | 'rnaPreset' | undefined,
) => {
  const displayNaturalAnalogue = isNaturalAnalogueRequired(type);
  const displayModificationTypes = type === KetMonomerClass.AminoAcid;
  const displayHelmAlias =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.Sugar ||
    type === KetMonomerClass.Phosphate ||
    type === KetMonomerClass.CHEM;
  const displayBilnAlias =
    type === KetMonomerClass.AminoAcid || type === KetMonomerClass.CHEM;

  return {
    displayNaturalAnalogue,
    displayModificationTypes,
    displayAliases: displayHelmAlias || displayBilnAlias,
    displayHelmAlias,
    displayBilnAlias,
  };
};

export const getOtherLibraryMonomers = (
  library: MonomerOrAmbiguousType[],
  original?: MonomerItemType,
): MonomerItemType[] =>
  library.filter((item): item is MonomerItemType => {
    if (isAmbiguousMonomerLibraryItem(item)) {
      return false;
    }
    if (!original) {
      return true;
    }
    return original.props.id !== undefined
      ? item.props.id !== original.props.id
      : item.props.MonomerName !== original.props.MonomerName ||
          item.props.MonomerClass !== original.props.MonomerClass;
  });

export const hasMonomerFieldCollision = (
  library: MonomerItemType[],
  field: 'symbol' | 'aliasHELM' | 'aliasBILN',
  value: string,
  type: KetMonomerClass | 'rnaPreset' | undefined,
  original?: MonomerItemType,
) => {
  const originalValue =
    field === 'symbol'
      ? (original?.props.MonomerCode ?? original?.props.MonomerName)
      : original?.props[field];
  if (
    originalValue === value &&
    (field !== 'symbol' || original?.props.MonomerClass === type)
  ) {
    return false;
  }
  return library.some(({ props }) => {
    if (field === 'aliasBILN') {
      return (
        (props.MonomerClass === KetMonomerClass.AminoAcid ||
          props.MonomerClass === KetMonomerClass.CHEM) &&
        props.aliasBILN === value
      );
    }
    return (
      (props.MonomerClass === type &&
        (props.MonomerName === value || props.aliasHELM === value)) ||
      (field === 'aliasHELM' && props.aliasHELM === value)
    );
  });
};

export const isValidMonomerName = (name: string, initialName?: string) =>
  name === initialName || /^[a-zA-Z0-9-_* ]*$/.test(name);
