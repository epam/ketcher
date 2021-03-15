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

import React, { useRef, useEffect, FC } from 'react'
import * as KN from 'w3c-keyname'
import clsx from 'clsx'

import style from './Dialog.module.less'

interface DialogProps {
  title: string
  params: DialogParams
  buttons?: Array<string | React.ReactElement>
  className: string
}
interface DialogParams extends DialogParamsCallProps {
  className: string
}

interface DialogParamsCallProps {
  onCancel: () => void
  onOk: (result: any) => void
}

interface DialogCallProps {
  result: () => any
  valid?: () => boolean
}

type Props = DialogProps & DialogCallProps

const Dialog: FC<Props> = props => {
  const {
    children,
    title,
    params,
    result = () => null,
    valid = () => !!result(),
    buttons = ['Cancel', 'OK'],
    className,
    ...rest
  } = props
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dialogRef?.current) {
      const element: HTMLElement | null =
        dialogRef.current.querySelector(
          [
            'input:not([type=checkbox]):not([type=button])',
            'textarea',
            '[contenteditable]',
            'select'
          ].join(',')
        ) || dialogRef.current.querySelector(`button.${style.close}`)
      element?.focus()
    }

    return () => {
      const element: HTMLElement | null =
        document.querySelector('.cliparea') || document.body
      element?.focus()
    }
  }, [dialogRef, dialogRef.current])

  const exit = mode => {
    const key = mode === 'OK' ? 'onOk' : 'onCancel'
    if (params && key in params && (key !== 'onOk' || valid()))
      params[key](result())
  }

  const keyDown = event => {
    const key = KN.keyName(event)
    const active = document.activeElement
    const activeTextarea = active && active.tagName === 'TEXTAREA'
    if (key === 'Escape' || (key === 'Enter' && !activeTextarea)) {
      exit(key === 'Enter' ? 'OK' : 'Cancel')
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      onSubmit={event => event.preventDefault()}
      onKeyDown={keyDown}
      tabIndex={-1}
      className={clsx(style.form, className, params.className)}
      {...rest}>
      <header>
        {title}
        {title && (
          <button className={style.close} onClick={() => exit('Cancel')}>
            ×
          </button>
        )}
      </header>
      <div className={style.dialog_body}>{children}</div>

      <footer>
        {buttons.map(button =>
          typeof button !== 'string' ? (
            button
          ) : (
            <input
              key={button}
              type="button"
              value={button}
              disabled={button === 'OK' && !valid()}
              onClick={() => exit(button)}
            />
          )
        )}
      </footer>
    </div>
  )
}

export default Dialog
