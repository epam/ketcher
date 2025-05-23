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
import { IconButton, IconButtonCustomIcon } from 'components';
import { css } from '@emotion/react';

const TopToolbarIconStyles = css`
  border-radius: 4px;
  padding: 2px;
  width: 28px;
  height: 28px;

  @media only screen {
    @container (min-width: 1024px) {
      height: 32px;
      width: 32px;
      padding: 4px;
    }
  }
  @media only screen {
    @container (min-width: 1920px) {
      height: 40px;
      width: 40px;
      padding: 5px;
    }
  }
`;

export const TopToolbarIconButton = styled(IconButton)`
  ${TopToolbarIconStyles}
`;

export const TopToolbarCustomIconButton = styled(IconButtonCustomIcon)`
  ${TopToolbarIconStyles}
`;
