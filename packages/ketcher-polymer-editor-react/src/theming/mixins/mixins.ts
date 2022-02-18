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

export const scrollbarThin = ({ ketcher: theme }: ThemeType) => ({
  'scrollbar-width': 'thin',
  'scrollbar-color': `${theme.color.scroll.regular} ${theme.color.scroll.inactive}`,
  '&::-webkit-scrollbar': {
    width: '4px',
    height: '4px',
    backgroundColor: theme.color.scroll.inactive,
    borderRadius: '2px',
    webkitBorderRadius: '2px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.color.scroll.regular,
    borderRadius: '2px',
    webkitBorderRadius: '2px'
  },
  '&::-webkit-scrollbar-thumb:active': {
    backgroundColor: theme.color.scroll.regular
  }
})
