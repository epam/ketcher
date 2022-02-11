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

import {
  AtomInfo,
  ElementsTable,
  GenericGroups,
  TypeChoice
} from './components'
import { Component } from 'react'
import { fromElement, toElement } from '../../../../data/convert/structconv'

import { Dialog } from '../../../components'
import { Elements } from 'ketcher-core'
import Tabs from '../../../../component/view/Tabs'
import { addAtoms } from '../../../../state/toolbar'
import classes from './PeriodTable.module.less'
import { connect } from 'react-redux'
import { onAction } from '../../../../state'
import { xor } from 'lodash/fp'

class Table extends Component {
  constructor(props) {
    super(props)
    const genType = !this.props.pseudo ? null : 'gen'
    this.state = {
      type: props.type || genType || 'atom',
      value: props.values || props.label || null,
      current: Elements.get(2),
      isInfo: false
    }
    this.firstType = true
  }

  changeType = (type) => {
    if (this.firstType) {
      this.firstType = false
      return
    }
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

  changeTabType = (event) => {
    const type = event === 0 ? 'atom' : 'gen'
    this.changeType(type)
  }

  selected = (label) => {
    const { type, value } = this.state
    return type === 'atom' || type === 'gen'
      ? value === label
      : value.includes(label)
  }

  onSelect = (label) => {
    const { type, value } = this.state
    this.setState({
      value: type === 'atom' || type === 'gen' ? label : xor([label], value)
    })
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

  periodicTable = (value) => {
    const { type, current, isInfo } = this.state
    return (
      <div className={classes.periodTable}>
        <AtomInfo el={current} isInfo={isInfo} />
        <ElementsTable
          value={value}
          currentEvents={this.currentEvents}
          selected={this.selected}
          onSelect={this.onSelect}
        />
        <TypeChoice value={type} onChange={this.changeType} />
      </div>
    )
  }

  getButton = () => {
    const result = this.result()
    return [
      <button
        className={classes.addAtom}
        disabled={!result}
        onClick={() => this.props.onOk(result)}
      >
        Add
      </button>
    ]
  }

  render() {
    const { type, value } = this.state
    const tabs = [
      {
        caption: 'Table',
        component: this.periodicTable,
        props: { value }
      },
      {
        caption: 'Extended',
        component: GenericGroups,
        props: {
          selected: this.selected,
          onSelect: this.onSelect
        }
      }
    ]

    return (
      <Dialog
        title="Periodic table"
        className={classes.elementsTable}
        params={this.props}
        result={this.result}
        buttons={this.getButton()}
        needMargin={false}
      >
        <Tabs
          className={classes.tabs}
          contentClassName={
            type !== 'gen' ? classes.tabsContent : classes.contentGeneral
          }
          captions={tabs}
          tabIndex={type !== 'gen' ? 0 : 1}
          changeTab={this.changeTabType}
          tabs={tabs}
        />
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
