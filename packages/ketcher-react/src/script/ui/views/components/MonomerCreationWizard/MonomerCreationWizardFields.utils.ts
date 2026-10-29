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
  const shouldDisplayNaturalAnalogue = isNaturalAnalogueRequired(type);
  const shouldDisplayModificationTypes = type === KetMonomerClass.AminoAcid;
  const shouldDisplayHelmAlias =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.Sugar ||
    type === KetMonomerClass.Phosphate ||
    type === KetMonomerClass.CHEM;
  const shouldDisplayBilnAlias =
    type === KetMonomerClass.AminoAcid || type === KetMonomerClass.CHEM;

  return {
    displayNaturalAnalogue: shouldDisplayNaturalAnalogue,
    displayModificationTypes: shouldDisplayModificationTypes,
    displayAliases: shouldDisplayHelmAlias || shouldDisplayBilnAlias,
    displayHelmAlias: shouldDisplayHelmAlias,
    displayBilnAlias: shouldDisplayBilnAlias,
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
<<<<<<< HEAD
    return original.props.id !== undefined
      ? item.props.id !== original.props.id
      : item.props.MonomerName !== original.props.MonomerName ||
          item.props.MonomerClass !== original.props.MonomerClass;
=======
    return original.props.id === undefined
      ? item.props.MonomerName !== original.props.MonomerName ||
          item.props.MonomerClass !== original.props.MonomerClass
      : item.props.id !== original.props.id;
>>>>>>> origin/master
  });

/*
 * A HELM alias only has to be unique within the polymer type it is written
 * under, because that is the scope HELM resolves it in. Sugars, bases and
 * phosphates share the RNA polymer type, so they share one namespace, while
 * peptides and CHEM monomers each have their own. That is why an amino acid
 * such as 1Nal does not block a base with the same HELM alias.
 */
const getHelmNamespace = (type: KetMonomerClass | 'rnaPreset' | undefined) => {
  switch (type) {
    case KetMonomerClass.AminoAcid:
      return 'peptide';
    case KetMonomerClass.Sugar:
    case KetMonomerClass.Base:
    case KetMonomerClass.Phosphate:
    case KetMonomerClass.RNA:
      return 'rna';
    case KetMonomerClass.CHEM:
      return 'chem';
    default:
      // Unrecognised classes keep their own namespace rather than losing the check.
      return type;
  }
};

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
<<<<<<< HEAD
  const scopeUnchanged =
=======
  const isScopeUnchanged =
>>>>>>> origin/master
    field === 'symbol'
      ? original?.props.MonomerClass === type
      : field === 'aliasBILN' ||
        getHelmNamespace(original?.props.MonomerClass) ===
          getHelmNamespace(type);
<<<<<<< HEAD
  if (originalValue === value && scopeUnchanged) {
=======
  if (originalValue === value && isScopeUnchanged) {
>>>>>>> origin/master
    return false;
  }
  const helmNamespace = getHelmNamespace(type);
  return library.some(({ props }) => {
    if (field === 'aliasBILN') {
      return (
        (props.MonomerClass === KetMonomerClass.AminoAcid ||
          props.MonomerClass === KetMonomerClass.CHEM) &&
        props.aliasBILN === value
      );
    }
    if (field === 'aliasHELM') {
      return (
        getHelmNamespace(props.MonomerClass) === helmNamespace &&
        (props.MonomerName === value || props.aliasHELM === value)
      );
    }
    return (
      props.MonomerClass === type &&
      (props.MonomerName === value || props.aliasHELM === value)
    );
  });
};

export const isValidMonomerName = (name: string, initialName?: string) =>
  name === initialName || /^[a-zA-Z0-9-_* ]*$/.test(name);
