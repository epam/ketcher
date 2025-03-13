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

import styled from '@emotion/styled';
import { Button, Icon } from 'ketcher-react';

export const RnaEditorContainer = styled.div`
  padding: 8px;
`;

export const StyledHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: ${(props) => props.theme.ketcher.color.background.primary};
  font-weight: ${(props) => props.theme.ketcher.font.weight.regular};
  font-size: ${(props) => props.theme.ketcher.font.size.regular};
  border: none;
  border-radius: 4px;
  text-transform: none;
  cursor: pointer;

  &.styled-header--sequence-edit-mode {
    background-color: ${(props) =>
      props.theme.ketcher.color.editMode.sequenceInRNABuilder};
  }

  &.styled-header--expanded,
  &.styled-header--active-preset {
    border-radius: 4px 4px 0 0;
  }
`;

export const ExpandButton = styled(Button)`
  background: transparent;
  width: 16px;
  height: 16px;
  outline: none;
  border-radius: 0;
  padding: 0;
`;

export const ExpandIcon = styled(Icon)<{ expanded?: boolean }>`
  height: 16px;
  width: 16px;
  transform: ${(props) => (props.expanded ? 'rotate(180deg)' : 'none')};
`;
