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

interface LayoutProps {
  children: JSX.Element | Array<JSX.Element>
  windowHeight?: number
}

const PADDING = '15px'
const PADDING_BOTTOM = '5px'

const Column = styled.div({
  width: 'fit-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
})

const Row = styled.div<{ height?: number }>(({ theme, height }) => ({
  height: `${height}px` || '100vh',
  width: '100%',
  position: 'relative',
  padding: PADDING,
  paddingBottom: PADDING_BOTTOM,
  backgroundColor: theme.color.background.canvas,
  display: 'flex',
  justifyContent: 'space-between'
}))

const Left = styled.div({
  width: '48px',
  minWidth: '48px',
  height: '100%',
  marginRight: '6px',
  display: 'flex',
  flexDirection: 'column'
})

const Right = styled.div({
  width: '253px',
  height: `100%`,
  marginLeft: '6px',
  display: 'flex',
  flexDirection: 'column'
})

const Top = styled.div({
  height: '24px',
  width: '100%',
  alignSelf: 'flex-end',
  paddingRight: '10%',
  marginBottom: '6px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const Main = styled.div({
  height: '100%'
})

const DummyDiv = styled.div({
  height: `calc(40px + ${PADDING_BOTTOM})`
})

type LayoutSection = 'Left' | 'Right' | 'Main' | 'Top' | 'Bottom'

export const Layout = ({ children, windowHeight }: LayoutProps) => {
  const subcomponents: Record<LayoutSection, JSX.Element | null> = {
    Left: null,
    Main: null,
    Right: null,
    Top: null,
    Bottom: null
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
    <Row height={windowHeight}>
      <Column>
        {subcomponents.Left}
        <DummyDiv />
      </Column>
      <Column style={{ width: '100%' }}>
        {subcomponents.Top}
        {subcomponents.Main}
        {subcomponents.Bottom}
      </Column>
      <Column>{subcomponents.Right}</Column>
    </Row>
  )
}

Layout.Left = Left
Layout.Top = Top
Layout.Right = Right
Layout.Main = Main
