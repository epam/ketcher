import { MonomerGroups, MonomerItemType } from 'ketcher-core';
import { useSelector } from 'react-redux';
import { selectIsSequenceFirstsOnlyNucleotidesSelected } from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import { selectIsSequenceEditInRNABuilderMode } from 'state/common';

const useDisabledForSequenceMode = (
  item: MonomerItemType,
  groupName?: MonomerGroups,
) => {
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceFirstsOnlyNucleoelementsSelected = useSelector(
    selectIsSequenceFirstsOnlyNucleotidesSelected,
  );

  if (!isSequenceEditInRNABuilderMode) return false;

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
