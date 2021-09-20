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

import { FC } from 'react'
//@ts-ignore
import { useDispatch, useSelector } from 'react-redux'
import TemplateTable, {
  greekify,
  Template
} from '../../../dialog/template/TemplateTable'
import classes from './functionalGroups.module.less'
import { Dialog } from '../'
import {
  changeFilter,
  changeGroupList,
  selectFuncGroup
} from '../../../state/functionalGroups'
import { deleteTmpl, editTmpl } from '../../../state/templates'
// import {omit} from "lodash/fp";
import SaveButton from '../../../component/view/savebutton'
import Input from '../../../component/form/input'
import clsx from 'clsx'
import SelectList from '../../../component/form/select'

export interface FGProps {
  onOk: (res: any) => void
}

const FunctionalGroups: FC<FGProps> = ({ onOk }) => {
  const dispatch = useDispatch()
  const CONTAINER_MIN_WIDTH = 310

  const onFilter = filter => dispatch(changeFilter(filter))
  const onSelect = tmpl => dispatch(selectFuncGroup(tmpl))
  const onChangeGroup = group => dispatch(changeGroupList(group))
  const onAttach = tmpl => dispatch(editTmpl(tmpl))
  const onDelete = tmpl => dispatch(deleteTmpl(tmpl))
  const handleOk = res => {
    dispatch(onAction({ tool: 'template', opts: res }))
    onOk(res)
  }

  const select = (tmpl: Template): void => {
    if (tmpl === props.selected) handleOk(result())
    else props.onSelect(tmpl)
  }
  return (
    <Dialog
      title="Template Library"
      className={classes.functionalGroups}
      // params={omit(['group'], rest)}
      // result={() => result()}
      buttons={[
        <SaveButton key="save-to-SDF" data={data} filename="ketcher-tmpls.sdf">
          Save To SDF…
        </SaveButton>,
        'Cancel',
        'OK'
      ]}>
      <div className={classes.dialog_body}>
        <label>
          Filter:
          <Input
            type="search"
            value={filter}
            onChange={value => onFilter(value)}
          />
        </label>
        <div
          className={clsx(classes.tableGroupWrap, {
            [classes.singleColLayout]: width && width < CONTAINER_MIN_WIDTH
          })}
          ref={ref}>
          <Input
            className={classes.groups}
            classes={classes}
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
            onDelete={onDelete}
            onAttach={onAttach}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default FunctionalGroups
