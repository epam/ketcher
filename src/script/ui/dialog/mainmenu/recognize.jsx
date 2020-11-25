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

import React, { useState, useCallback } from 'react'
import { connect } from 'react-redux'
import { range } from 'lodash/fp'

import { changeImage, shouldFragment, changeVersion } from '../../state/options'
import { load } from '../../state'
import { recognize } from '../../state/server'

import Dialog from '../../component/dialog'
import Input from '../../component/form/input'
import StructRender from '../../component/structrender'
import OpenButton from '../../component/view/openbutton'
import Spin from '../../component/view/spin'

function isImage(file) {
  return file?.type?.includes('image')
}

function Recognize(prop) {
  const {
    file,
    structStr,
    fragment,
    version,
    imagoVersions,
    ...partProps
  } = prop
  const {
    onRecognize,
    isFragment,
    onImage,
    onChangeImago,
    ...props
  } = partProps
  const [canPreviewImage, setCanPreviewImage] = useState(true)
  const result = () =>
    structStr && !(structStr instanceof Promise)
      ? { structStr, fragment }
      : null
  const clearFile = useCallback(() => {
    onImage(null)
    return true
  }, [onImage])
  return (
    <Dialog
      title="Import From Image"
      className="recognize"
      params={props}
      result={() => result(structStr, fragment)}
      buttons={[
        <OpenButton key="image/*" onLoad={onImage} type="image/*">
          Choose file…
        </OpenButton>,
        <span key="open-filename" className="open-filename">
          {file ? file.name : null}
        </span>,
        file && (
          <button
            onClick={() => onRecognize(file, version)}
            disabled={structStr && typeof structStr !== 'string'}>
            Recognize
          </button>
        ),
        'Cancel',
        'OK'
      ]}>
      <label className="change-version">
        Imago version:
        <Input
          schema={{
            enum: imagoVersions,
            enumNames: range(1, imagoVersions.length + 1).map(
              i => `Version ${i}`
            )
          }}
          value={version}
          onChange={v => onChangeImago(v)}
        />
      </label>
      <div className="picture">
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
        {file && isImage(file) && !canPreviewImage && (
          <div>
            Preview of '{file.type}' MIME type does not supported by current
            browser
          </div>
        )}
        {(!file || (!isImage(file) && clearFile())) && (
          <div>Please choose image</div>
        )}
      </div>
      <div className="output">
        {structStr &&
          // in Edge 38: instanceof Promise always `false`
          (structStr instanceof Promise || typeof structStr !== 'string' ? (
            <Spin />
          ) : (
            <StructRender className="struct" struct={structStr} />
          ))}
      </div>
      <label>
        <Input type="checkbox" value={fragment} onChange={v => isFragment(v)} />
        Load as a fragment
      </label>
    </Dialog>
  )
}

function url(file) {
  if (!file) return null
  const URL = window.URL || window.webkitURL
  return URL ? URL.createObjectURL(file) : 'No preview'
}

export default connect(
  store => ({
    imagoVersions: store.options.app.imagoVersions,
    file: store.options.recognize.file,
    structStr: store.options.recognize.structStr,
    fragment: store.options.recognize.fragment,
    version:
      store.options.recognize.version || store.options.app.imagoVersions[0]
  }),
  (dispatch, props) => ({
    isFragment: v => dispatch(shouldFragment(v)),
    onImage: file => dispatch(changeImage(file)),
    onRecognize: (file, ver) => dispatch(recognize(file, ver)),
    onChangeImago: ver => dispatch(changeVersion(ver)),
    onOk: res => {
      dispatch(
        load(res.structStr, {
          rescale: true,
          fragment: res.fragment
        })
      )
      props.onOk(res)
    }
  })
)(Recognize)
