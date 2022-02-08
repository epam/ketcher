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

import { Icon } from 'components/shared/icon'
import { LoadingCircles } from './LoadingCircles'
import styled from '@emotion/styled'

export type AnalyzingFileProps = {
  fileName?: string
}

const ICON_NAME = 'file-thumbnail'

const RootContainer = styled.div`
  width: 410px;
  min-height: 23em;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const FileBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  svg {
    margin-right: 13px;
  }

  p {
    color: #585858;
    font-size: 16px;
    line-height: 19px;
  }
`

export const AnalyzingFile = ({ fileName }: AnalyzingFileProps) => {
  return (
    <RootContainer>
      {fileName && (
        <FileBox>
          <Icon name={ICON_NAME} />
          <p>{fileName}</p>
        </FileBox>
      )}
      <LoadingCircles />
    </RootContainer>
  )
}
