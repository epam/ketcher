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
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

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
}

const getSettingsSelector = (state) => state.options.settings

function tmplName(tmpl: Template, i: number): string {
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`
}

const RenderTmpl: FC<{
  tmpl: Template
  options: any
  className: string
  onClick: () => void
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
  const { templates, selected, onSelect, onDelete, onAttach } = props
  const ITEMS_COUNT = templates ? templates.length : 0
  const options = useSelector((state) => getSettingsSelector(state))

  return !ITEMS_COUNT ? (
    <EmptySearchResult textInfo="No items found" />
  ) : (
    <div className={classes.table}>
      <OverlayScrollbarsComponent
        options={{
          overflowBehavior: {
            x: 'hidden',
            y: 'scroll'
          }
        }}
        className={classes.tableContentWrapper}
      >
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
      </OverlayScrollbarsComponent>
    </div>
  )
}

export default TemplateTable
