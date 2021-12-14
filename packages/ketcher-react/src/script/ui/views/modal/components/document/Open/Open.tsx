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
import ClipArea from '../../../../../component/cliparea/cliparea'
import { FileDrop } from './components/FileDrop'
import Recognize from '../../process/Recognize/Recognize'
import { fileOpener } from '../../../../../utils/'
import { DropButton } from './components/DropButton'
import Icon from 'src/script/ui/component/view/icon'
import { LoadingCircles } from './components/LoadingCircles'
import { OpenFileButton } from './components/OpenFileButton'

interface OpenProps {
  server: any
  errorHandler: (err: string) => void
  isRecognizeDisabled: boolean
  isAnalyzingFile: boolean
}

type Props = OpenProps &
  Pick<BaseProps, 'className'> &
  BaseCallProps & { onImageUpload: (file: File) => void }

enum MODAL_STATES {
  idle = 'idle',
  textEditor = 'textEditor',
  imageRec = 'imageRec'
}

const ICON_NAMES = {
  PASTE: 'capital-t',
  FILE: 'arrow-upward',
  IMAGE: 'image-frame',
  FILE_THUMBNAIL: 'file-thumbnail'
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
  const [currentState, setCurrentState] = useState<MODAL_STATES>(
    MODAL_STATES.idle
  )

  useEffect(() => {
    if (server) {
      fileOpener(server).then((chosenOpener) => {
        // nesting function into object, otherwise React calls function right away
        setOpener({ chosenOpener })
      })
    }
  }, [server])

  const result = () => {
    return structStr ? { structStr, fragment } : null
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

  if (isAnalyzingFile) {
    return (
      <Dialog
        title="Open structure"
        className={classes.open}
        params={rest}
        result={result}
        buttons={[]}>
        <div className={classes.fileLoadingWrapper}>
          {!!fileName && (
            <div className={classes.fileBox}>
              <Icon name={ICON_NAMES.FILE_THUMBNAIL} />
              <p>{fileName}</p>
            </div>
          )}
          <LoadingCircles />
        </div>
      </Dialog>
    )
  }

  if (currentState === MODAL_STATES.idle) {
    return (
      <Dialog
        title="Open structure"
        className={classes.open}
        params={rest}
        result={result}
        buttons={[]}>
        <div className={classes.optionsContainer}>
          <div className={classes.dropContainer}>
            <DropButton
              clickHandler={() => setCurrentState(MODAL_STATES.textEditor)}
              label="Paste from Clipboard"
            />
            <div className={classes.dropIconWrapper}>
              <Icon name={ICON_NAMES.PASTE} />
            </div>
          </div>

          <FileDrop
            accept={structAcceptMimes()}
            onDropAccepted={onFileLoad}
            onDropRejected={() =>
              errorHandler(
                `Unable to accept file(s). Make sure you upload 1 file of type: ${structAcceptMimes()}`
              )
            }
            buttonLabel="Open from file"
            textLabel="or drag file here"
            iconName={ICON_NAMES.FILE}
          />

          <FileDrop
            accept="image/*"
            disabled={isRecognizeDisabled}
            disabledText="Ketcher supports image recognition only in Remote mode"
            onDropAccepted={onImageLoad}
            onDropRejected={() =>
              errorHandler(
                'Unable to accept file(s). Make sure you upload 1 image.'
              )
            }
            buttonLabel="Open from image"
            textLabel="or drag file here"
            iconName={ICON_NAMES.IMAGE}
          />
        </div>
      </Dialog>
    )
  }

  if (currentState === MODAL_STATES.textEditor) {
    return (
      <Dialog
        title="Open Structure"
        className={classes.open}
        result={result}
        params={rest}
        buttons={[
          <OpenFileButton
            key="openButton"
            disabled={!result()}
            clickHandler={openHandler}
          />
        ]}>
        <textarea
          value={structStr}
          onChange={(event) => setStructStr(event.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={fragment}
            onChange={(event) => setFragment(event.target.checked)}
          />
          Load as a fragment and copy to the Clipboard
        </label>
        <ClipArea
          focused={() => true}
          onCopy={() => ({ 'text/plain': structStr })}
        />
      </Dialog>
    )
  }

  if (currentState === MODAL_STATES.imageRec) {
    return <Recognize {...rest} />
  }
  return null
}

export type { OpenProps }
export default Open
