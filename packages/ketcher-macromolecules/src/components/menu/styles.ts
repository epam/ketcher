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

export const MenuLayout = styled.div<{ isHorizontal?: boolean }>(
  ({ theme, isHorizontal }) => ({
    backgroundColor: theme.ketcher.color.background.primary,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
  }),
);

export const Divider = styled.hr`
  width: 18px;
  margin: 6px 0;
  align-self: center;
  border-width: thin 0px 0px 0px;
  border-style: solid;
  border-color: ${({ theme }) => theme.ketcher.color.divider};
`;

export const VerticalDivider = styled.hr`
  height: 18px;
  margin: 0px 6px;
  align-self: center;
  border-width: 0px thin 0px 0px;
  border-style: solid;
  border-color: ${({ theme }) => theme.ketcher.color.divider};
`;

export const StyledGroup = styled.div<{ isHorizontal?: boolean }>(
  ({ theme, isHorizontal }) => ({
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: theme.ketcher.color.background.primary,
    borderRadius: '2px',
    width: isHorizontal ? undefined : '32px',
    marginBottom: isHorizontal ? undefined : '8px',
    '> :last-child': isHorizontal
      ? undefined
      : {
          marginBottom: 0,
        },
  }),
);
