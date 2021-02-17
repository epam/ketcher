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

import React, { useRef } from 'react'
import useResizeObserver from 'use-resize-observer'

import modals from '../../dialog'

import styles from './Modal.module.less'

interface ModalProps {
  modal: {
    name: string
    form: any
    prop: any
  }
  onCancel: () => void
  onOk: (result: any) => void
}

function Modal(props: ModalProps) {
  const { modal, ...rest } = props
  const ref = useRef<HTMLDivElement>(null)
  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref
  })

  if (!modal) return null

  const Component = modals[modal.name]

  if (!Component)
    throw new Error(`There is no modal window named ${modal.name}`)

  return (
    <div className={styles.ketOverlay} ref={ref}>
      <Component containerSize={{ height, width }} {...rest} />
    </div>
  )
}

export type { ModalProps }
export { Modal }
