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

import { useEffect, useState } from 'react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { SequenceType } from 'ketcher-core';
import { StyledDropdown } from 'components/modal/save/Save.styles';
import styled from '@emotion/styled';

const SequenceTypeSelector = styled(StyledDropdown)({
  width: '110px',
  marginRight: '8px',
  justifyContent: 'center',
});

const SequenceTypeSelectorTitle = styled.span<{ grey?: boolean }>((props) => ({
  marginLeft: '16px',
  color: props.theme.ketcher.color.text.light,
}));

export const SequenceTypeDropdown = () => {
  const [activeSequenceType, setActiveSequenceType] = useState<SequenceType>(
    SequenceType.RNA,
  );
  const [isSequenceEditMode, setIsSequenceEditMode] = useState(false);
  const editor = useAppSelector(selectEditor);

  const dropdownOptions = [
    { id: SequenceType.RNA, label: 'RNA' },
    { id: SequenceType.DNA, label: 'DNA' },
    { id: SequenceType.PEPTIDE, label: 'Peptide' },
  ];

  const onToggleSequenceEditMode = (_isSequenceEditMode) => {
    setIsSequenceEditMode(_isSequenceEditMode);
  };

  useEffect(() => {
    editor?.events.toggleSequenceEditMode.add(onToggleSequenceEditMode);

    return () => {
      editor?.events.toggleSequenceEditMode.remove(onToggleSequenceEditMode);
    };
  }, [editor]);

  const onSelectSequenceType = (sequenceType: string) => {
    setActiveSequenceType(sequenceType as SequenceType);
    editor.events.changeSequenceTypeEnterMode.dispatch(sequenceType);
  };

  return isSequenceEditMode ? (
    <>
      <SequenceTypeSelectorTitle>Edit mode</SequenceTypeSelectorTitle>
      <SequenceTypeSelector
        options={dropdownOptions}
        currentSelection={activeSequenceType}
        selectionHandler={onSelectSequenceType}
        testId="sequence-type-dropdown"
      />
    </>
  ) : null;
};
