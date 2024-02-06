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
import { Card as MonomerCard } from '../monomerLibraryItem/styles';

export const Card = styled(MonomerCard)<{ code?: string; selected?: boolean }>`
  &::after {
    content: '';
    background: ${({ theme, selected }) =>
      selected ? theme.ketcher.color.button.primary.active : '#faa500'};
  }
  .dots {
    visibility: visible;
    position: absolute;
    right: 2px;
    top: 10px;
  }
  .hidden {
    visibility: hidden !important;
  }
  > .star {
    right: 0;
    left: 4px;
    top: 10px;
    width: min-content;
  }
`;
