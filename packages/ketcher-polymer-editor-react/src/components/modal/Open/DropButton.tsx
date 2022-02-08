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
import { ActionButton } from 'components/shared/actionButton'
import styled from '@emotion/styled'

type Props = {
  label: string
  clickHandler: () => void
  disabled?: boolean
  caption?: string
}

const StyledActionButton = styled(ActionButton)`
  border-radius: 2px;
  text-align: center;
  width: 100%;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding: 5px 8px;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > span {
    padding-top: 5px;
    font-size: ${({ theme }) => theme.font.size.small};
  }
`

export const DropButton = ({ label, clickHandler, caption }: Props) => {
  return (
    <ButtonContainer>
      <StyledActionButton label={label} clickHandler={clickHandler} />
      {caption && <span>{caption}</span>}
    </ButtonContainer>
  )
}
