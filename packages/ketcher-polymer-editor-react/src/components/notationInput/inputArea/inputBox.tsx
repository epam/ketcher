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
import { css } from '@emotion/react'

// @TODO Maybe we can come up with something smart instead of using these imperative calculations
// if we will need to reuse component, lineHeight and componentHeight can be taken from theme or calculated in browser after mounting
const borderThickness = 1
const extraMargin = 10
const inputPadding = 10

// Line height + 2 borders
const textWithBorderHeight = 16 + borderThickness * 2

// How much we need to move wrapper with textarea from top to vertically center it in a parent div
const verticalOffset = 24 / 2 - textWithBorderHeight / 2

export const InputBox = styled('div')<{ hasInput: boolean }>`
  top: ${verticalOffset}px;
  position: relative;
  padding-left: ${inputPadding}px;
  padding-right: ${inputPadding}px;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  ${({ theme }) => css`
    background-color: ${theme.ketcher.color.background.primary};
    border: ${borderThickness}px solid ${theme.ketcher.color.background.primary};
  `};
  border-radius: 2px;
  z-index: 1;

  // If there's input, make text box bigger,
  // otherwise center vertically within parent
  ${(props) =>
    props.hasInput
      ? css`
          margin-top: -${extraMargin}px;
          margin-bottom: -${extraMargin}px;
          padding-top: ${extraMargin}px;
          padding-bottom: ${extraMargin}px;
        `
      : css`
          padding-top: ${verticalOffset}px;
          margin-top: -${verticalOffset}px;
          padding-bottom: ${verticalOffset}px;
          margin-bottom: -${verticalOffset}px;
        `}

  &:focus-within {
    border-color: #3e7bfa;
  }
`
