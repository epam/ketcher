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

import React, { RefCallback } from 'react'
import { connect } from 'react-redux'

import sdf from '../../../chem/sdf'
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
import { useResizeObserver } from '../../../../hooks'
import clsx from 'clsx'
import { Struct } from 'ketcher-core'
import TemplateTable, { greekify, Template } from './TemplateTable'

interface TemplateLibProps {
  filter: string
  group: string
  lib: Array<Template>
  selected: Template
}

interface TemplateLibCallProps {
  onAttach: (tmpl: Template) => void
  onCancel: () => void
  onChangeGroup: (group: string) => void
  onDelete: (tmpl: Template) => void
  onFilter: (filter: string) => void
  onOk: (res: any) => void
  onSelect: (res: any) => void
}

type Props = TemplateLibProps & TemplateLibCallProps

export interface Result {
  struct: Struct
  aid: number | null
  bid: number | null
}

const filterLibSelector = createSelector(
  (props: Props) => props.lib,
  (props: Props) => props.filter,
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

const TemplateLib: React.FC<Props> = props => {
  const { filter, onFilter, onChangeGroup, ...rest } = props
  const CONTAINER_MIN_WIDTH = 310
  let group = props.group
  const lib = filterLibSelector(props)
  group = lib[group] ? group : Object.keys(lib)[0]
  const {
    ref,
    width
  }: {
    ref: RefCallback<HTMLDivElement>
    width: number | undefined
  } = useResizeObserver<HTMLDivElement>()

  const result = (): Result | null => {
    const tmpl = props.selected
    console.assert(!tmpl || tmpl.props, 'Incorrect SDF parse')
    return tmpl
      ? {
          struct: tmpl.struct,
          aid: parseInt(String(tmpl.props.atomid)) || null,
          bid: parseInt(String(tmpl.props.bondid)) || null
        }
      : null
  }

  const select = (tmpl: Template): void => {
    if (tmpl === props.selected) props.onOk(result())
    else props.onSelect(tmpl)
  }

  return (
    <Dialog
      title="Template Library"
      className="template-lib"
      params={omit(['group'], rest)}
      result={() => result()}
      buttons={[
        <SaveButton
          key="save-to-SDF"
          data={sdf.stringify(props.lib)}
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
        <div
          className={clsx('table-group-wrap', {
            'single-col-layout': width && width < CONTAINER_MIN_WIDTH
          })}
          ref={ref}>
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
          <TemplateTable
            templates={lib[group]}
            onSelect={select}
            selected={props.selected}
            onDelete={props.onDelete}
            onAttach={props.onAttach}
          />
        </div>
      </div>
    </Dialog>
  )
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
