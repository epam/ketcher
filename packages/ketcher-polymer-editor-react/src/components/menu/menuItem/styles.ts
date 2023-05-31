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
import { IconButton } from 'ketcher-react'

export const StyledMenuItem = styled(IconButton)`
  height: 28px;
  width: 28px;
  padding: 1px;
  margin: 2px;
  border-radius: 2px;

  @media only screen and (min-width: 1024px),
    @media only screen and (min-width: 1920px) {
    height: 28px;
    width: 28px;
    padding: 1px;
  }
`
