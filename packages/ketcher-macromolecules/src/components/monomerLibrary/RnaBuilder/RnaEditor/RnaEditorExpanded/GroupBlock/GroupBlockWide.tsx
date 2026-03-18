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
  GroupName,
  MonomerName,
  TextContainer,
} from './styles';
import { IGroupBlockProps } from './types';
import { groupNameToRnaEditorItemLabel } from './utils';
import { useAppSelector } from 'hooks';
import { selectIsEditMode } from 'state/rna-builder';
import GroupIcon from './GroupIcon';

export const GroupBlockWide = ({
  groupName,
  iconName,
  monomerName,
  selected,
  onClick,
  testid,
}: IGroupBlockProps) => {
  const isEditMode = useAppSelector(selectIsEditMode);

  const empty = !monomerName;

  return (
    <GroupBlockContainer
      selected={selected}
      onClick={onClick}
      isEditMode={isEditMode}
      data-testid={testid}
    >
      <GroupIcon name={iconName} selected={selected} empty={empty} />
      <TextContainer>
        <GroupName selected={selected}>
          {groupNameToRnaEditorItemLabel[groupName]}
        </GroupName>
        <MonomerName empty={empty} selected={selected}>
          {monomerName || 'Not selected'}
        </MonomerName>
      </TextContainer>
    </GroupBlockContainer>
  );
};
