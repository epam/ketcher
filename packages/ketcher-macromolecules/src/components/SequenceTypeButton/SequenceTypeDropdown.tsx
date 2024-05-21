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
import { useAppSelector, useLayoutMode } from 'hooks';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
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
  const [isSequenceMode, setIsSequenceMode] = useState(false);
  const editor = useAppSelector(selectEditor);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const layoutMode = useLayoutMode();
  const isDisabled = !!isSequenceEditInRNABuilderMode;

  const dropdownOptions = [
    { id: SequenceType.RNA, label: 'RNA' },
    { id: SequenceType.DNA, label: 'DNA' },
    { id: SequenceType.PEPTIDE, label: 'Peptide' },
  ];

  const onToggleSequenceMode = (data) => {
    const mode = typeof data === 'object' ? data.mode : data;
    setIsSequenceMode(mode === 'sequence-layout-mode');
  };

  useEffect(() => {
    editor?.events.selectMode.add(onToggleSequenceMode);

    return () => {
      editor?.events.selectMode.remove(onToggleSequenceMode);
    };
  }, [editor]);

  useEffect(() => {
    onToggleSequenceMode(layoutMode);
  }, [layoutMode]);

  const onSelectSequenceType = (sequenceType: string) => {
    setActiveSequenceType(sequenceType as SequenceType);
    editor.events.changeSequenceTypeEnterMode.dispatch(sequenceType);
  };

  return isSequenceMode ? (
    <>
      <SequenceTypeSelectorTitle>Type</SequenceTypeSelectorTitle>
      <SequenceTypeSelector
        options={dropdownOptions}
        currentSelection={activeSequenceType}
        selectionHandler={onSelectSequenceType}
        testId="sequence-type-dropdown"
        disabled={isDisabled}
      />
    </>
  ) : null;
};
