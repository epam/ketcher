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

import 'intersection-observer'
import 'element-closest-polyfill'
import 'regenerator-runtime/runtime'
import 'url-search-params-polyfill'
import 'whatwg-fetch'
import './index.less'

import init, { Config } from './script'
import { useEffect, useRef } from 'react'

import { Ketcher } from 'ketcher-core'
import classes from './Editor.module.less'
import clsx from 'clsx'
import { ketcherInitEventName } from './constants'
import { useResizeObserver } from './hooks'

const mediaSizes = {
  smallWidth: 1040,
  smallHeight: 600
}

interface EditorProps extends Omit<Config, 'element'> {
  onInit?: (ketcher: Ketcher) => void
}

function Editor(props: EditorProps) {
  const rootElRef = useRef<HTMLDivElement>(null)
  const { onInit } = props
  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: rootElRef
  })

  useEffect(() => {
    init({
      ...props,
      element: rootElRef.current
    }).then(
      ({ ketcher, ketcherId }: { ketcher: Ketcher; ketcherId: string }) => {
        if (typeof onInit === 'function') {
          onInit(ketcher)
          const ketcherInitEvent = new Event(ketcherInitEventName(ketcherId))
          window.dispatchEvent(ketcherInitEvent)
        }
      }
    )
    // TODO: provide the list of dependencies after implementing unsubscribe function
  }, [])

  return (
    <div
      ref={rootElRef}
      className={clsx('Ketcher-root', classes.editor, {
        [classes.small]:
          (height && height <= mediaSizes.smallHeight) ||
          (width && width <= mediaSizes.smallWidth)
      })}
    />
  )
}

export { Editor }
