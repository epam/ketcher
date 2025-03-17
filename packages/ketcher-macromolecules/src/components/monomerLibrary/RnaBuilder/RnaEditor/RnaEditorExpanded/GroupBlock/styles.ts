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
import { Icon } from 'ketcher-react';

export const GroupBlockContainer = styled.div<{
  selected?: boolean;
  isEditMode?: boolean;
}>((props) => ({
  height: '40px',
  position: 'relative',
  marginLeft: props.isEditMode ? '30px' : '28.5px',
  display: 'flex',
  alignItems: 'center',
  border: props.isEditMode
    ? 'none'
    : `1.5px solid ${props.theme.ketcher.outline.color}`,
  backgroundColor: props.selected
    ? props.theme.ketcher.color.button.primary.active
    : props.isEditMode
    ? props.theme.ketcher.color.background.primary
    : 'transparent',
  borderRadius: props.theme.ketcher.border.radius.regular,
  boxShadow: props.isEditMode ? props.theme.ketcher.shadow.regular : 'none',
  padding: '5px 10px',
  color: props.selected ? 'white' : 'black',
  gap: '8px',
  cursor: 'pointer',
  outlineOffset: '1px',
  boxSizing: 'border-box',

  ':hover': {
    outline: props.theme.ketcher.outline.small,
  },

  ':not(:last-child)': {
    ':after': {
      content: '""',
      position: 'absolute',
      right: '100%',
      bottom: 'calc(50% - 1px)',
      borderLeft: props.theme.ketcher.outline.medium,
      borderBottom: props.theme.ketcher.outline.medium,
      height: '2px',
      width: '17px',
    },
  },

  ':last-child': {
    ':after': {
      content: '""',
      position: 'absolute',
      right: '100%',
      bottom: 'calc(50% - 1px)',
      borderLeft: props.theme.ketcher.outline.medium,
      borderBottom: props.theme.ketcher.outline.medium,
      borderRadius: '0 0 0 4px',
      height: '130px',
      width: '17px',
    },
  },
}));

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GroupName = styled.span<{ selected?: boolean }>`
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  color: ${({ selected, theme }) =>
    selected
      ? theme.ketcher.color.background.primary
      : theme.ketcher.color.text.light};
  opacity: ${({ selected }) => (selected ? 0.4 : 1)};
`;

export const MonomerName = styled.span<{ selected?: boolean; empty: boolean }>`
  margin-top: 1px;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  color: ${({ selected, empty, theme }) =>
    selected
      ? theme.ketcher.color.button.text.primary
      : empty
      ? '#b4b9d6'
      : theme.ketcher.color.text.primary};
  opacity: ${({ selected, empty }) => (selected && empty ? 0.4 : 1)};
`;

export const GroupIconContainer = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const GroupIcon = styled(Icon)<{
  selected?: boolean;
  empty?: boolean;
}>`
  fill: ${({ selected, empty, theme }) =>
    empty
      ? 'none'
      : selected
      ? theme.ketcher.color.background.primary
      : theme.ketcher.color.icon.grey};
  color: ${({ selected, theme }) =>
    selected
      ? theme.ketcher.color.background.primary
      : theme.ketcher.color.icon.grey};
`;

export const GroupIconAction = styled(GroupIcon)`
  position: absolute;
  height: 10px;
  width: 10px;
  top: 3px;
  right: calc(50% - 5px);
  fill: ${({ theme, empty }) =>
    empty
      ? theme.ketcher.color.background.primary
      : theme.ketcher.color.text.secondary};
`;

export const CompactGroupBlockContainer = styled.div<{
  selected?: boolean;
  isEditMode?: boolean;
}>`
  position: relative;
  width: 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(180, 185, 214, 0.6);
  cursor: pointer;
  background-color: ${({ selected, theme }) =>
    selected
      ? theme.ketcher.color.button.primary.active
      : theme.ketcher.color.background.primary};

  &:hover {
    outline: ${({ theme }) => theme.ketcher.outline.selected.small};
  }
`;

export const CompactGroupConnection = styled.div`
  position: absolute;
  top: -35%;
  left: 50%;
  height: 15px;
  width: 2px;
  background-color: ${({ theme }) => theme.ketcher.outline.color};
`;

export const CompactGroupText = styled.p<{
  selected?: boolean;
  empty?: boolean;
}>`
  margin: 0;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  font-weight: ${({ theme }) => theme.ketcher.font.weight.regular};
  color: ${({ selected, empty, theme }) =>
    selected
      ? theme.ketcher.color.button.text.primary
      : empty
      ? '#b4b9d6'
      : theme.ketcher.color.text.primary};
  opacity: ${({ selected, empty }) => (selected && empty ? 0.4 : 1)};
`;
