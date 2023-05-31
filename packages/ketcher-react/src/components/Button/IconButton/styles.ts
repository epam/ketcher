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
import { IconButton } from '@mui/material'

interface IStyledIconButtonProps {
  isActive: boolean
}

export const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<IStyledIconButtonProps>`
  display: block;
  color: #333;
  border: 0;
  position: relative;
  background: inherit;

  flex-shrink: 0;

  border-radius: 4px;
  margin: 0px;
  padding: 2px;
  height: 28px;
  width: 28px;

  &:hover {
    color: #006775;
    transform: none;
    box-shadow: none;
    transition: none;
    background: none;
  }

  &:active {
    background-color: #006775;
    color: white;
    &:hover {
      background-color: #188794;
    }
  }

  ${(props) =>
    props.isActive
      ? 'background-color: #006775; color: white; &:hover {background-color: #188794;}'
      : undefined}

  & svg {
    width: 100%;
    height: 100%;

    path {
      fill: ${(props) => (props.isActive ? 'white' : undefined)};
    }
  }

  &.Mui-disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: initial;
    color: #333;
    pointer-events: auto;
  }

  @media only screen and (min-width: 1024px) {
    height: 32px;
    width: 32px;
    padding: 4px;
  }

  @media only screen and (min-width: 1920px) {
    height: 40px;
    width: 40px;
    padding: 5px;
  }
`
