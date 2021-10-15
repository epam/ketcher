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

import { AutoSizer } from 'react-virtualized'

import { FC } from 'react'
import { Struct } from 'ketcher-core'
import StructRender from '../../component/structrender'
import classes from './TemplateTable.module.less'
import { greekify } from '../../utils'
import EmptySearchResult from './EmptySearchResult'

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
  console.assert(tmpl.props && tmpl.props.group, 'No group')
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`
}

const RenderTmpl: FC<{
  tmpl: Template
  className: string
  onClick: () => void
}> = ({ tmpl, ...props }) => {
  return tmpl.props && tmpl.props.prerender ? (
    <svg {...props}>
      <use href={tmpl.props.prerender} />
    </svg>
  ) : (
    <StructRender
      struct={tmpl.struct}
      options={{ autoScaleMargin: 15 }}
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

  return (
    <div className={classes.table} style={{ minWidth: ITEM_SIZE.width }}>
      <AutoSizer>
        {({ height, width }) => {
          return !ITEMS_COUNT ? (
            <EmptySearchResult textInfo="No items found" />
          ) : (
            <div
              className={classes.tableContent}
              style={{
                width: width,
                height: height,
                overflowY: 'scroll'
              }}>
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
                        ? tmpl.struct.name
                        : `${tmpl.struct.name}_selected`
                    }
                    style={tmplStyles}>
                    <RenderTmpl
                      tmpl={tmpl}
                      className={classes.struct}
                      onClick={() => onSelect(tmpl)}
                    />
                    <div className={classes.btnContainer}>
                      {tmpl.props.group === 'User Templates' && (
                        <button
                          className={classes.deleteButton}
                          onClick={() => onDelete!(tmpl)}>
                          Delete
                        </button>
                      )}
                      {tmpl.props.group !== 'Functional Groups' && (
                        <button
                          className={classes.attachButton}
                          onClick={() => onAttach!(tmpl)}>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

export default TemplateTable
