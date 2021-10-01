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

import { FC, RefCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import TemplateTable, { Template } from '../../../dialog/template/TemplateTable'
import classes from './functionalGroups.module.less'
import { Dialog } from '../'
import { onAction } from '../../../state'
import SaveButton from '../../../component/view/savebutton'
import Input from '../../../component/form/input'
import clsx from 'clsx'
import SelectList from '../../../component/form/select'
import { functionalGroupsSelector } from '../../../state/functionalGroups/selectors'
import { useResizeObserver } from '../../../../../hooks'
import { filterLib } from '../../../utils'
import { SdfItem, SdfSerializer, Struct } from 'ketcher-core'
import { DialogParams } from '../Dialog/Dialog'

export interface FGProps {
  className: string
  onOk: () => void
  onCancel: () => void
}

interface Result {
  struct: Struct
  aid: number | null
}

enum groups {
  'Functional Groups' = 'Functional Groups'
}

const FunctionalGroups: FC<FGProps> = ({ onOk, onCancel, className }) => {
  const dispatch = useDispatch()
  const CONTAINER_MIN_WIDTH = 310
  const lib: SdfItem[] = useSelector(functionalGroupsSelector)

  const [expandedTemplates, setExpandedTemplates] = useState<SdfItem[]>([])
  const [group, setGroup] = useState<string>('Functional Groups')
  const [selected, setSelected] = useState<Template | null>(null)
  const [filter, setFilter] = useState<string>('')
  const [filteredLib, setFilteredLib] = useState<
    { [key in groups]?: SdfItem[] }
  >({})

  useEffect(() => {
    // Implemented to not mutate the redux store
    const expandedTemplates: SdfItem[] = lib.map(template => {
      const struct = template.struct.clone()
      struct.functionalGroups.forEach(fg => (fg.isExpanded = true))
      return { ...template, struct }
    })
    setExpandedTemplates(expandedTemplates)
  }, [])

  useEffect(() => {
    setFilteredLib(filterLib(expandedTemplates, filter))
  }, [filter, expandedTemplates])

  const onFilter = (filter: string): void => setFilter(filter)
  const onSelect = (tmpl: Template): void => setSelected(tmpl)
  const handleOk = (res: Result | null): void => {
    if (res) {
      res.struct.functionalGroups.forEach(fg => (fg.isExpanded = false))
    }
    dispatch(onAction({ tool: 'template', opts: res }))
    onOk()
  }

  const handleResult = (): Result | null => {
    const tmpl = selected
    console.assert(!tmpl || tmpl.props, 'Incorrect SDF parse')
    return tmpl
      ? {
          struct: tmpl.struct,
          aid: parseInt(String(tmpl.props.atomid)) || null
        }
      : null
  }

  const sdfSerializer = new SdfSerializer()
  const molSaveData = sdfSerializer.serialize(lib)

  const handleSelect = (tmpl: Template): void => {
    if (tmpl === selected) {
      handleOk(handleResult())
    } else onSelect(tmpl)
  }

  const {
    ref,
    width
  }: {
    ref: RefCallback<HTMLDivElement>
    width: number | undefined
  } = useResizeObserver<HTMLDivElement>()

  const params: DialogParams = {
    onOk: handleOk,
    onCancel,
    className
  }

  return (
    <Dialog
      title="Functional Groups"
      className={classes.functionalGroups}
      params={params}
      result={() => handleResult()}
      buttons={[
        <SaveButton
          key="save-to-SDF"
          data={molSaveData}
          filename="ketcher-fg-tmpls.sdf">
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
            value={group}
            onChange={g => setGroup(g)}
            schema={{
              enum: Object.keys(filteredLib),
              enumNames: Object.keys(filteredLib)
            }}
          />
          <TemplateTable
            templates={filteredLib[group]}
            onSelect={handleSelect}
            selected={selected}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default FunctionalGroups
