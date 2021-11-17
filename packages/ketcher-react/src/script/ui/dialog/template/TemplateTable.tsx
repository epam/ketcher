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

import EmptySearchResult from './EmptySearchResult'
import { FC } from 'react'
import { Struct } from 'ketcher-core'
import StructRender from '../../component/structrender'
import classes from './TemplateTable.module.less'
import { greekify } from '../../utils'
import { useSelector } from 'react-redux'
import { getSettingsSelector } from '../../state/options/selectors'

interface TemplateTableProps {
  templates: Array<Template>
  selected: Template | null
  onSelect: (tmpl: Template) => void
  onDelete?: (tmpl: Template) => void
  onAttach?: (tmpl: Template) => void
}

export interface Template {
  struct: Struct
  props: {
    atomid: number
    bondid: number
    group: string
    prerender?: string
  }
}

function tmplName(tmpl: Template, i: number): string {
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`
}

const RenderTmpl: FC<{
  tmpl: Template
  options: any
  className: string
  onClick: () => void
}> = ({ tmpl, options, ...props }) => {
  return tmpl.props && tmpl.props.prerender ? (
    <svg {...props}>
      <use href={tmpl.props.prerender} />
    </svg>
  ) : (
    <StructRender
      struct={tmpl.struct}
      options={{ autoScaleMargin: 15, ...options }}
      {...props}
    />
  )
}

const TemplateTable: FC<TemplateTableProps> = props => {
  const { templates, selected, onSelect, onDelete, onAttach } = props
  const ITEMS_COUNT = templates ? templates.length : 0
  const ITEM_SIZE = { width: 178, height: 120 }
  const tmplStyles = {
    width: `${ITEM_SIZE.width}px`,
    height: `${ITEM_SIZE.height}px`
  }
  const options = useSelector(state => getSettingsSelector(state))

  return !ITEMS_COUNT ? (
    <EmptySearchResult textInfo="No items found" />
  ) : (
    <div className={classes.table} style={{ minWidth: ITEM_SIZE.width }}>
      <div className={classes.tableContent}>
        {templates.map((tmpl, i) => {
          return (
            <div
              className={
                tmpl === selected
                  ? `${classes.td} ${classes.selected}`
                  : classes.td
              }
              title={greekify(tmplName(tmpl, i))}
              key={
                tmpl.struct.name !== selected?.struct.name
                  ? `${tmpl.struct.name}_${i}`
                  : `${tmpl.struct.name}_${i}_selected`
              }
              style={tmplStyles}
            >
              <RenderTmpl
                tmpl={tmpl}
                options={options}
                className={classes.struct}
                onClick={() => onSelect(tmpl)}
              />
              <div className={classes.btnContainer}>
                {tmpl.props.group === 'User Templates' && (
                  <button
                    className={classes.deleteButton}
                    onClick={() => onDelete!(tmpl)}
                  >
                    Delete
                  </button>
                )}
                {tmpl.props.group !== 'Functional Groups' && (
                  <button
                    className={classes.attachButton}
                    onClick={() => onAttach!(tmpl)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TemplateTable
