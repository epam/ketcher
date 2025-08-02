import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from 'hooks';
import {
  createNewPreset,
  setActivePresetMonomerGroup,
  setActiveRnaBuilderItem,
  setIsEditMode,
  selectActivePreset,
  selectActiveRnaBuilderItem,
  selectIsEditMode,
  RnaBuilderPresetsItem,
  setActiveMonomerKey,
} from 'state/rna-builder';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import { LibraryNameType } from 'src/constants';
import { IRnaPreset, isAmbiguousMonomerLibraryItem } from 'ketcher-core';

import { RnaAccordionContainer } from './styles';
import { useDispatch } from 'react-redux';
import { useGroupsData } from './hooks/useGroupsData';
import RnaElementsTabsView from './RnaElementsTabsView';
import RnaElementsAccordionView from './RnaElementsAccordionView';
import { getMonomerUniqueKey } from 'state/library';

interface RnaUnifiedViewProps {
  view: 'tabs' | 'accordion';
  libraryName: LibraryNameType;
  duplicatePreset: (preset?: IRnaPreset) => void;
  editPreset: (preset: IRnaPreset) => void;
}

export const RnaElements = ({
  view,
  libraryName,
  duplicatePreset,
  editPreset,
}: RnaUnifiedViewProps) => {
  const dispatch = useDispatch();

  const activeRnaBuilderItem = useAppSelector(selectActiveRnaBuilderItem);
  const activePreset = useAppSelector(selectActivePreset);
  const isEditMode = useAppSelector(selectIsEditMode);
  const editor = useAppSelector(selectEditor);

  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );

  const [newPreset, setNewPreset] = useState(activePreset);

  useEffect(() => {
    dispatch(
      setActiveRnaBuilderItem(
        isEditMode && activePreset
          ? activeRnaBuilderItem
          : RnaBuilderPresetsItem.Presets,
      ),
    );
  }, [isEditMode]);

  const groupsData = useGroupsData(libraryName);

  const handleNewPresetClick = useCallback(() => {
    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
    dispatch(setIsEditMode(true));
  }, [dispatch]);

  const handleItemSelection = useCallback(
    (monomer, groupName) => {
      if (isEditMode) {
        dispatch(setActiveMonomerKey(getMonomerUniqueKey(monomer)));
      }

      if (!isSequenceEditInRNABuilderMode && !isEditMode) {
        editor?.events.selectMonomer.dispatch(monomer);
      }

      if (!isEditMode) {
        return;
      }

      const monomerClass = isAmbiguousMonomerLibraryItem(monomer)
        ? monomer.monomers[0].monomerItem.props.MonomerClass?.toLowerCase()
        : monomer.props.MonomerClass.toLowerCase();
      const currentPreset = {
        ...newPreset,
        [monomerClass]: monomer,
      };
      setNewPreset(currentPreset);
      dispatch(setActivePresetMonomerGroup({ groupName, groupItem: monomer }));
      dispatch(setActiveRnaBuilderItem(groupName));
    },
    [dispatch, editor, isEditMode, isSequenceEditInRNABuilderMode, newPreset],
  );

  return (
    <RnaAccordionContainer data-testid="rna-accordion">
      {view === 'tabs' ? (
        <RnaElementsTabsView
          activeRnaBuilderItem={activeRnaBuilderItem}
          groupsData={groupsData}
          onNewPresetClick={handleNewPresetClick}
          onSelectItem={handleItemSelection}
          libraryName={libraryName}
          editPreset={editPreset}
          duplicatePreset={duplicatePreset}
        />
      ) : (
        <RnaElementsAccordionView
          activeRnaBuilderItem={activeRnaBuilderItem}
          groupsData={groupsData}
          newPreset={newPreset}
          onNewPresetClick={handleNewPresetClick}
          onSelectItem={handleItemSelection}
          libraryName={libraryName}
          editPreset={editPreset}
          duplicatePreset={duplicatePreset}
        />
      )}
    </RnaAccordionContainer>
  );
};
