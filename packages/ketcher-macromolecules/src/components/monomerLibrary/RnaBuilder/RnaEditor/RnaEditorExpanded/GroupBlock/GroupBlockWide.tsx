/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useTranslation } from 'react-i18next';
import {
  GroupBlockContainer,
  GroupName,
  MonomerName,
  TextContainer,
} from './styles';
import { IGroupBlockProps } from './types';
import { groupNameToRnaEditorItemLabelKey } from './utils';
import { useAppSelector } from 'hooks';
import { isRnaBuilderEditMode } from 'state/rna-builder';
import GroupIcon from './GroupIcon';
import { PropsWithChildren } from 'react';

export const GroupBlockWide = ({
  groupName,
  iconName,
  monomerName,
  selected: isSelected,
  onClick,
  testid,
  children,
}: IGroupBlockProps & PropsWithChildren) => {
  const { t } = useTranslation('macromoleculesDialogs');
  const isEditMode = useAppSelector(isRnaBuilderEditMode);

  const isEmpty = !monomerName;

  return (
    <GroupBlockContainer
      selected={isSelected}
      onClick={onClick}
      isEditMode={isEditMode}
      data-testid={testid}
    >
      <>
        <GroupIcon name={iconName} selected={isSelected} empty={isEmpty} />
        <TextContainer>
          <GroupName selected={isSelected}>
            {t(groupNameToRnaEditorItemLabelKey[groupName])}
          </GroupName>
          <MonomerName empty={isEmpty} selected={isSelected}>
            {monomerName ?? t('monomerLibrary.notSelected')}
          </MonomerName>
        </TextContainer>
        {children}
      </>
    </GroupBlockContainer>
  );
};
