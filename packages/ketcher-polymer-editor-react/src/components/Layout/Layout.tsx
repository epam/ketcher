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

import React from 'react';
import styled from '@emotion/styled';
import { MONOMER_LIBRARY_WIDTH } from 'components/monomerLibrary/styles';

interface LayoutProps {
  children: JSX.Element | Array<JSX.Element>;
}

const Column = styled.div<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  width: fullWidth ? '100%' : 'fit-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const RowMain = styled.div(({ theme }) => ({
  height: '100vh',
  width: '100%',
  position: 'relative',
  padding: '12px',
  paddingBottom: 0,
  backgroundColor: theme.ketcher.color.background.canvas,
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '12px',
}));

const Row = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  position: 'relative',
  paddingBottom: 0,
  backgroundColor: theme.ketcher.color.background.canvas,
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '3px',
}));

const BaseLeftRightStyle = styled.div<{ hide?: boolean }>(
  ({ hide = false }) => ({
    height: '100%',
    width: 'fit-content',
    display: hide ? 'none' : 'flex',
    flexDirection: 'column',
  }),
);

const Left = styled(BaseLeftRightStyle)``;

const Right = styled(BaseLeftRightStyle)``;

const Top = styled.div<{ shortened?: boolean }>(({ shortened = false }) => ({
  height: 'fit-content',
  width: shortened ? `calc(100% - ${MONOMER_LIBRARY_WIDTH})` : '100%',
  marginBottom: '6px',
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: '#FFFFFF',
  boxShadow: '0px 2px 5px rgba(103, 104, 132, 0.15)',
  borderRadius: '4px',
}));

const Main = styled.div({
  height: '100%',
  width: '100%',
});

const DummyDiv = styled.div({
  height: '40px',
});

type LayoutSection = 'Left' | 'Right' | 'Main' | 'Top';

export const Layout = ({ children }: LayoutProps) => {
  const subcomponents: Record<LayoutSection, JSX.Element | null> = {
    Left: null,
    Main: null,
    Right: null,
    Top: null,
  };
  React.Children.forEach(children, (child) => {
    if (child.type === Left) {
      subcomponents.Left = child;
    } else if (child.type === Right) {
      subcomponents.Right = child;
    } else if (child.type === Top) {
      subcomponents.Top = child;
    } else if (child.type === Main) {
      subcomponents.Main = child;
    }
  });

  return (
    <RowMain>
      <Column fullWidth>
        {subcomponents.Top}
        <Row>
          {subcomponents.Left}
          <DummyDiv />
          {subcomponents.Main}
        </Row>
      </Column>
      <Column>{subcomponents.Right}</Column>
    </RowMain>
  );
};

Layout.Left = Left;
Layout.Top = Top;
Layout.Right = Right;
Layout.Main = Main;
