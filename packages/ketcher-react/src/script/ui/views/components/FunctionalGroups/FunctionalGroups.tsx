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

import { FC, RefCallback, useEffect, useMemo, useState } from 'react'
import { SdfItem, SdfSerializer, Struct } from 'ketcher-core'
import TemplateTable, { Template } from '../../../dialog/template/TemplateTable'
import {
  functionalGroupsSelector,
  modeSelector
} from '../../../state/functionalGroups/selectors'
import { useDispatch, useSelector } from 'react-redux'

import { Dialog } from '../'
import { DialogParams } from '../Dialog/Dialog'
import Input from '../../../component/form/input'
import SaveButton from '../../../component/view/savebutton'
import classes from './functionalGroups.module.less'
import clsx from 'clsx'
import { filterFGLib } from '../../../utils'
import { onAction } from '../../../state'
import { useResizeObserver } from '../../../../../hooks'

export interface FGProps {
  className: string
  onOk: () => void
  onCancel: () => void
}

interface Result {
  struct: Struct
  aid: number | null
  mode: string
}

const group = 'Functional Groups'

const FunctionalGroups: FC<FGProps> = ({ onOk, onCancel, className }) => {
  const dispatch = useDispatch()
  const CONTAINER_MIN_WIDTH = 310
  const lib: SdfItem[] = useSelector(functionalGroupsSelector)
  const mode = useSelector(modeSelector)

  const [selected, setSelected] = useState<Template | null>(null)
  const [filter, setFilter] = useState<string>('')
  const [filteredLib, setFilteredLib] = useState({})

  const templatesLib = useMemo(() => {
    return lib.map((template) => {
      const struct = template.struct.clone()
      struct.sgroups.delete(0)
      return { ...template, modifiedStruct: struct }
    })
  }, [lib])

  useEffect(() => {
    setFilteredLib(filterFGLib(templatesLib, filter))
  }, [templatesLib, filter])

  const onFilter = (filter: string): void => setFilter(filter)
  const onSelect = (tmpl: Template): void => setSelected(tmpl)
  const handleOk = (res: Result | null): void => {
    dispatch(onAction({ tool: 'template', opts: res }))
    onOk()
  }

  const handleResult = (): Result | null => {
    const tmpl = selected
    return tmpl
      ? {
          struct: tmpl.struct,
          aid: parseInt(String(tmpl.props.atomid)) || null,
          mode: mode
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
          filename="ketcher-fg-tmpls.sdf"
        >
          Save To SDF…
        </SaveButton>,
        'OK'
      ]}
    >
      <div className={classes.dialog_body}>
        <label>
          Filter:
          <Input
            type="search"
            value={filter}
            onChange={(value) => onFilter(value)}
          />
        </label>
        <div
          className={clsx(classes.tableGroupWrap, {
            [classes.singleColLayout]: width && width < CONTAINER_MIN_WIDTH
          })}
          ref={ref}
        >
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
