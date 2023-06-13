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

import { AtomInfo, ElementsTable, TypeChoice } from './components'
import { fromElement, toElement } from '../../../../data/convert/structconv'

import { Component } from 'react'
import { Dialog } from '../../../components'
import { Elements } from 'ketcher-core'
import Tabs from '../../../../component/view/Tabs'
import { addAtoms } from '../../../../state/toolbar'
import classes from './PeriodTable.module.less'
import { connect } from 'react-redux'
import { onAction } from '../../../../state'
import { xor } from 'lodash/fp'
import { Icon } from 'components'

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: props.type || 'atom',
      value: props.values || (!props.pseudo ? props.label : null) || null,
      current: Elements.get(2),
      isInfo: false
    }
  }

  changeType = (type) => {
    const prevChoice =
      this.state.type === 'list' || this.state.type === 'not-list'
    const currentChoice = type === 'list' || type === 'not-list'
    if (prevChoice && currentChoice) {
      this.setState({ type })
    } else {
      this.setState({
        type,
        value: type === 'atom' || type === 'gen' ? null : []
      })
    }
  }

  headerContent = () => (
    <div className={classes.dialogHeader}>
      <Icon name="period-table" />
      <span>Periodic Table</span>
    </div>
  )

  selected = (label) => {
    const { type, value } = this.state
    return type === 'atom' || type === 'gen'
      ? value === label
      : value.includes(label)
  }

  onAtomSelect = (label, activateImmediately = false) => {
    if (activateImmediately) {
      const result = this.result()
      const { type } = this.state
      if (result && type === 'atom') {
        this.props.onOk(this.result())
      }
    } else {
      const { type, value } = this.state
      this.setState({
        value: type === 'atom' || type === 'gen' ? label : xor([label], value)
      })
    }
  }

  result = () => {
    const { type, value } = this.state
    if (!value || !value.length) {
      return null
    }
    if (type === 'atom') {
      return { label: value, pseudo: null }
    } else if (type === 'gen') {
      return { type, label: value, pseudo: value }
    }
    return { type, values: value }
  }

  currentEvents = (element) => {
    return {
      onMouseEnter: () => this.setState({ current: element, isInfo: true }),
      onMouseLeave: () => this.setState({ isInfo: false })
    }
  }

  render() {
    const { type, value } = this.state
    const HeaderContent = this.headerContent

    return (
      <Dialog
        headerContent={<HeaderContent />}
        className={classes.elementsTable}
        params={this.props}
        result={this.result}
        buttons={['Cancel', 'OK']}
        buttonsNameMap={{ OK: 'Add' }}
        needMargin={false}
        footerContent={
          <TypeChoice value={this.state.type} onChange={this.changeType} />
        }
      >
        <div className={classes.periodTable}>
          <AtomInfo el={this.state.current} isInfo={this.state.isInfo} />
          <ElementsTable
            value={value}
            currentEvents={this.currentEvents}
            selected={this.selected}
            onAtomSelect={(label) => this.onAtomSelect(label)}
            onDoubleClick={(label) => this.onAtomSelect(label, true)}
          />
        </div>
      </Dialog>
    )
  }
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
      if (!result.type || result.type === 'atom') {
        dispatch(addAtoms(result.label))
      }
      dispatch(onAction({ tool: 'atom', opts: toElement(result) }))
      ownProps.onOk(result)
    }
  }
}

const PeriodTable = connect(mapStateToProps, mapDispatchToProps)(Table)

export default PeriodTable
