import { RnaBuilderItem } from 'state/rna-builder';
import { GroupsData } from './hooks/useGroupsData';
import { LibraryNameType } from '../../../../constants';
import { IRnaPreset } from 'ketcher-core';

export type RnaElementsViewProps = {
  activeRnaBuilderItem: RnaBuilderItem;
  groupsData: GroupsData;
  onSelectItem: (...args) => void;
  onNewPresetClick: VoidFunction;
  libraryName: LibraryNameType;
  duplicatePreset: (preset?: IRnaPreset) => void;
  editPreset: (preset: IRnaPreset) => void;
};
