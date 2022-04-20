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
import Recognize from '../../process/Recognize/Recognize'
import { fileOpener } from '../../../../../utils/'
import { DialogActionButton } from './components/DialogActionButton'
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

const FooterContent = ({ structStr, openHandler, copyHandler, onCancel }) => {
  return (
    <div className={classes.footerContent}>
      <button onClick={onCancel} className={classes.cancelButton}>
        Cancel
      </button>
      <div className={classes.buttonsContainer}>
        <DialogActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          styles={classes.openButton}
          label="Open as New Project"
        />
        <DialogActionButton
          key="copyButton"
          disabled={!structStr}
          clickHandler={copyHandler}
          styles={classes.copyButton}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
        />
      </div>
    </div>
  )
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

  const onFileLoad = (files) => {
    const onLoad = (fileContent) => {
      setStructStr(fileContent)
      setCurrentState(MODAL_STATES.textEditor)
    }
    const onError = () => errorHandler('Error processing file')

    setFileName(files[0].name)
    opener.chosenOpener(files[0]).then(onLoad, onError)
  }

  const onImageLoad = (files) => {
    onImageUpload(files[0])
    setCurrentState(MODAL_STATES.imageRec)
  }

  // @TODO after Recognize is refactored this will not be necessary
  // currently not destructuring onOk with other props so we can pass it with ...rest to Recognize below
  const { onOk } = rest

  const copyHandler = () => {
    onOk({ structStr, fragment: true })
  }

  const openHandler = () => {
    onOk({ structStr, fragment: false })
  }

  const withFooterContent =
    currentState === MODAL_STATES.textEditor && !isAnalyzingFile

  // @TODO after refactoring of Recognize modal
  // add Recognize rendering logic into ViewSwitcher component here
  if (currentState === MODAL_STATES.imageRec) {
    return <Recognize {...rest} />
  }

  return (
    <Dialog
      title="Open structure"
      className={classes.open}
      params={rest}
      result={() => null}
      footerContent={
        withFooterContent ? (
          <FooterContent
            structStr={structStr}
            openHandler={openHandler}
            copyHandler={copyHandler}
            onCancel={rest.onCancel}
          />
        ) : undefined
      }
      buttons={[]}
      withDivider
    >
      <ViewSwitcher
        isAnalyzingFile={isAnalyzingFile}
        fileName={fileName}
        currentState={currentState}
        states={MODAL_STATES}
        selectClipboard={() => setCurrentState(MODAL_STATES.textEditor)}
        fileLoadHandler={onFileLoad}
        imageLoadHandler={onImageLoad}
        errorHandler={errorHandler}
        isRecognizeDisabled={isRecognizeDisabled}
        structStr={structStr}
        inputHandler={setStructStr}
      />
    </Dialog>
  )
}

export type { OpenProps }
export default Open
