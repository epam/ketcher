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

import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { Dialog, LoadingCircles } from '../../../../components'
import {
  FormatterFactory,
  Struct,
  StructService,
  SupportedFormat
} from 'ketcher-core'
import { MIEW_OPTIONS } from '../../../../../data/schema/options-schema'
import classes from './Miew.module.less'
import { connect } from 'react-redux'
import { load } from '../../../../../state'
import { pick } from 'lodash/fp'
import { Miew as MiewAsType } from 'miew'

const Viewer = lazy(() => import('miew-react'))

type MiewDialogProps = {
  miewOpts: any
  server: StructService
  struct: Struct
  onCancel: () => void
  onOk: (result: any) => void
  miewTheme: 'dark' | 'light'
}
type MiewDialogCallProps = {
  onExportCML: (cmlStruct: string) => void
}
type Props = MiewDialogProps & MiewDialogCallProps

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

const TXoptions = (userOpts) => {
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

const FooterContent = () => (
  <div className={classes.warning}>{CHANGING_WARNING}</div>
)

const MiewDialog = ({
  miewOpts,
  server,
  struct,
  onExportCML,
  miewTheme = 'light',
  ...prop
}: Props) => {
  const miewRef = useRef<MiewAsType>()
  const [isInitialized, setIsIsInitialized] = useState(false)

  const onMiewInit = useCallback(
    (miew: MiewAsType) => {
      miewRef.current = miew
      const factory = new FormatterFactory(server)
      const service = factory.create(SupportedFormat.cml)

      service
        .getStructureFromStructAsync(struct)
        .then((res) =>
          miew.load(res, { sourceType: 'immediate', fileType: 'cml' })
        )
        .then(() => {
          miew.setOptions(miewOpts)
          setIsIsInitialized(true)
        })
        .catch((ex) => console.error(ex.message))
    },
    [miewOpts, server, struct]
  )

  const exportCML = useCallback(() => {
    const cmlStruct = miewRef.current?.exportCML()
    if (!cmlStruct) {
      return
    }
    onExportCML(cmlStruct)
  }, [onExportCML, miewRef])

  return (
    <Dialog
      title="Miew"
      needMargin={false}
      params={prop}
      buttons={[
        'Cancel',
        <button
          key="apply"
          onClick={exportCML}
          className={classes.applyButton}
          disabled={!isInitialized}
        >
          Apply
        </button>
      ]}
      footerContent={<FooterContent />}
      className={classes.miewDialog}
    >
      <div>
        <div
          className={`${classes.miewContainer} ${
            miewTheme === 'dark' ? classes.miewDarkTheme : ''
          }`}
        >
          <Suspense
            fallback={
              <div className={classes.loadingContainer}>
                <LoadingCircles />
              </div>
            }
          >
            <Viewer onInit={onMiewInit} />
          </Suspense>
        </div>
      </div>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  miewOpts: createMiewOptions(pick(MIEW_OPTIONS, state.options.settings)),
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  miewTheme: state.options.settings.miewTheme
})

const mapDispatchToProps = (dispatch) => ({
  onExportCML: (cmlStruct) => {
    dispatch(load(cmlStruct))
    // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
    // See PR #731 (https://github.com/epam/ketcher/pull/731)
  }
})

const Miew = connect(mapStateToProps, mapDispatchToProps)(MiewDialog)

export default Miew
