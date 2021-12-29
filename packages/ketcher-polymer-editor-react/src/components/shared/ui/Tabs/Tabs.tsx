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

import Tabs, { TabsProps } from '@mui/material/Tabs'
import Tab, { TabProps } from '@mui/material/Tab'
import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

function CustomTabs(props): ReactElement {
  const [tabIndex, setTabIndex] = useState(0)
  const { tabs, contentStyle, tabsStyle } = props
  const tabPanel = tabs[tabIndex]
  const Component = tabPanel?.component
  const componentProps = tabPanel?.props

  const handleChange = (_event, newTabIndex) => {
    setTabIndex(newTabIndex)
  }

  const StyledTabs = styled(Tabs)<TabsProps>({
    height: 24,
    minHeight: 24,

    '& .MuiTabs-indicator': {
      display: 'none'
    },
    ...tabsStyle
  })

  const StyledTab = styled(Tab)<TabProps>(({ theme }) => ({
    minHeight: 24,
    minWidth: 60,
    height: 1,
    width: 65,
    padding: 0,
    fontSize: 10,
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: theme.colors.tab.regular,
    color: theme.colors.text.black,

    '&:hover': {
      backgroundColor: theme.colors.tab.hover,
      color: theme.colors.text.white
    },

    '&.Mui-selected': {
      color: theme.colors.text.white,
      backgroundColor: theme.colors.tab.active
    },

    ...tabsStyle
  }))

  const TabListContent = styled('div')({
    ...contentStyle
  })

  return (
    <>
      <StyledTabs value={tabIndex} onChange={handleChange}>
        {tabs.map((tabPanel, index) => (
          <StyledTab
            label={tabPanel.caption}
            key={index}
            {...a11yProps(index)}
          />
        ))}
      </StyledTabs>
      {tabPanel && (
        <TabPanel value={tabIndex} index={tabIndex}>
          <TabListContent>
            <Component {...componentProps} />
          </TabListContent>
        </TabPanel>
      )}
    </>
  )
}

export { CustomTabs as Tabs }
