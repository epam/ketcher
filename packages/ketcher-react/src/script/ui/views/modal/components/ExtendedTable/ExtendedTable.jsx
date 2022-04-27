/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { Dialog } from '../../../components'
import GenericGroups from './components/GenericGroups'
import classes from './ExtendedTable.module.less'
import { useState } from 'react'
import { connect } from 'react-redux'
import { onAction } from '../../../../state'
import { toElement, fromElement } from '../../../../data/convert/structconv'

const Table = (props) => {
  const [value, setValue] = useState(null)

  const selected = (label) => value === label

  const result = () => {
    if (!value || !value.length) {
      return null
    }
    return { type: 'gen', label: value, pseudo: value }
  }

  const onAtomSelect = (label) => {
    setValue(label)
  }

  return (
    <Dialog
      title="Extended Table"
      withDivider
      className={classes.extendedTable}
      params={props}
      result={result}
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Add' }}
      needMargin={false}
    >
      <GenericGroups
        selected={selected}
        onAtomSelect={onAtomSelect}
      ></GenericGroups>
    </Dialog>
  )
}

function mapSelectionToProps(editor) {
  const selection = editor.selection()

  if (
    selection &&
    Object.keys(selection).length === 1 &&
    selection.atoms &&
    Object.keys(selection.atoms).length === 1
  ) {
    const struct = editor.struct()
    const atom = struct.atoms.get(selection.atoms[0])
    return { ...fromElement(atom) }
  }

  return {}
}

const mapStateToProps = (state, ownProps) => {
  if (ownProps.values || ownProps.label) {
    return {}
  }
  return mapSelectionToProps(state.editor)
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onOk: (result) => {
      dispatch(onAction({ tool: 'atom', opts: toElement(result) }))
      ownProps.onOk(result)
    }
  }
}

const ExtendedTable = connect(mapStateToProps, mapDispatchToProps)(Table)

export default ExtendedTable
