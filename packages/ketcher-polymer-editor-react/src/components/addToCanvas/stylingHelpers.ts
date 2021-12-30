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

const COMPONENT_HEIGHT = 25
const LINE_HEIGHT = 16
const BORDER_THICKNESS = 1

// Wrapper for textarea with border will be of this height
const textWithBorder = LINE_HEIGHT + BORDER_THICKNESS * 2

// How much we need to move wrapper with textarea from top to vertically center it in a parent div
const verticalOffset = COMPONENT_HEIGHT / 2 - textWithBorder / 2

// @TODO Change to explicit units, '12px' and so on
export const CONSTANTS = {
  componentWidth: 670,
  inputFieldWidth: 355,
  height: COMPONENT_HEIGHT,
  lineHeight: LINE_HEIGHT,
  borderThickness: BORDER_THICKNESS,
  verticalOffset: verticalOffset,
  extraMargin: 10,
  inputPadding: 10,
  dropDownFont: 12
}
