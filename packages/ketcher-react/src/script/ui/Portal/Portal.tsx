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

import { CSSProperties, Component, ReactNode } from 'react'

import ReactDOM from 'react-dom'

const CLASSNAME_SEPARATOR = ' '

interface PortalProps {
  isOpen: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

type Props = PortalProps

class Portal extends Component<Props> {
  private readonly element: HTMLDivElement
  private isElementInDom: boolean

  constructor(props) {
    super(props)
    this.element = document.createElement('div')
    this.isElementInDom = false
  }

  componentDidMount() {
    if (!this.isElementInDom && this.props.isOpen) {
      this.addElementInDOM()
    }

    const { className, style } = this.props
    if (className) {
      this.addClassName(className)
    }
    if (style) {
      this.updateStyle(style)
    }
  }

  componentWillUnmount() {
    if (this.isElementInDom) {
      this.removeElementFromDOM()
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { isOpen, className, style } = this.props
    if (className !== prevProps.className) {
      this.removeClassNames(prevProps.className)
      this.addClassName(className)
    }

    if (style !== prevProps.style) {
      this.updateStyle(style, prevProps.style)
    }

    if (isOpen === prevProps.isOpen) {
      return
    }

    if (isOpen && !this.isElementInDom) {
      this.addElementInDOM()
    } else if (this.isElementInDom) {
      this.removeElementFromDOM()
    }
  }

  private addElementInDOM() {
    document.querySelector('.Ketcher-root')?.appendChild(this.element)
    this.isElementInDom = true
  }

  private removeElementFromDOM() {
    document.querySelector('.Ketcher-root')?.removeChild(this.element)
    this.isElementInDom = false
  }

  private removeClassNames(classNames?: string) {
    if (!classNames) {
      return
    }

    classNames.split(CLASSNAME_SEPARATOR).forEach((className) => {
      this.element.classList.remove(className)
    })
  }

  private addClassName(classNames?: string) {
    if (!classNames) {
      return
    }

    classNames.split(CLASSNAME_SEPARATOR).forEach((className) => {
      this.element.classList.add(className)
    })
  }

  private updateStyle(style?: CSSProperties, prevStyle?: CSSProperties) {
    if (prevStyle) {
      Object.keys(prevStyle).forEach((property) => {
        this.element.style[property] = ''
      }, this)
    }

    if (!style) {
      return
    }

    Object.keys(style).forEach((property) => {
      this.element.style[property] = style[property]
    }, this)
  }

  render() {
    const { children } = this.props
    const component = ReactDOM.createPortal(children, this.element)
    return component as any
  }
}

export { Portal }
