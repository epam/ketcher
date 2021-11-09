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

import { Component } from 'react'

import { Dialog } from '../../../../components'
import { FormatterFactory } from 'ketcher-core'
import { MIEW_OPTIONS } from '../../../../../data/schema/options-schema'
import classes from './Miew.module.less'
import { connect } from 'react-redux'
import { load } from '../../../../../state'
import { pick } from 'lodash/fp'

/* OPTIONS for MIEW */
const BACKGROUND_COLOR = {
  dark: '0x202020',
  light: '0xcccccc'
}

const MIEW_TX_TYPES = {
  no: null,
  bright: {
    colorer: 'EL'
  },
  blackAndWhite: {
    colorer: ['UN', { color: 0xffffff }],
    bg: '0x000'
  },
  black: {
    colorer: ['UN', { color: 0x000000 }]
  }
}

const TXoptions = userOpts => {
  const type = userOpts.miewAtomLabel
  if (MIEW_TX_TYPES[type] === null) return null
  return {
    colorer: MIEW_TX_TYPES[type].colorer,
    selector: 'not elem C',
    mode: [
      'TX',
      {
        bg: MIEW_TX_TYPES[type].bg || BACKGROUND_COLOR[userOpts.miewTheme],
        showBg: true,
        template: '{{elem}}'
      }
    ]
  }
}

function createMiewOptions(userOpts) {
  const options = {
    settings: {
      bg: { color: Number(BACKGROUND_COLOR[userOpts.miewTheme]) },
      autoPreset: false,
      editing: true,
      inversePanning: true
    },
    reps: [
      {
        mode: userOpts.miewMode
      }
    ]
  }

  const textMode = TXoptions(userOpts)
  if (textMode) options.reps.push(textMode)

  return options
}
/* ---------------- */
const CHANGING_WARNING =
  'Stereocenters can be changed after the strong 3D rotation'

class MiewDialog extends Component {
  componentDidMount() {
    const { struct, server, miewOpts } = this.props
    const Miew = window.Miew

    this.viewer = new Miew({
      container: this.miewContainer
    })

    if (this.viewer.init()) this.viewer.run()

    const factory = new FormatterFactory(server)
    const service = factory.create('cml')

    service
      .getStructureFromStructAsync(struct)
      .then(res =>
        this.viewer.load(res, { sourceType: 'immediate', fileType: 'cml' })
      )
      .then(() => this.viewer.setOptions(miewOpts))
      .catch(ex => console.error(ex.message))
  }

  exportCML() {
    const cmlStruct = this.viewer.exportCML()
    this.props.onExportCML(cmlStruct)
  }

  render() {
    const { miewOpts, server, struct, ...prop } = this.props

    return (
      <Dialog
        title="Miew"
        params={prop}
        buttons={[
          <div key="warning" className={classes.warning}>
            {CHANGING_WARNING}
          </div>,
          'Close',
          <button key="apply" onClick={() => this.exportCML()}>
            Apply
          </button>
        ]}
      >
        <div className={classes.dialog_body}>
          <div
            ref={el => {
              this.miewContainer = el
            }}
            className={classes.miewContainer}
            style={{ width: '1024px', height: '600px', position: 'relative' }}
          />
        </div>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  miewOpts: createMiewOptions(pick(MIEW_OPTIONS, state.options.settings)),
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct()
})

const mapDispatchToProps = dispatch => ({
  onExportCML: cmlStruct => {
    dispatch(load(cmlStruct))
    // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
    // See PR #731 (https://github.com/epam/ketcher/pull/731)
  }
})

const Miew = connect(mapStateToProps, mapDispatchToProps)(MiewDialog)

export default Miew
