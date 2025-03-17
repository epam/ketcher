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
  empty?: boolean;
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
  gap: '14px',
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

export const TextContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const GroupName = styled.span((props) => ({
  fontSize: props.theme.ketcher.font.size.small,
}));

export const MonomerName = styled.span<{ selected?: boolean; empty: boolean }>(
  (props) => ({
    marginTop: '1px',
    fontSize: props.theme.ketcher.font.size.medium,
    color: props.selected
      ? 'white'
      : props.empty
      ? props.theme.ketcher.color.text.lightgrey
      : props.theme.ketcher.color.text.primary,
  }),
);

export const GroupIcon = styled(Icon)<{
  selected?: boolean;
  empty?: boolean;
  name?: string;
}>((props) => ({
  color: props.empty
    ? 'transparent'
    : props.selected
    ? props.theme.ketcher.color.background.primary
    : props.theme.ketcher.color.icon.grey,
  stroke: props.selected
    ? props.theme.ketcher.color.background.primary
    : props.theme.ketcher.color.icon.grey,
  paddingRight:
    props.name === 'sugar' ? '5px' : props.name === 'phosphate' ? '1px' : 0,
}));

export const CompactGroupBlockContainer = styled.div<{
  isBase?: boolean;
  selected?: boolean;
  empty?: boolean;
  isEditMode?: boolean;
}>`
  width: 60px;
  order: ${({ isBase }) => (isBase ? -1 : 0)};
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
  // background-color: ${({ theme }) => theme.ketcher.color.background.primary};
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

export const CompactIcon = styled(GroupIcon)`
  height: 16px;
  width: 16px;
`;
