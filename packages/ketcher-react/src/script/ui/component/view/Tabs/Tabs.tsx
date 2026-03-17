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

import { Component, ComponentType, MouseEvent, KeyboardEvent } from 'react';
import classes from './Tabs.module.less';
import clsx from 'clsx';

interface TabPanel {
  caption: string;
  component?: ComponentType;
  props?: Record<string, unknown>;
  tabIndex?: number;
}

interface TabsProps {
  tabs: TabPanel[];
  tabIndex?: number;
  changeTab: (index: number) => void;
  className?: string;
  contentClassName?: string;
  captions?: TabPanel[];
}

interface TabsState {
  tabIndex: number;
}

class Tabs extends Component<TabsProps, TabsState> {
  constructor(props: TabsProps) {
    super(props);
    this.state = {
      tabIndex: props.tabIndex || 0,
    };
    this.props.changeTab(this.state.tabIndex);
  }

  // TODO: refactor the component
  changeTab(_ev: MouseEvent | KeyboardEvent, index: number) {
    this.setState({ tabIndex: index });
    if (this.props.changeTab) this.props.changeTab(index);
  }

  handleKeyDown(ev: KeyboardEvent, index: number) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.changeTab(ev, index);
    }
  }

  componentDidUpdate(prevProps: TabsProps) {
    if (this.props.tabIndex !== prevProps.tabIndex) {
      this.setState({ tabIndex: this.props.tabIndex || 0 });
    }
  }

  render() {
    const { tabs, contentClassName, className, tabIndex } = this.props;
    const tabPanel = tabs[this.state.tabIndex];
    const TabComponent = tabPanel?.component;
    const componentProps = tabPanel?.props;
    return (
      <div>
        <ul className={className} tabIndex={tabIndex}>
          <li className={classes.tabs}>
            {tabs.map((tabPanel, index) => (
              <button
                type="button"
                key={tabPanel.caption}
                className={clsx({
                  [classes.active]: this.state.tabIndex === index,
                })}
                onClick={(ev) => this.changeTab(ev, index)}
                onKeyDown={(ev) => this.handleKeyDown(ev, index)}
                tabIndex={0}
                data-testid={tabPanel.caption + '-tab'}
              >
                {tabPanel.caption}
              </button>
            ))}
          </li>
        </ul>
        {TabComponent && (
          <div className={contentClassName}>
            <TabComponent {...componentProps} />
          </div>
        )}
      </div>
    );
  }
}

export default Tabs;
