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

import { BaseCallProps, BaseProps } from '../../../modal.types'
import { FC, useEffect, useState } from 'react'
import { Dialog } from '../../../../components'
import classes from './Open.module.less'
import { formatProperties } from 'ketcher-core'
import Recognize from '../../process/Recognize/Recognize'
import { fileOpener } from '../../../../../utils/'
import { OpenFileButton } from './components/OpenFileButton'
import { ViewSwitcher } from './components/ViewSwitcher'

interface OpenProps {
  server: any
  errorHandler: (err: string) => void
  isRecognizeDisabled: boolean
  isAnalyzingFile: boolean
}

type Props = OpenProps &
  Pick<BaseProps, 'className'> &
  BaseCallProps & { onImageUpload: (file: File) => void }

const MODAL_STATES = {
  idle: 'idle',
  textEditor: 'textEditor',
  imageRec: 'imageRec'
}

const structAcceptMimes = () => {
  return Array.from(
    new Set(
      Object.keys(formatProperties).reduce(
        (res, key) =>
          res.concat(
            formatProperties[key].mime,
            ...formatProperties[key].extensions
          ),
        []
      )
    )
  ).join(',')
}

const Open: FC<Props> = (props) => {
  const {
    server,
    onImageUpload,
    errorHandler,
    isAnalyzingFile,
    isRecognizeDisabled,
    ...rest
  } = props

  const [structStr, setStructStr] = useState<string>('')
  const [fragment, setFragment] = useState<boolean>(false)
  const [fileName, setFileName] = useState<string>('')
  const [opener, setOpener] = useState<any>()
  const [currentState, setCurrentState] = useState(MODAL_STATES.idle)

  useEffect(() => {
    if (server) {
      fileOpener(server).then((chosenOpener) => {
        setOpener({ chosenOpener })
      })
    }
  }, [server])

  const result = () => {
    return structStr ? { structStr, fragment } : null
  }

  const getButtons = () => {
    if (currentState === MODAL_STATES.textEditor && !isAnalyzingFile) {
      return [
        <OpenFileButton
          key="openButton"
          disabled={!result()}
          clickHandler={openHandler}
        />
      ]
    } else {
      return []
    }
  }

  const onFileLoad = (files) => {
    const onLoad = (fileContent) => {
      setCurrentState(MODAL_STATES.textEditor)
      setStructStr(fileContent)
    }
    const onError = () => errorHandler('Error processing file')

    setFileName(files[0].name)
    opener.chosenOpener(files[0]).then(onLoad, onError)
  }

  const onImageLoad = (files) => {
    onImageUpload(files[0])
    setCurrentState(MODAL_STATES.imageRec)
  }

  const openHandler = () => {
    const { onOk } = rest
    onOk(result())
  }

  // @TODO after refactoring of Recognize modal
  // add this logic into ViewSwitcher component
  if (currentState === MODAL_STATES.imageRec) {
    return <Recognize {...rest} />
  }

  return (
    <Dialog
      title="Open structure"
      className={classes.open}
      params={rest}
      result={result}
      buttons={getButtons()}
    >
      <ViewSwitcher
        isAnalyzingFile={isAnalyzingFile}
        fileName={fileName}
        currentState={currentState}
        states={MODAL_STATES}
        clipboardHandler={() => setCurrentState(MODAL_STATES.textEditor)}
        fileLoadHandler={onFileLoad}
        imageLoadHandler={onImageLoad}
        acceptedNonImageTypes={structAcceptMimes()}
        errorHandler={errorHandler}
        isRecognizeDisabled={isRecognizeDisabled}
        structStr={structStr}
        inputHandler={setStructStr}
        fragment={fragment}
        fragmentHandler={setFragment}
      />
    </Dialog>
  )
}

export type { OpenProps }
export default Open
