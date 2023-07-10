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

export const MenuLayout = styled.div`
  background-color: ${({ theme }) => theme.ketcher.color.background.primary};
`;

export const Divider = styled.span`
  display: block;
  height: 8px;
  width: 32px;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.ketcher.color.divider};
`;

export const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  background-color: ${({ theme }) => theme.ketcher.color.background.primary};
  border-radius: 2px;
  width: 32px;
  margin-bottom: 8px;

  > * {
    margin-bottom: 8px;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;
