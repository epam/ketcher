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

export default (theme) => ({
  body: {
    'font-size': theme.font.size.medium,
    'font-family': theme.font.family.inter,
    'font-weight': theme.font.weight.regular,
    'background-color': theme.color.background.primary,
    color: theme.color.text.primary,
    'box-sizing': 'border-box'
  },
  h1: {
    'font-size': 96
  },
  h2: {
    'font-size': 60
  },
  h3: {
    'font-size': 48
  },
  h4: {
    'font-size': 34
  },
  h5: {
    'font-size': 24
  },
  h6: {
    'font-size': 20,
    'font-weight': theme.font.weight.bold
  },
  p: {
    'font-size': theme.font.size.regular
  },
  button: {
    'text-transform': 'uppercase',
    'font-weight': 500
  }
})
