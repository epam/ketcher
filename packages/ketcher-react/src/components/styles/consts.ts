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

const color = {
  white: '#FFFFFF',
  green: '#167782',
  lightGreen: '#188794',
  graphite: '#333333',
  'grey-4': '#cad3dd',
  'grey-5': '#b4b9d6'
} as const

const text = {
  color: {
    primary: color.graphite,
    secondary: color.white,
    hover: color.green
  }
} as const

const background = {
  color: {
    primary: color.white,
    secondary: color.green,
    hover: color.lightGreen
  }
} as const

const border = {
  radius: {
    regular: '2px'
  }
} as const

export default {
  background,
  border,
  color,
  text
}
