import { RnaBuilderItem } from 'state/rna-builder';
import { GroupsData } from './hooks/useGroupsData';
import { LibraryNameType } from '../../../../constants';
import { IRnaPreset } from 'ketcher-core';

export type RnaElementsViewProperties = {
  activeRnaBuilderItem: RnaBuilderItem;
  groupsData: GroupsData;
  onSelectItem: (...arguments_) => void;
  onNewPresetClick: VoidFunction;
  libraryName: LibraryNameType;
  duplicatePreset: (preset?: IRnaPreset) => void;
  editPreset: (preset: IRnaPreset) => void;
};
