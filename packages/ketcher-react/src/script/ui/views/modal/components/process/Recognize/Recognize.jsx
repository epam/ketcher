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

import { useCallback, useEffect, useState } from 'react'
import {
  changeImage,
  changeVersion,
  shouldFragment
} from '../../../../../state/options'

import { Dialog } from '../../../../components'
import Input from '../../../../../component/form/input'
import OpenButton from '../../../../../component/view/openbutton'
import { LoadingCircles } from 'src/script/ui/views/components/Spinner'
import StructRender from '../../../../../component/structrender'
import classes from './Recognize.module.less'
import { connect } from 'react-redux'
import { load } from '../../../../../state'
import { range } from 'lodash/fp'
import { recognize } from '../../../../../state/server'
import { DialogActionButton } from 'src/script/ui/views/modal/components/document/Open/components/DialogActionButton'
import Icon from 'src/script/ui/component/view/icon'

function isImage(file) {
  return file?.type?.includes('image')
}

function FooterContent({ onImage, structStr, openHandler, copyHandler }) {
  return (
    <div className={classes.footerContent}>
      <OpenButton
        key="choose"
        onLoad={onImage}
        type="image/*"
        className={classes.openButton}
      >
        <Icon name="open" />
        <span>Change image</span>
      </OpenButton>
      <div>
        <DialogActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          styles={classes.secondaryButton}
          label="Open as new Project"
        />
        <DialogActionButton
          key="copyButton"
          disabled={!structStr}
          clickHandler={copyHandler}
          styles={classes.primaryButton}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
        />
      </div>
    </div>
  )
}

function RecognizeDialog(prop) {
  const {
    file,
    structStr,
    fragment,
    version,
    imagoVersions,
    onOk,
    ...partProps
  } = prop
  const { onRecognize, isFragment, onImage, onChangeImago, ...props } =
    partProps
  const [canPreviewImage, setCanPreviewImage] = useState(true)
  const result = () =>
    structStr && !(structStr instanceof Promise)
      ? { structStr, fragment }
      : null

  useEffect(() => {
    onRecognize(file, version)
  }, [file, version])

  const clearFile = useCallback(() => {
    onImage(null)
    return true
  }, [onImage])

  const copyHandler = () => {
    onOk({ structStr, fragment: true })
  }

  const openHandler = () => {
    onOk({ structStr, fragment: false })
  }

  return (
    <Dialog
      title="Import Structure from Image"
      className={classes.recognize}
      params={{ ...props, onOk }}
      result={() => result(structStr, fragment)}
      withDivider={true}
      needMargin={false}
      footerContent={
        <FooterContent
          onImage={onImage}
          openHandler={openHandler}
          structStr={structStr}
          copyHandler={copyHandler}
        />
      }
      buttons={[]}
    >
      <div className={classes.topBody}>
        <label className={classes.imagoVersion}>
          Imago version
          <Input
            schema={{
              enum: imagoVersions,
              enumNames: range(1, imagoVersions.length + 1).map(
                (i) => `Version ${i}`
              )
            }}
            value={version}
            onChange={onChangeImago}
          />
        </label>
        <span>Original image</span>
        <span>Recognized structure preview</span>
      </div>
      <div className={classes.imagesContainer}>
        <div className={classes.picture}>
          {file && isImage(file) && canPreviewImage && (
            <img
              alt=""
              id="pic"
              src={url(file) || ''}
              onError={() => {
                setCanPreviewImage(false)
              }}
            />
          )}
          <span className={classes.filename}> {file ? file.name : null} </span>
          {file && isImage(file) && !canPreviewImage && (
            <div className={classes.messageContainer}>
              <p>
                Preview of '{file.type}' MIME type is not supported by current
                browser
              </p>
            </div>
          )}
          {(!file || (!isImage(file) && clearFile())) && (
            <div className={classes.messageContainer}>
              <p>Please choose image</p>
            </div>
          )}
        </div>
        <div className={classes.output}>
          {structStr &&
            // in Edge 38: instanceof Promise always `false`
            (structStr instanceof Promise || typeof structStr !== 'string' ? (
              <div className={classes.messageContainer}>
                <LoadingCircles onCancel={props.onCancel}/>
              </div>
            ) : (
              <StructRender className={classes.struct} struct={structStr} />
            ))}
        </div>
      </div>
    </Dialog>
  )
}

function url(file) {
  if (!file) return null
  const URL = window.URL || window.webkitURL
  return URL ? URL.createObjectURL(file) : 'No preview'
}

const mapStateToProps = (state) => ({
  imagoVersions: state.options.app.imagoVersions,
  file: state.options.recognize.file,
  structStr: state.options.recognize.structStr,
  fragment: state.options.recognize.fragment,
  version: state.options.recognize.version || state.options.app.imagoVersions[1]
})

const mapDispatchToProps = (dispatch) => ({
  isFragment: (v) => dispatch(shouldFragment(v)),
  onImage: (file) => dispatch(changeImage(file)),
  onRecognize: (file, ver) => dispatch(recognize(file, ver)),
  onChangeImago: (ver) => dispatch(changeVersion(ver)),
  onOk: (res) => {
    dispatch(
      load(res.structStr, {
        rescale: true,
        fragment: res.fragment
      })
      // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
      // See PR #731 (https://github.com/epam/ketcher/pull/731)
    )
  }
})

const Recognize = connect(mapStateToProps, mapDispatchToProps)(RecognizeDialog)

export default Recognize
