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

import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'

import { formatProperties } from 'ketcher-core'
import { Dialog } from '../../../../components'
import OpenButton from '../../../../../component/view/openbutton'
import ClipArea, { exec } from '../../../../../component/cliparea'

import { load } from '../../../../../state'

import styles from './Open.module.less'

class Open extends Component {
  constructor(props) {
    super(props)
    this.state = {
      structStr: '',
      fragment: false
    }
    this.textAreaRef = createRef()
  }

  result = () => {
    const { structStr, fragment } = this.state
    return structStr ? { structStr, fragment } : null
  }

  changeStructStr = structStr => {
    this.setState({ structStr })
  }

  changeFragment = target => {
    this.setState({
      fragment: target.checked
    })
  }

  structAcceptMimes = () => {
    return Object.keys(formatProperties)
      .reduce(
        (res, key) =>
          res.concat(
            formatProperties[key].mime,
            ...formatProperties[key].extensions
          ),
        []
      )
      .join(',')
  }

  render() {
    const { structStr, fragment } = this.state
    return (
      <Dialog
        title="Open Structure"
        className={styles.open}
        result={() => this.result()}
        params={this.props}
        buttons={[
          <OpenButton
            key={this.structAcceptMimes().toString()}
            server={this.props.server}
            type={this.structAcceptMimes()}
            onLoad={this.changeStructStr}>
            Open From File…
          </OpenButton>,
          'Cancel',
          'OK'
        ]}>
        <textarea
          value={structStr} //TODO: fix React warning
          onInput={ev => this.changeStructStr(ev.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={fragment} //TODO: fix React warning
            onClick={ev => this.changeFragment(ev.target)}
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
}

const mapStateToProps = state => ({ server: state.server })

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOk: res => {
    if (res.fragment) exec('copy')
    dispatch(
      load(res.structStr, {
        badHeaderRecover: true,
        fragment: res.fragment
      })
    )
    ownProps.onOk(res)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Open)
