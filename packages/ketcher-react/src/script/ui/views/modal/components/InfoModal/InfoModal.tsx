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

import { connect } from 'react-redux'
import config from 'src/script/ui/action'
import { error } from './constants'
import { Dialog } from '../../../components'
import { PasteErrorModalBody } from './PasteErrorModalBody'

import styles from './InfoModal.module.less'

function ErrorInfoModal(props) {
  console.log('props in ErrorInfoModal', props)

  const paste = config.paste.title ?? 'Paste'
  const isPasteError = props.message === paste

  const defaultMessage = `This action is unavailable via menu. Instead, use shortcut to ${props.message}.`

  const headerContent = <div>{error.message}</div>

  return (
    <Dialog
      className={styles.infoModal}
      params={props}
      buttons={[
        <button onClick={props.onOk} className={styles.ok} key="ok">
          Close
        </button>
      ]}
      headerContent={headerContent}
    >
      <div>{isPasteError ? <PasteErrorModalBody /> : defaultMessage}</div>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  errorMessage: state.options.app.errorMessage
})

const mapDispatchToProps = (dispatch) => ({
  onOk: (_result) => {
    dispatch({ type: 'MODAL_CLOSE' })
  }
})

const InfoModal = connect(mapStateToProps, mapDispatchToProps)(ErrorInfoModal)

export default InfoModal
