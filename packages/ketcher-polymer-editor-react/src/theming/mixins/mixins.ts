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

import { ThemeType } from 'theming/defaultTheme'
import { css } from '@emotion/react'

export const scrollbarThin = ({ ketcher: theme }: ThemeType) => css`
  scrollbar-width: thin;
  scrollbar-color: ${theme.color.scroll.regular} ${theme.color.scroll.inactive};
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
    background-color: ${theme.color.scroll.inactive};
    border-radius: 2px;
    -webkit-border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.color.scroll.regular};
    border-radius: 2px;
    -webkit-border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb:active {
    background-color: ${theme.color.scroll.regular};
  }
`
