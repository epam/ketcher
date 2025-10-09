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

import TabPanel from './TabPanel';
import {
  HiddenTab,
  StyledTab,
  StyledTabs,
  TabPanelContent,
} from './Tabs.styles';
import { memo } from 'react';
import { TabsData } from './Tabs.types';

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

type Props = {
  tabs: TabsData;
  isLayoutToRight?: boolean;
  selectedTabIndex: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
};

const Tabs = (props: Props) => {
  const { tabs, selectedTabIndex, isLayoutToRight, onChange } = props;
  const tabPanel = tabs[selectedTabIndex];
  const Component = tabPanel?.component;
  const componentProps = tabPanel?.props;

  return (
    <>
      <StyledTabs
        value={selectedTabIndex}
        onChange={onChange}
        isLayoutToRight={isLayoutToRight}
      >
        {tabs.map((tabPanel, index) => (
          <StyledTab
            label={tabPanel.caption}
            title={tabPanel.tooltip}
            key={tabPanel.testId || tabPanel.caption}
            isLayoutToRight={isLayoutToRight}
            data-testid={tabPanel.testId}
            data-tab={tabPanel.tooltip}
            {...a11yProps(index)}
          />
        ))}
        <HiddenTab value={-1} />
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
