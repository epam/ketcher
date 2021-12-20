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
import clsx from 'clsx'
import classes from './Tabs.module.less'
import Box from '@mui/material/Box'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

function CustomTabs(props) {
  const [tabIndex, setTabIndex] = useState(0)
  const { tabs, contentClassName, className } = props
  const tabPanel = tabs[tabIndex]
  const Component = tabPanel?.component
  const componentProps = tabPanel?.props

  const handleChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex)
  }

  return (
    <>
      <Tabs
        value={tabIndex}
        onChange={handleChange}
        className={clsx(classes.tabs, className)}
      >
        {tabs.map((tabPanel, index) => (
          <Tab
            label={tabPanel.caption}
            key={index}
            className={clsx(classes.tab, {
              [classes.active]: tabIndex === index
            })}
          />
        ))}
      </Tabs>
      {tabPanel && (
        <TabPanel value={tabIndex} index={tabIndex}>
          <div className={contentClassName}>
            <Component {...componentProps} />
          </div>
        </TabPanel>
      )}
    </>
  )
}

export { CustomTabs as Tabs }
