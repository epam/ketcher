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

import { Tabs, Tab } from '@mui/material';
import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectCurrentTabIndex,
  setSelectedTabIndex,
} from 'state/library/librarySlice';

interface TabPanelProps {
  index: number;
  value: number;
  children: JSX.Element | Array<JSX.Element>;
}

const TabPanelDiv = styled.div(() => ({
  backgroundColor: '#eef2f5',
  flexGrow: 1,
  overflowY: 'auto',
}));

const TabPanelBox = styled(Box)({
  height: '100%',
  width: '100%',
  alignItems: 'start',
});

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <TabPanelDiv role="tabpanel" hidden={value !== index} id={index.toString()}>
      {value === index && <TabPanelBox>{children}</TabPanelBox>}
    </TabPanelDiv>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function CustomTabs(props): ReactElement {
  const dispatch = useAppDispatch();
  const selectedTabIndex = useAppSelector(selectCurrentTabIndex);
  const { tabs, disabled } = props;
  const tabPanel = tabs[selectedTabIndex];
  const Component = tabPanel?.component;
  const componentProps = tabPanel?.props;

  const handleChange = (_event, newTabIndex) => {
    dispatch(setSelectedTabIndex(newTabIndex));
  };

  const StyledTabs = styled(Tabs)({
    height: 24,
    minHeight: 24,
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& .MuiTabs-indicator': {
      display: 'none',
    },
  });

  const StyledTab = styled(Tab)(({ theme }) => ({
    minHeight: 24,
    minWidth: 0,
    height: 1,
    padding: 0,
    fontSize: theme.ketcher.font.size.regular,
    textTransform: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: theme.ketcher.color.tab.regular,
    color: theme.ketcher.color.text.light,
    listStyleType: 'none',
    margin: 0,
    flex: '1 1 auto',
    border: `1px solid transparent`,
    borderBottom: `1px solid ${theme.ketcher.color.border.primary}`,
    borderRadius: '4px 4px 0 0',

    '&:first-of-type': {
      borderLeftColor: 'transparent !important',
      borderRadius: '0 4px 0 0 ',
    },

    '&:last-of-type': {
      borderRightColor: 'transparent !important',
      borderRadius: '4px 0 0 0',
    },

    '&:hover': {
      backgroundColor: theme.ketcher.color.tab.regular,
      color: theme.ketcher.color.text.primary,
      border: `1px solid ${theme.ketcher.color.border.primary}`,
    },

    '&.Mui-selected': {
      backgroundColor: theme.ketcher.color.tab.active,
      color: theme.ketcher.color.text.primary,
      border: `1px solid ${theme.ketcher.color.border.primary}`,
      borderBottom: '1px solid transparent',
    },
  }));

  const TabPanelContent = styled.div<{ disabled: boolean }>`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    pointer-events: ${disabled ? 'none' : null};
    filter: ${disabled ? 'opacity(0.5)' : null};
  `;

  return (
    <>
      <StyledTabs value={selectedTabIndex} onChange={handleChange}>
        {tabs.map((tabPanel, index) => (
          <StyledTab
            label={tabPanel.caption}
            key={index}
            data-testid={tabPanel.testId}
            {...a11yProps(index)}
          />
        ))}
      </StyledTabs>
      {tabPanel && (
        <TabPanel value={selectedTabIndex} index={selectedTabIndex}>
          <TabPanelContent disabled={disabled}>
            <Component {...componentProps} />
          </TabPanelContent>
        </TabPanel>
      )}
    </>
  );
}

export { CustomTabs as Tabs };
