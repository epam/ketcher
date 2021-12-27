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

import styled from '@emotion/styled'

import { CONSTANTS } from './stylingHelpers'

const { borderThickness, verticalOffset, extraMargin, inputPadding } = CONSTANTS

export const TextareaWrapper = styled('div')<{ hasInput: boolean }>`
  position: absolute;
  top: ${verticalOffset}px;
  left: 0;
  padding-left: ${inputPadding}px;
  padding-right: ${inputPadding}px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  background-color: white;
  border-radius: 2px;
  border: ${borderThickness}px solid white;
  box-sizing: border-box;
  width: 100%;
  z-index: 1;

  // If there's input, make text box bigger,
  // otherwise center vertically within parent
  ${(props) =>
    props.hasInput
      ? `margin-top: -${extraMargin}px;
margin-bottom: -${extraMargin}px;
padding-top: ${extraMargin}px;
padding-bottom: ${extraMargin}px;`
      : `padding-top: ${verticalOffset}px;
  margin-top: -${verticalOffset}px;
  padding-bottom: ${verticalOffset}px;
  margin-bottom: -${verticalOffset}px;`}

  &:focus-within {
    border-color: #3e7bfa;
  }
`
