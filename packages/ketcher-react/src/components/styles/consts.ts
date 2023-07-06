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
  primaryWhite: '#EFF2F5',
  green: '#167782',
  lightGreen: '#188794',
  graphite: '#333333',
  grey: '#cad3dd',
  darkGrey: '#b4b9d6'
} as const

const text = {
  color: {
    primary: color.graphite,
    secondary: color.white,
    hover: color.green
  }
} as const

const font = {
  size: {
    small: '10px',
    regular: '12px'
  },
  weight: {
    regular: '400'
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
  primary: `1px solid ${color.grey}`,
  secondary: `1px solid ${color.green}`,
  medium: `1.5px solid ${color.lightGreen}`,
  radius: {
    regular: '2px',
    medium: '4px'
  }
} as const

export default {
  background,
  font,
  border,
  color,
  text
}
