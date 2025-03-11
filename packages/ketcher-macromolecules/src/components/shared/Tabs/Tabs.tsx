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

import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectCurrentTabIndex,
  setSelectedTabIndex,
} from 'state/library/librarySlice';
import TabPanel from './TabPanel';
import { StyledTab, StyledTabs, TabPanelContent } from './Tabs.styles';
import { memo, useCallback } from 'react';
import { TabsData } from './Tabs.types';

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

type Props = {
  tabs: TabsData;
};

const Tabs = (props: Props) => {
  const dispatch = useAppDispatch();
  const selectedTabIndex = useAppSelector(selectCurrentTabIndex);

  const { tabs } = props;
  const tabPanel = tabs[selectedTabIndex];
  const Component = tabPanel?.component;
  const componentProps = tabPanel?.props;

  const handleChange = useCallback(
    (_event, newTabIndex) => {
      dispatch(setSelectedTabIndex(newTabIndex));
    },
    [dispatch],
  );

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
          <TabPanelContent>
            <Component {...componentProps} />
          </TabPanelContent>
        </TabPanel>
      )}
    </>
  );
};

export default memo(Tabs);
