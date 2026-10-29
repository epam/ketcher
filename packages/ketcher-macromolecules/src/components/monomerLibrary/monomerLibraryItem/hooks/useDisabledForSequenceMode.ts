import { MonomerGroups, MonomerItemType } from 'ketcher-core';
import { useSelector } from 'react-redux';
import {
<<<<<<< HEAD
  selectIsSequenceFirstsOnlyNucleotidesSelected,
  selectIsBaseModificationBlocked,
=======
  hasOnlyFirstNucleotidesSelected,
  isRnaBaseModificationBlocked,
>>>>>>> origin/master
} from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import { isRnaBuilderSequenceEditMode } from 'state/common';

const useDisabledForSequenceMode = (
  item: MonomerItemType,
  groupName?: MonomerGroups,
) => {
  const isSequenceEditInRNABuilderMode = useAppSelector(
    isRnaBuilderSequenceEditMode,
  );
  const isSequenceFirstsOnlyNucleoelementsSelected = useSelector(
    hasOnlyFirstNucleotidesSelected,
  );
  const isBaseModificationBlocked = useAppSelector(
    isRnaBaseModificationBlocked,
  );
<<<<<<< HEAD
  const isBaseModificationBlocked = useAppSelector(
    selectIsBaseModificationBlocked,
  );
=======
>>>>>>> origin/master

  if (!isSequenceEditInRNABuilderMode) return false;

  // Ambiguous monomers don't have MonomerCaps; they are handled separately and
  // must not be disabled by this hook (they lack MonomerCaps by design).
  if (!item?.props?.MonomerCaps) return false;
  if (groupName === MonomerGroups.BASES) {
    return isBaseModificationBlocked || !item?.props?.MonomerCaps?.R1;
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
