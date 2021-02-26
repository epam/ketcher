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

import { escapeRegExp, flow, filter as _filter, reduce, omit } from 'lodash/fp'
import { createSelector } from 'reselect'
import { List, AutoSizer } from 'react-virtualized'

import React, { Component } from 'react'
import { connect } from 'react-redux'

import sdf from '../../../chem/sdf'
import StructRender from '../../component/structrender'
import { Dialog } from '../../views/components'
import SaveButton from '../../component/view/savebutton'
import Input from '../../component/form/input'
import SelectList from '../../component/form/select'

import {
  changeFilter,
  changeGroup,
  selectTmpl,
  editTmpl,
  deleteTmpl
} from '../../state/templates'
import { onAction } from '../../state'
import styles from './template-lib.module.less'

const GREEK_SIMBOLS = {
  Alpha: 'A',
  alpha: 'α',
  Beta: 'B',
  beta: 'β',
  Gamma: 'Г',
  gamma: 'γ'
}

function tmplName(tmpl, i) {
  console.assert(tmpl.props && tmpl.props.group, 'No group')
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`
}

const greekRe = new RegExp(
  '\\b' + Object.keys(GREEK_SIMBOLS).join('\\b|\\b') + '\\b',
  'g'
)
function greekify(str) {
  return str.replace(greekRe, sym => GREEK_SIMBOLS[sym])
}

const filterLibSelector = createSelector(
  props => props.lib,
  props => props.filter,
  filterLib
)

function filterLib(lib, filter) {
  console.warn('Filter', filter)
  const re = new RegExp(escapeRegExp(greekify(filter)), 'i')
  return flow(
    _filter(
      item =>
        !filter ||
        re.test(greekify(item.struct.name)) ||
        re.test(greekify(item.props.group))
    ),
    reduce((res, item) => {
      if (!res[item.props.group]) res[item.props.group] = [item]
      else res[item.props.group].push(item)
      return res
    }, {})
  )(lib)
}

function RenderTmpl({ tmpl, ...props }) {
  return tmpl.props && tmpl.props.prerender ? (
    <svg {...props}>
      <use xlinkHref={tmpl.props.prerender} />
    </svg>
  ) : (
    <StructRender
      struct={tmpl.struct}
      options={{ autoScaleMargin: 15 }}
      {...props}
    />
  )
}

class TemplateLib extends Component {
  select(tmpl) {
    if (tmpl === this.props.selected) this.props.onOk(this.result())
    else this.props.onSelect(tmpl)
  }

  result() {
    const tmpl = this.props.selected
    console.assert(!tmpl || tmpl.props, 'Incorrect SDF parse')
    return tmpl
      ? {
          struct: tmpl.struct,
          aid: parseInt(tmpl.props.atomid) || null,
          bid: parseInt(tmpl.props.bondid) || null
        }
      : null
  }

  renderTemplatesTable(templates) {
    const ITEMS_COUNT = templates ? templates.length : 0
    const ITEM_SIZE = { width: 178, height: 120 }
    const tmplStyles = {
      width: `${ITEM_SIZE.width}px`,
      height: `${ITEM_SIZE.height}px`
    }

    return (
      <div className="table" style={{ minWidth: ITEM_SIZE.width }}>
        <AutoSizer>
          {({ height, width }) => {
            const itemsPerRow = Math.floor(width / ITEM_SIZE.width)
            const rowCount = Math.ceil(ITEMS_COUNT / itemsPerRow)

            return (
              <List
                className="table-content"
                width={width}
                height={height}
                rowCount={rowCount}
                rowHeight={ITEM_SIZE.height}
                rowRenderer={({ index, key, style }) => {
                  const fromIndex = index * itemsPerRow
                  const toIndex = Math.min(fromIndex + itemsPerRow, ITEMS_COUNT)
                  const items = templates.slice(fromIndex, toIndex)

                  return (
                    <div className="tr" key={key} style={style}>
                      {items.map((tmpl, i) => (
                        <div
                          className={
                            tmpl === this.props.selected ? 'td selected' : 'td'
                          }
                          title={greekify(tmplName(tmpl, i))}
                          key={i}
                          style={tmplStyles}>
                          <RenderTmpl
                            tmpl={tmpl}
                            className="struct"
                            onClick={() => this.select(tmpl)}
                          />
                          <div className="btn-container">
                            {tmpl.props.group === 'User Templates' && (
                              <button
                                className="delete-button"
                                onClick={() => this.props.onDelete(tmpl)}>
                                Delete
                              </button>
                            )}
                            <button
                              className="attach-button"
                              onClick={() => this.props.onAttach(tmpl)}>
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
            )
          }}
        </AutoSizer>
      </div>
    )
  }

  render() {
    const { filter, onFilter, onChangeGroup, ...props } = this.props
    let group = props.group
    const lib = filterLibSelector(this.props)
    group = lib[group] ? group : Object.keys(lib)[0]

    return (
      <Dialog
        title="Template Library"
        className="template-lib"
        params={omit(['group'], props)}
        result={() => this.result()}
        buttons={[
          <SaveButton
            key="save-to-SDF"
            data={sdf.stringify(this.props.lib)}
            filename="ketcher-tmpls.sdf">
            Save To SDF…
          </SaveButton>,
          'Cancel',
          'OK'
        ]}>
        <div className={styles.dialog_body}>
          <label>
            Filter:
            <Input
              type="search"
              value={filter}
              onChange={value => onFilter(value)}
            />
          </label>
          <div className="table-group-wrap">
            <Input
              className="groups"
              component={SelectList}
              splitIndexes={[Object.keys(lib).indexOf('User Templates')]}
              value={group}
              onChange={g => onChangeGroup(g)}
              schema={{
                enum: Object.keys(lib),
                enumNames: Object.keys(lib).map(g => greekify(g))
              }}
            />
            {this.renderTemplatesTable(lib[group])}
          </div>
        </div>
      </Dialog>
    )
  }
}

export default connect(
  store => ({ ...omit(['attach'], store.templates) }),
  (dispatch, props) => ({
    onFilter: filter => dispatch(changeFilter(filter)),
    onSelect: tmpl => dispatch(selectTmpl(tmpl)),
    onChangeGroup: group => dispatch(changeGroup(group)),
    onAttach: tmpl => dispatch(editTmpl(tmpl)),
    onDelete: tmpl => dispatch(deleteTmpl(tmpl)),
    onOk: res => {
      dispatch(onAction({ tool: 'template', opts: res }))
      props.onOk(res)
    }
  })
)(TemplateLib)
