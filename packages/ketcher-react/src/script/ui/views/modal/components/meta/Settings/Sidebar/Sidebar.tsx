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

import React, { useState } from 'react'
import classes from './Sidebar.module.less'
import clsx from 'clsx'
import Icon from '../../../../../../component/view/icon'

const Sidebar = ({ tabs, className }): React.ReactElement => {
  const [activeTab, setActiveTab] = useState('General')

  const handleSwitchTab = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className={clsx(classes.sidebar, className)}>
      <ul className={classes.tabs}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label
          return (
            <li
              key={tab.key}
              onClick={() => handleSwitchTab(tab.label)}
              className={clsx(classes.tab, isActive && classes.active)}
            >
              <Icon
                name={isActive ? `${tab.key}-white` : tab.key}
                className={classes.icon}
              />
              <span>{tab.label}</span>
            </li>
          )
        })}
      </ul>
      <div className={classes.content}>
        {tabs.find((tab) => tab.label === activeTab).content}
      </div>
    </div>
  )
}

export default Sidebar
