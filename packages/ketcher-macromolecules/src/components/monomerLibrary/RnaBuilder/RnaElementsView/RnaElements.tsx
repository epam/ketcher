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
  setSequenceSelection,
  selectSequenceSelection,
  monomerGroupToPresetGroup,
} from 'state/rna-builder';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import { LibraryNameType, MonomerGroups } from 'src/constants';
import {
  IRnaPreset,
  isAmbiguousMonomerLibraryItem,
  MonomerOrAmbiguousType,
} from 'ketcher-core';

import { RnaAccordionContainer } from './styles';
import { useDispatch } from 'react-redux';
import { useGroupsData } from './hooks/useGroupsData';
import RnaElementsTabsView from './RnaElementsTabsView';
import RnaElementsAccordionView from './RnaElementsAccordionView';
import { getMonomerUniqueKey } from 'state/library';
import { applyMonomerToSequenceSelection } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers';

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
  const sequenceSelection = useAppSelector(selectSequenceSelection);

  const [newPreset, setNewPreset] = useState(activePreset);
  // The RNA builder is reset through redux, which cannot reach this local copy
  // of the preset being built. Re-syncing it whenever the active preset or the
  // edit mode changes keeps a cancelled preset's monomers from constraining the
  // library the next time a group is expanded (#9690).
  const [prevBuilderState, setPrevBuilderState] = useState({
    activePreset,
    isEditMode,
  });

  if (
    prevBuilderState.activePreset !== activePreset ||
    prevBuilderState.isEditMode !== isEditMode
  ) {
    setPrevBuilderState({ activePreset, isEditMode });
    setNewPreset(activePreset);
  }

  useEffect(() => {
    if (!isEditMode) {
      dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
    }
  }, [isEditMode, dispatch]);

  const groupsData = useGroupsData(libraryName);

  const handleNewPresetClick = useCallback(() => {
    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
    dispatch(setIsEditMode(true));
  }, [dispatch]);

  const handleItemSelection = useCallback(
    (monomer: MonomerOrAmbiguousType, groupName) => {
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
        : monomer.props.MonomerClass?.toLowerCase();
      const currentPreset = {
        ...newPreset,
        [monomerClass as string]: monomer,
      };
      setNewPreset(currentPreset);
      dispatch(setActivePresetMonomerGroup({ groupName, groupItem: monomer }));
      dispatch(setActiveRnaBuilderItem(groupName));

      // Applying the picked monomer to the current sequence selection belongs in
      // this event handler rather than in an effect reacting to the redux update
      // (react-you-might-not-need-an-effect/no-event-handler).
      if (isSequenceEditInRNABuilderMode && sequenceSelection) {
        const field = `${monomerGroupToPresetGroup[groupName]}Label`;
        dispatch(
          setSequenceSelection(
            applyMonomerToSequenceSelection(
              sequenceSelection,
              field,
              monomer,
              groupName === MonomerGroups.BASES,
            ),
          ),
        );
      }
    },
    [
      dispatch,
      editor,
      isEditMode,
      isSequenceEditInRNABuilderMode,
      newPreset,
      sequenceSelection,
    ],
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
