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

import React from 'react'
import { saveAs } from 'file-saver'
import { useAppContext } from '../../../../hooks'

const SaveButton = props => {
  const noop = () => null
  const {
    server,
    filename = 'unnamed',
    data,
    type,
    className = '',
    mode = 'saveFile',
    onSave = noop,
    onError = noop
  } = props
  const { getKetcherInstance } = useAppContext()

  const save = event => {
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
    if (server && data) {
      try {
        fileSaver(server).then(saver => {
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
    ketcherInstance
      .generateImageAsync(data, { outputFormat: 'svg' })
      .then(blob => {
        saveAs(blob, filename)
        onSave()
      })
      .catch(error => {
        onError(error)
      })
  }

  return (
    <button
      onClick={event => {
        save(event)
      }}
      className={!server || !data ? `disabled ${className}` : className}
      {...props}>
      {props.children}
    </button>
  )
}

const fileSaver = server => {
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

export default SaveButton
