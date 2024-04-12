import { MonomerGroups, MonomerItemType } from 'ketcher-core';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectIsSequenceFirstsOnlyNucleotidesSelected } from 'state/rna-builder';
import { useSequenceEditInRNABuilderMode } from 'hooks';

const useDisabledForSequenceMode = (
  item: MonomerItemType,
  groupName?: MonomerGroups,
) => {
  const isSequenceEditInRNABuilderMode = useSequenceEditInRNABuilderMode();
  const isSequenceFirstsOnlyNucleotidesSelected = useSelector(
    selectIsSequenceFirstsOnlyNucleotidesSelected,
  );
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!isSequenceEditInRNABuilderMode) return setIsDisabled(false);

    if (groupName === MonomerGroups.BASES) {
      setIsDisabled(!item?.props?.MonomerCaps?.R1);
    } else if (groupName === MonomerGroups.PHOSPHATES) {
      setIsDisabled(
        !(item?.props?.MonomerCaps?.R1 && item?.props?.MonomerCaps?.R2),
      );
    } else if (groupName === MonomerGroups.SUGARS) {
      if (isSequenceFirstsOnlyNucleotidesSelected) {
        setIsDisabled(
          !(item?.props?.MonomerCaps?.R3 && item?.props?.MonomerCaps?.R2),
        );
      } else {
        setIsDisabled(
          !(
            item?.props?.MonomerCaps?.R3 &&
            item?.props?.MonomerCaps?.R2 &&
            item?.props?.MonomerCaps?.R1
          ),
        );
      }
    }
  }, [
    groupName,
    isSequenceEditInRNABuilderMode,
    isSequenceFirstsOnlyNucleotidesSelected,
    item?.props?.MonomerCaps?.R1,
    item?.props?.MonomerCaps?.R2,
    item?.props?.MonomerCaps?.R3,
    setIsDisabled,
  ]);

  return isDisabled;
};

export default useDisabledForSequenceMode;
