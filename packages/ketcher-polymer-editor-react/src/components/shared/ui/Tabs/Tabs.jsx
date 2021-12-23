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
import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useState } from 'react'
import Box from '@mui/material/Box'
import { COLORS } from '../../../../styles/variables'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

function CustomTabs(props) {
  const [tabIndex, setTabIndex] = useState(0)
  const { tabs, contentStyle, tabsStyle } = props
  const tabPanel = tabs[tabIndex]
  const Component = tabPanel?.component
  const componentProps = tabPanel?.props

  const handleChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex)
  }

  const styleTabs = {
    height: 24,
    minHeight: 24
  }

  const styleTab = {
    minHeight: 24,
    minWidth: 60,
    height: 1,
    width: 65,
    padding: 0,
    fontSize: 10,
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: COLORS.tab.regular,
    color: COLORS.text.black,

    '&:hover': {
      backgroundColor: COLORS.tab.hover,
      color: COLORS.text.white
    },

    '&.active': {
      color: COLORS.text.white,
      backgroundColor: COLORS.tab.active
    }
  }

  const styleIndicator = {
    display: 'none'
  }

  return (
    <>
      <Tabs
        value={tabIndex}
        onChange={handleChange}
        sx={{ ...styleTabs, ...tabsStyle }}
        TabIndicatorProps={{
          sx: styleIndicator
        }}
      >
        {tabs.map((tabPanel, index) => (
          <Tab
            label={tabPanel.caption}
            key={index}
            className={tabIndex === index && 'active'}
            sx={{ ...styleTab, ...tabsStyle }}
          />
        ))}
      </Tabs>
      {tabPanel && (
        <TabPanel value={tabIndex} index={tabIndex}>
          <div css={contentStyle}>
            <Component {...componentProps} />
          </div>
        </TabPanel>
      )}
    </>
  )
}

export { CustomTabs as Tabs }
