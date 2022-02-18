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

import { css } from '@emotion/react'

import { ThemeType } from '../defaultTheme'

export const getGlobalStyles = (theme: ThemeType) =>
  css({
    body: {
      fontSize: theme.ketcher.font.size.medium,
      fontFamily: theme.ketcher.font.family.inter,
      fontWeight: theme.ketcher.font.weight.regular,
      backgroundColor: theme.ketcher.color.background.primary,
      color: theme.ketcher.color.text.primary,
      boxSizing: 'border-box'
    },
    div: {
      boxSizing: 'border-box'
    },
    input: {
      fontFamily: theme.ketcher.font.family.inter,
      fontWeight: theme.ketcher.font.weight.regular,
      fontSize: theme.ketcher.font.size.regular,
      boxSizing: 'border-box'
    },
    h1: {
      fontSize: 96
    },
    h2: {
      fontSize: 60
    },
    h3: {
      fontSize: 48
    },
    h4: {
      fontSize: 34
    },
    h5: {
      fontSize: 24
    },
    h6: {
      fontSize: 20,
      fontWeight: theme.ketcher.font.weight.bold
    },
    p: {
      fontSize: theme.ketcher.font.size.regular
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: theme.ketcher.font.weight.bold
    }
  })
