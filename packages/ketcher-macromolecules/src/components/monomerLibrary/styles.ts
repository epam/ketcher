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
import { Input, Icon } from 'ketcher-react';

export const MONOMER_LIBRARY_WIDTH = '254px';

export const MonomerLibraryContainer = styled.div`
  width: ${MONOMER_LIBRARY_WIDTH};
  height: calc(100% - 16px);
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.ketcher.color.background.primary};
  box-shadow: ${({ theme }) => theme.ketcher.shadow.mainLayoutBlocks};
  border-radius: 4px;
`;

export const MonomerLibraryHeader = styled.div`
  padding: 10px 0 10px 8px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MonomerLibraryInputContainer = styled.div`
  height: 24px;
  display: flex;
  flex-grow: 1;
  gap: 4px;
  align-items: center;
  padding: 4px;
  background-color: ${(props) =>
    props.theme.ketcher.color.input.background.default};
  border-radius: 4px;

  &:hover,
  &:has(input:focus) {
    outline: ${(props) => props.theme.ketcher.outline.selected.small};
  }
`;

export const MonomerLibraryToggle = styled.button`
  height: 24px;
  display: flex;
  align-items: center;
  gap: 2px;
  border: none;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  background-color: #e2e5e9;
  text-transform: none;
  font-weight: ${({ theme }) => theme.ketcher.font.weight.regular};
  font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  color: ${({ theme }) => theme.ketcher.color.text.secondary};
`;

export const MonomerLibrarySearchIcon = styled(Icon)`
  height: 16px;
  width: 16px;
  color: ${(props) => props.theme.ketcher.color.text.secondary};
`;

export const MonomerLibraryInput = styled(Input)`
  flex-grow: 1;
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: none;
  outline: none;

  &:hover {
    outline: none;
  }

  &:focus {
    outline: none;
  }
`;
