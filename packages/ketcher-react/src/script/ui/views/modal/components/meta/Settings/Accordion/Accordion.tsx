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

import React, { Component, ReactNode } from 'react'

import classes from './Accordion.module.less'
import clsx from 'clsx'
import { xor } from 'lodash/fp'

interface AccordionProps {
  className: string
  multiple: boolean
  active: Array<number>
}

interface AccordionState {
  active: Array<number>
}

interface GroupProps {
  caption: string
  children: ReactNode
}

interface ExtendedGroupProps extends GroupProps {
  isActive: (index: Array<number>) => boolean
  onActive: (index: Array<number>) => void
  index: Array<number>
}

class Accordion extends Component<AccordionProps, AccordionState> {
  constructor(props: AccordionProps) {
    super(props)
    this.state = {
      active: props.active || []
    }
  }

  onActive(index: number): void {
    const { multiple = true } = this.props

    if (!multiple) this.setState({ active: [index] })
    else
      this.setState((prevState) => ({ active: xor(prevState.active, [index]) }))
  }

  groupIsActive(index: number): boolean {
    return this.state.active.includes(index)
  }

  static Group(props: GroupProps) {
    const { caption, isActive, onActive, index, children } =
      props as ExtendedGroupProps

    return (
      <li
        className={clsx(classes.accordion_tab, {
          [classes.hidden]: !isActive(index)
        })}
      >
        <a // eslint-disable-line
          onClick={() => onActive(index)}
        >
          {caption}
        </a>
        {children}
      </li>
    )
  }

  render() {
    const { children, ...props } = this.props
    const childrenWithProps = React.Children.map(
      this.props.children,
      (child, index) => {
        // checking isValidElement is the safe way and avoids a typescript error too
        const props = {
          isActive: this.groupIsActive.bind(this),
          onActive: this.onActive.bind(this),
          index
        }
        if (React.isValidElement(child)) {
          return React.cloneElement(child, props)
        }
        return child
      }
    )
    return <ul {...props}>{childrenWithProps}</ul>
  }
}

export default Accordion
