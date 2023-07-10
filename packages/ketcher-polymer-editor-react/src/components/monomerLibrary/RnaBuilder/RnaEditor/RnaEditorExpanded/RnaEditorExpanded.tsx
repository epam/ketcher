/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { MonomerGroups } from 'src/constants';
import { GroupBlock } from './GroupBlock';
import {
  ButtonsContainer,
  GroupsContainer,
  NameContainer,
  NameInput,
  NameLine,
  RnaEditorExpandedContainer,
  StyledButton,
} from './styles';
import { IRnaEditorExpandedProps } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/types';
import { useState } from 'react';

export const RnaEditorExpanded = ({
  name,
  onCancel,
  onChangeName,
}: IRnaEditorExpandedProps) => {
  const groupsData = [
    {
      groupName: MonomerGroups.SUGARS,
      iconName: 'sugar',
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
    },
  ] as const;

  const [selectedGroup, setSelectedGroup] = useState<MonomerGroups>();

  const selectGroup = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
  };

  return (
    <RnaEditorExpandedContainer>
      <NameContainer>
        <NameInput
          value={name}
          placeholder="Name your structure"
          onChange={onChangeName}
        />
        <NameLine selected />
      </NameContainer>
      <GroupsContainer>
        {groupsData.map(({ groupName, iconName }) => {
          return (
            <GroupBlock
              key={groupName}
              selected={selectedGroup === groupName}
              groupName={groupName}
              iconName={iconName}
              onClick={() => selectGroup(groupName)}
            />
          );
        })}
      </GroupsContainer>
      <ButtonsContainer>
        <StyledButton onClick={onCancel}>Cancel</StyledButton>
        <StyledButton disabled>Add to Presets</StyledButton>
      </ButtonsContainer>
    </RnaEditorExpandedContainer>
  );
};
