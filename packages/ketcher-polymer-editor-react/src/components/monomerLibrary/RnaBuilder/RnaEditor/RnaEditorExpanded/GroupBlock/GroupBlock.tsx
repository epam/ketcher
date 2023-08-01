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

import {
  GroupBlockContainer,
  GroupIcon,
  GroupName,
  MonomerName,
  TextContainer,
} from './styles';
import { IGroupBlockProps } from './types';
import { groupNameToLabel, groupNameToRnaEditorItemLabel } from './utils';
import { useAppSelector } from 'hooks';
import { selectIsEditMode } from 'state/rna-builder';

export const GroupBlock = ({
  groupName,
  iconName,
  monomerName,
  selected,
  onClick,
}: IGroupBlockProps) => {
  const isEditMode = useAppSelector(selectIsEditMode);

  return (
    <GroupBlockContainer
      selected={selected}
      onClick={onClick}
      empty={!monomerName}
      isEditMode={isEditMode}
    >
      <GroupIcon empty={!monomerName} selected={selected} name={iconName} />
      <TextContainer>
        <GroupName>{groupNameToRnaEditorItemLabel[groupName]}</GroupName>
        <MonomerName empty={!monomerName} selected={selected}>
          {monomerName ||
            (selected ? groupNameToLabel[groupName] : 'Not selected')}
        </MonomerName>
      </TextContainer>
    </GroupBlockContainer>
  );
};
