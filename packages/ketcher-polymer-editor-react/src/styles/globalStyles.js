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

export default (theme) =>
  css({
    body: {
      fontSize: theme.font.size.medium,
      fontFamily: theme.font.family.inter,
      fontWeight: theme.font.weight.regular,
      backgroundColor: theme.color.background.primary,
      color: theme.color.text.primary,
      boxSizing: 'border-box'
    },
    div: {
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
      fontWeight: theme.font.weight.bold
    },
    p: {
      fontSize: theme.font.size.regular
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: theme.font.weight.bold
    }
  })
