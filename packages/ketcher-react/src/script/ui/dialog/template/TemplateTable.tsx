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
import { Struct } from 'ketcher-core'
import StructRender from '../../component/structrender'
import classes from './TemplateTable.module.less'
import { greekify } from '../../utils'
import { useSelector } from 'react-redux'
import Icon from 'src/script/ui/component/view/icon'

export interface Template {
  struct: Struct
  modifiedStruct?: Struct // TODO: Do something with that, in future it shouldn't be here
  props: {
    atomid: number
    bondid: number
    group: string
    prerender?: string
  }
}

interface TemplateTableProps {
  templates: Array<Template>
  selected: Template | null
  onSelect: (tmpl: Template) => void
  onDelete?: (tmpl: Template) => void
  onAttach?: (tmpl: Template) => void
  titleRows?: 1 | 2
  onDoubleClick: (tmpl: Template) => void
}

const getSettingsSelector = (state) => state.options.settings

function tmplName(tmpl: Template, i: number): string {
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`
}

const RenderTmpl: FC<{
  tmpl: Template
  options: any
  className: string
}> = ({ tmpl, options, ...props }) => {
  return (
    <StructRender
      struct={tmpl.modifiedStruct || tmpl.struct}
      options={{ ...options, autoScaleMargin: 15 }}
      {...props}
    />
  )
}

const TemplateTable: FC<TemplateTableProps> = (props) => {
  const {
    templates,
    selected,
    onSelect,
    onDelete,
    onAttach,
    onDoubleClick,
    titleRows = 2
  } = props
  const options = useSelector((state) => getSettingsSelector(state))

  return (
    <div
      className={`${classes.tableContent} ${
        titleRows === 1 ? classes.oneRowTitleTable : classes.twoRowsTitleTable
      }`}
    >
      {templates.map((tmpl, i) => {
        return (
          <div
            className={
              tmpl.struct !== selected?.struct
                ? classes.td
                : `${classes.td} ${classes.selected}`
            }
            title={greekify(tmplName(tmpl, i))}
            key={
              tmpl.struct.name !== selected?.struct.name
                ? `${tmpl.struct.name}_${i}`
                : `${tmpl.struct.name}_${i}_selected`
            }
            onClick={() => onSelect(tmpl)}
            onDoubleClick={() => onDoubleClick(tmpl)}
          >
            <RenderTmpl
              tmpl={tmpl}
              options={options}
              className={classes.struct}
            />
            <div
              className={`${classes.structTitle} ${
                selected?.struct === tmpl.struct ? classes.selectedTitle : ''
              }`}
            >
              {greekify(tmplName(tmpl, i))}
            </div>
            {tmpl.props.group === 'User Templates' && (
              <button
                className={`${classes.button} ${classes.deleteButton}`}
                onClick={() => onDelete!(tmpl)}
              >
                <Icon name="delete" />
              </button>
            )}
            {(tmpl.props.group !== 'Functional Groups' && tmpl.props.group !== 'Salts and Solvents') && (
              <button
                className={`${classes.button} ${classes.editButton}`}
                onClick={() => onAttach!(tmpl)}
              >
                <Icon name="edit" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default TemplateTable
