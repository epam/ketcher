import {
  MonomerGroups,
  MonomerOrAmbiguousType,
  isAmbiguousMonomerLibraryItem,
  KetMonomerClass,
} from 'ketcher-core';
import { useSelector } from 'react-redux';
import {
  selectIsSequenceFirstsOnlyNucleotidesSelected,
  selectIsBaseModificationDisabled,
} from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import { selectIsSequenceEditInRNABuilderMode } from 'state/common';

const useDisabledForSequenceMode = (
  item: MonomerOrAmbiguousType,
  groupName?: MonomerGroups,
) => {
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceFirstsOnlyNucleoelementsSelected = useSelector(
    selectIsSequenceFirstsOnlyNucleotidesSelected,
  );
  const isBaseModificationDisabled = useAppSelector(
    selectIsBaseModificationDisabled,
  );

  if (!isSequenceEditInRNABuilderMode) return false;

  if (
    isBaseModificationDisabled &&
    (groupName === MonomerGroups.BASES ||
      (isAmbiguousMonomerLibraryItem(item) &&
        item.monomers[0]?.monomerItem.props.MonomerClass ===
          KetMonomerClass.Base))
  ) {
    return true;
  }

  // Ambiguous monomers don't have MonomerCaps; they are handled separately and
  // must not be disabled by this hook (they lack MonomerCaps by design).
  if (isAmbiguousMonomerLibraryItem(item) || !item?.props?.MonomerCaps)
    return false;
  if (groupName === MonomerGroups.BASES) {
    return !item?.props?.MonomerCaps?.R1;
  } else if (groupName === MonomerGroups.PHOSPHATES) {
    return !(item?.props?.MonomerCaps?.R1 && item?.props?.MonomerCaps?.R2);
  } else if (groupName === MonomerGroups.SUGARS) {
    if (isSequenceFirstsOnlyNucleoelementsSelected) {
      return !(item?.props?.MonomerCaps?.R3 && item?.props?.MonomerCaps?.R2);
    } else {
      return !(
        item?.props?.MonomerCaps?.R3 &&
        item?.props?.MonomerCaps?.R2 &&
        item?.props?.MonomerCaps?.R1
      );
    }
  }

  return false;
};

export default useDisabledForSequenceMode;
