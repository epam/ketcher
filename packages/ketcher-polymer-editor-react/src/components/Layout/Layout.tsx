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

import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

interface LayoutProps {
  children: JSX.Element | Array<JSX.Element>
  windowSize?: string
}

const PADDING = '15px'
const PADDING_BOTTOM = '5px'

const Column = styled.div<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  width: fullWidth ? '100%' : 'fit-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
}))

const RowMain = styled.div<{ windowSize?: string }>(
  ({ theme, windowSize }) => ({
    height: '100vh',
    width: '100%',
    position: 'relative',
    padding: windowSize === 'small' ? '15px 11px' : PADDING,
    paddingBottom: PADDING_BOTTOM,
    backgroundColor: theme.color.background.canvas,
    display: 'flex',
    justifyContent: 'space-between',
    columnGap: '6px'
  })
)

const Row = styled.div({
  display: 'flex',
  height: 'fit-content'
})

const baseLeftRightStyle = css({
  height: '100%',
  width: 'fit-content',
  display: 'flex',
  flexDirection: 'column'
})

const Left = styled.div(baseLeftRightStyle)

const Right = styled.div(baseLeftRightStyle)

const Top = styled.div({
  height: 'fit-content',
  width: '100%',
  marginBottom: '6px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const Main = styled.div({
  height: '100%',
  width: '100%'
})

const DummyDiv = styled.div({
  height: `calc(40px + ${PADDING_BOTTOM})`
})

const DummyDivInRow = styled.div({
  flexBasis: '40px',
  height: '100%',
  flexShrink: '1'
})

type LayoutSection = 'Left' | 'Right' | 'Main' | 'Top'

export const Layout = ({ children, windowSize = 'regular' }: LayoutProps) => {
  const subcomponents: Record<LayoutSection, JSX.Element | null> = {
    Left: null,
    Main: null,
    Right: null,
    Top: null
  }
  React.Children.forEach(children, (child) => {
    if (child.type === Left) {
      subcomponents.Left = child
    } else if (child.type === Right) {
      subcomponents.Right = child
    } else if (child.type === Top) {
      subcomponents.Top = child
    } else if (child.type === Main) {
      subcomponents.Main = child
    }
  })

  return (
    <RowMain windowSize={windowSize}>
      <Column>
        {subcomponents.Left}
        <DummyDiv />
      </Column>
      <Column fullWidth>
        <Row>
          {subcomponents.Top}
          <DummyDivInRow />
        </Row>
        {subcomponents.Main}
      </Column>
      <Column>{subcomponents.Right}</Column>
    </RowMain>
  )
}

Layout.Left = Left
Layout.Top = Top
Layout.Right = Right
Layout.Main = Main
