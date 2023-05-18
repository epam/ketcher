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
import { OutputFormatType } from 'ketcher-core'

import { saveAs } from 'file-saver'
import React, { PropsWithChildren } from 'react'
import { useAppContext } from '../../../../hooks'

type Props = {
  server?: any
  filename: string
  outputFormat?: OutputFormatType
  data: any
  type?: string
  mode?: string
  onSave?: () => void
  onError?: (err: any) => void
  className?: string
  title?: string
  disabled?: boolean
}

type FileSaverReturnType = Promise<
  (data: Blob | string, fn, type: string | undefined) => void | never
>

type SaverType = Awaited<FileSaverReturnType>
type SaveButtonProps = PropsWithChildren<Props>

const SaveButton = (props: SaveButtonProps) => {
  const noop = () => null
  const {
    server,
    filename = 'unnamed',
    outputFormat,
    data,
    type,
    mode = 'saveFile',
    onSave = noop,
    onError = noop,
    className,
    title,
    disabled
  } = props
  const { getKetcherInstance } = useAppContext()

  const save = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault()
    switch (mode) {
      case 'saveImage':
        saveImage()
        break
      case 'saveFile':
      default:
        saveFile()
    }
  }

  const saveFile = () => {
    if (data) {
      try {
        fileSaver(server).then((saver: SaverType) => {
          saver(data, filename, type)
          onSave()
        })
      } catch (error) {
        onError(error)
      }
    }
  }

  const saveImage = () => {
    const ketcherInstance = getKetcherInstance()
    if (outputFormat) {
      ketcherInstance
        .generateImage(data, { outputFormat })
        .then((blob) => {
          saveAs(blob, `${filename}.${outputFormat}`)
          onSave()
        })
        .catch((error) => {
          onError(error)
        })
    }
  }

  return (
    <button
      title={title}
      className={className}
      disabled={disabled}
      onClick={(event) => {
        save(event)
      }}
    >
      {props.children}
    </button>
  )
}

const fileSaver = (server): FileSaverReturnType => {
  return new Promise((resolve, reject) => {
    if (global.Blob && saveAs) {
      resolve((data, fn, type) => {
        const blob = new Blob([data], { type }) // eslint-disable-line no-undef
        saveAs(blob, fn)
      })
    } else if (server) {
      resolve(
        server.then(() => {
          throw Error("Server doesn't still support echo method")
        })
      )
    } else {
      reject(new Error('Your browser does not support opening files locally'))
    }
  })
}

export { SaveButton }
