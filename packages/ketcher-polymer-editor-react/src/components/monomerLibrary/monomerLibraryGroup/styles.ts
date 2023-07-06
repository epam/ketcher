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
import { MonomerPreview } from 'components/shared/MonomerPreview'
import { preview } from '../../../constants'
import { PreviewStyle } from '../../../types'

export const ItemsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: auto;
  gap: 8px;
  margin-bottom: 24px;
  margin-left: auto;
  margin-right: auto;

  &::after {
    content: '';
    flex: auto;
  }
`

export const GroupContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  font-family: ${({ theme }) => theme.ketcher.font.family.roboto};
  color: ${({ theme }) => theme.ketcher.color.divider};
  margin: 0;
  gap: 8px;
`

export const GroupTitle = styled.div`
  height: 100%;
  display: flex;
  flex-grow: 0;
  flex-basis: 14px;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  font-family: ${({ theme }) => theme.ketcher.font.family.roboto};
  color: ${({ theme }) => theme.ketcher.color.text.primary};
  margin: 0;
`

export const StyledPreview = styled(MonomerPreview)<PreviewStyle>`
  z-index: 1;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  top: ${(props) => props.top};
  width: ${preview.width}px;
  height: ${preview.height}px;
`
