/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import React, { Component } from 'react'

class Tabs extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.state.tabIndex = props.tabIndex || 0
    this.props.changeTab(this.state.tabIndex)
  }

  //TODO: refactor the component
  changeTab(ev, index) {
    this.setState({ tabIndex: index })
    if (this.props.changeTab) this.props.changeTab(index)
  }

  render() {
    const { tabs, ...other } = this.props
    const tabPanel = tabs[this.state.tabIndex]
    const Component = tabPanel?.component
    const componentProps = tabPanel?.props
    return (
      <ul {...other}>
        <li className="tabs">
          {tabs.map((tabPanel, index) => (
            <a // eslint-disable-line
              key={index}
              className={this.state.tabIndex === index ? 'active' : ''}
              onClick={ev => this.changeTab(ev, index)}>
              {tabPanel.caption}
            </a>
          ))}
        </li>
        {tabPanel && (
          <li className="tabs-content">
            <Component {...componentProps} />
          </li>
        )}
      </ul>
    )
  }
}

export default Tabs
