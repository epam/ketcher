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
import React from 'react'

export type MonomerItemType = {
  label: string
  colorScheme?: string
  monomers?: object
}

interface MonomerItemProps {
  item: MonomerItemType
  onClick: () => void
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  colorScheme?: string
}

const Card = styled.div<CardProps>`
  background: ${({ colorScheme, theme }) =>
    colorScheme || theme.color.monomer.default};
  border-radius: 2px;
  width: 48px;
  height: 48px;
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.small};
`

const MonomerItem = (props: MonomerItemProps) => {
  const { item, onClick } = props

  return (
    <Card onClick={onClick} colorScheme={item.colorScheme}>
      {item.label}
    </Card>
  )
}

export { MonomerItem }
