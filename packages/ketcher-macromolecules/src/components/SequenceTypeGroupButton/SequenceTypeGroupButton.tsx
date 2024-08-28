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
import styled from '@emotion/styled';
import { ButtonGroup, Button, Box } from '@mui/material';

const SequenceTypeButtons = styled(Button)(({ theme, variant }) => ({
  color:
    variant === 'outlined'
      ? theme.ketcher.color.text.dark
      : theme.ketcher.color.button.text.primary,
  boxShadow: 'none',
  transition: 'none',
  border: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '4px 8px',
  outline: '1px solid #585858',
  background:
    variant === 'outlined'
      ? theme.ketcher.color.background.primary
      : theme.ketcher.color.button.primary.active,
  borderRadius: theme.ketcher.border.radius.regular,
  textTransform: 'none',
  fontSize: theme.ketcher.font.size.small,
  fontWeight: theme.ketcher.font.weight.regular,

  ':hover': {
    color: theme.ketcher.color.button.text.primary,
    background: theme.ketcher.color.button.primary.hover,
    outline: '1px solid #585858',
    border: 'none',
  },
  ':disabled': {
    cursor: 'auto',
    background: '#e1e5ea',
    outline: 'none',
  },
}));

export const SequenceTypeGroupButton = () => {
  const editor = useAppSelector(selectEditor);

  const [activeSequenceType, setActiveSequenceType] = useState<SequenceType>(
    editor?.events.changeSequenceTypeEnterMode,
  );
  const [isSequenceMode, setIsSequenceMode] = useState(false);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const layoutMode = useLayoutMode();
  const isDisabled = !!isSequenceEditInRNABuilderMode;

  const onToggleSequenceMode = (data) => {
    const mode = typeof data === 'object' ? data.mode : data;
    setIsSequenceMode(mode === 'sequence-layout-mode');
  };

  useEffect(() => {
    editor?.events.selectMode.add(onToggleSequenceMode);
    editor?.events.changeSequenceTypeEnterMode.add((mode: SequenceType) =>
      setActiveSequenceType(mode),
    );
    editor?.events.changeSequenceTypeEnterMode.dispatch(SequenceType.RNA);

    return () => {
      editor?.events.selectMode.remove(onToggleSequenceMode);
    };
  }, [editor]);

  useEffect(() => {
    onToggleSequenceMode(layoutMode);
  }, [layoutMode]);

  const handleSelectSequenceType = (sequenceType: string) => {
    editor.events.changeSequenceTypeEnterMode.dispatch(sequenceType);
  };

  return isSequenceMode ? (
    <>
      <Box sx={{ mr: 1, ml: 1 }}>
        <ButtonGroup disabled={isDisabled}>
          <SequenceTypeButtons
            title="RNA (Ctrl+Alt+R)"
            variant={
              activeSequenceType === SequenceType.RNA ? 'contained' : 'outlined'
            }
            onClick={() => handleSelectSequenceType(SequenceType.RNA)}
          >
            RNA
          </SequenceTypeButtons>
          <SequenceTypeButtons
            title="DNA (Ctrl+Alt+D)"
            variant={
              activeSequenceType === SequenceType.DNA ? 'contained' : 'outlined'
            }
            onClick={() => handleSelectSequenceType(SequenceType.DNA)}
          >
            DNA
          </SequenceTypeButtons>
          <SequenceTypeButtons
            title="Peptides (Ctrl+Alt+P)"
            variant={
              activeSequenceType === SequenceType.PEPTIDE
                ? 'contained'
                : 'outlined'
            }
            onClick={() => handleSelectSequenceType(SequenceType.PEPTIDE)}
          >
            PEP
          </SequenceTypeButtons>
        </ButtonGroup>
      </Box>
    </>
  ) : null;
};
