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

import { AutoSizer, List } from 'react-virtualized'

import React from 'react'
import { Struct } from 'ketcher-core'
import StructRender from '../../component/structrender'
import classes from './template-lib.module.less'

interface TemplateTableProps {
  templates: Array<Template>
  selected: Template
  onSelect: (tmpl: Template) => void
  onDelete: (tmpl: Template) => void
  onAttach: (tmpl: Template) => void
}

export interface Template {
  struct: Struct
  props: {
    atomid: number
    bondid: number
    group: string
    prerender: string
  }
}

const GREEK_SIMBOLS = {
  Alpha: 'A',
  alpha: 'α',
  Beta: 'B',
  beta: 'β',
  Gamma: 'Г',
  gamma: 'γ'
}

const greekRe = new RegExp(
  '\\b' + Object.keys(GREEK_SIMBOLS).join('\\b|\\b') + '\\b',
  'g'
)

export function greekify(str: string): string {
  return str.replace(greekRe, sym => GREEK_SIMBOLS[sym])
}

function tmplName(tmpl: Template, i: number): string {
  console.assert(tmpl.props && tmpl.props.group, 'No group')
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`
}

const RenderTmpl: React.FC<{
  tmpl: Template
  className: string
  onClick: () => void
}> = ({ tmpl, ...props }) => {
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

const TemplateTable: React.FC<TemplateTableProps> = props => {
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
          const itemsPerRow = Math.floor(width / ITEM_SIZE.width)
          const rowCount = Math.ceil(ITEMS_COUNT / itemsPerRow)

          return (
            <List
              className={classes.tableContent}
              width={width}
              height={height}
              rowCount={rowCount}
              rowHeight={ITEM_SIZE.height}
              rowRenderer={({ index, key, style }) => {
                const fromIndex = index * itemsPerRow
                const toIndex = Math.min(fromIndex + itemsPerRow, ITEMS_COUNT)
                const items = templates.slice(fromIndex, toIndex)

                return (
                  <div className={classes.tr} key={key} style={style}>
                    {items.map((tmpl, i) => (
                      <div
                        className={
                          tmpl === selected
                            ? `${classes.td} ${classes.selected}`
                            : classes.td
                        }
                        title={greekify(tmplName(tmpl, i))}
                        key={i}
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
                              onClick={() => onDelete(tmpl)}>
                              Delete
                            </button>
                          )}
                          <button
                            className={classes.attachButton}
                            onClick={() => onAttach(tmpl)}>
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

export default TemplateTable
