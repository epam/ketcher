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

interface MonomerItemPropTypes {
  key: number
  item: Record<string, string>
  onClick: () => void
}

const MonomerItem = (props: MonomerItemPropTypes) => {
  const { item, onClick } = props

  const Card = styled.div(({ theme }) => ({
    background: theme.ketcher.color.text.light,
    border: `1px solid ${theme.ketcher.color.text.primary}`,
    borderRadius: '2px',
    width: '32px',
    height: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }))

  return <Card onClick={onClick}>{item.name}</Card>
}

export { MonomerItem }
