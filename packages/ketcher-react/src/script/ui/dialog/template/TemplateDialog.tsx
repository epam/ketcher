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

import { Dispatch, FC, useState, useEffect } from 'react'
import TemplateTable, { Template } from './TemplateTable'
import {
  changeFilter,
  changeGroup,
  deleteTmpl,
  editTmpl,
  selectTmpl
} from '../../state/templates'
import { filterLib, filterFGLib, greekify } from '../../utils'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Icon from '../../component/view/icon'

import { Dialog } from '../../views/components'
import Input from '../../component/form/input'
import SaveButton from '../../component/view/savebutton'
import { SdfSerializer, Struct } from 'ketcher-core'
import classes from './template-lib.module.less'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { omit } from 'lodash/fp'
import { onAction } from '../../state'
import { functionalGroupsSelector } from '../../state/functionalGroups/selectors'
import EmptySearchResult from '../../../ui/dialog/template/EmptySearchResult'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      className={classes.tabPanel}
      component="div"
      role="tabpanel"
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}>
      {value === index && children}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`
  }
}

interface TemplateLibProps {
  filter: string
  group: string
  lib: Array<Template>
  selected: Template
  mode: string
  initialTab: number
}

interface TemplateLibCallProps {
  onAttach: (tmpl: Template) => void
  onCancel: () => void
  onChangeGroup: (group: string) => void
  onDelete: (tmpl: Template) => void
  onFilter: (filter: string) => void
  onOk: (res: any) => void
  onSelect: (res: any) => void
  functionalGroups: (Template & { modifiedStruct: Struct })[]
}

type Props = TemplateLibProps & TemplateLibCallProps

enum TemplateTabs {
  TemplateLibrary = 0,
  FunctionalGroupLibrary = 1
}

export interface Result {
  struct: Struct
  aid: number | null
  bid: number | null
  mode: string
}

const filterLibSelector = createSelector(
  (props: Props) => props.lib,
  (props: Props) => props.filter,
  filterLib
)

const FUNCTIONAL_GROUPS = 'Functional Groups'

const HeaderContent = () => (
  <div className={classes.dialogHeader}>
    <Icon name="template-dialog" />
    <span>Templates</span>
  </div>
)

const FooterContent = ({ data, tab }) => (
  <div style={{ flexGrow: 1 }}>
    <SaveButton
      key="save-to-SDF"
      data={data}
      className={classes.saveButton}
      filename={
        tab === TemplateTabs.TemplateLibrary
          ? 'ketcher-tmpls.sdf'
          : 'ketcher-fg-tmpls.sdf'
      }>
      {tab === TemplateTabs.TemplateLibrary
        ? 'Save template library to SDF'
        : 'Save functional groups to SDF'}
    </SaveButton>
  </div>
)

const TemplateDialog: FC<Props> = (props) => {
  const {
    filter,
    onFilter,
    onChangeGroup,
    mode,
    initialTab,
    functionalGroups,
    lib: templateLib,
    ...rest
  } = props

  const [tab, setTab] = useState(initialTab ?? TemplateTabs.TemplateLibrary)
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    props.group
  ])
  const [filteredFG, setFilteredFG] = useState(
    functionalGroups[FUNCTIONAL_GROUPS]
  )

  const filteredTemplateLib = filterLibSelector(props)

  useEffect(() => {
    setFilteredFG(filterFGLib(functionalGroups, filter)[FUNCTIONAL_GROUPS])
  }, [functionalGroups, filter])

  const handleTabChange = (_, tab) => {
    setTab(tab)
    props.onSelect(null)
  }

  const handleAccordionChange = (accordion) => (_, isExpanded) => {
    setExpandedAccordions(
      isExpanded
        ? [...expandedAccordions, accordion]
        : [...expandedAccordions].filter(
            (expandedAccordion) => expandedAccordion !== accordion
          )
    )
  }

  const result = (): Result | null => {
    const tmpl = props.selected
    return tmpl
      ? {
          struct: tmpl.struct,
          aid: parseInt(String(tmpl.props.atomid)) || null,
          bid: parseInt(String(tmpl.props.bondid)) || null,
          mode: mode
        }
      : null
  }

  const sdfSerializer = new SdfSerializer()
  const data =
    tab === TemplateTabs.TemplateLibrary
      ? sdfSerializer.serialize(templateLib)
      : sdfSerializer.serialize(functionalGroups)

  const select = (tmpl: Template, activateImmediately = false): void => {
    onChangeGroup(tmpl.props.group)
    if (activateImmediately) props.onOk(result())
    else props.onSelect(tmpl)
  }

  return (
    <Dialog
      headerContent={<HeaderContent />}
      footerContent={<FooterContent tab={tab} data={data} />}
      className={`${classes.dialog_body}`}
      params={omit(['group'], rest)}
      result={() => result()}
      buttons={['OK']}
      buttonsNameMap={{ OK: 'Add to canvas' }}
      needMargin={false}>
      <div className={classes.inputContainer}>
        <Input
          className={classes.input}
          type="search"
          value={filter}
          onChange={(value) => onFilter(value)}
          placeholder="Search by elements..."
          isFocus={true}
        />
        <Icon name="search" className={classes.searchIcon} />
      </div>
      <Tabs value={tab} onChange={handleTabChange} className={classes.tabs}>
        <Tab
          label="Template Library"
          {...a11yProps(TemplateTabs.TemplateLibrary)}
        />
        <Tab
          label="Functional Groups"
          {...a11yProps(TemplateTabs.FunctionalGroupLibrary)}
        />
      </Tabs>
      <div className={classes.tabsContent}>
        <TabPanel value={tab} index={TemplateTabs.TemplateLibrary}>
          <div>
            {Object.keys(filteredTemplateLib).length ? (
              Object.keys(filteredTemplateLib).map((groupName) => {
                const shouldGroupBeRended =
                  expandedAccordions.includes(groupName)
                return (
                  <Accordion
                    square={true}
                    key={groupName}
                    onChange={handleAccordionChange(groupName)}
                    expanded={shouldGroupBeRended}>
                    <AccordionSummary
                      className={classes.accordionSummary}
                      expandIcon={
                        <Icon className={classes.expandIcon} name="chevron" />
                      }>
                      <Icon
                        name="elements-group"
                        className={classes.groupIcon}
                      />
                      {`${greekify(groupName)} (${
                        filteredTemplateLib[groupName].length
                      })`}
                    </AccordionSummary>
                    <AccordionDetails>
                      <TemplateTable
                        templates={
                          shouldGroupBeRended
                            ? filteredTemplateLib[groupName]
                            : []
                        }
                        onSelect={(templ) => select(templ)}
                        onDoubleClick={(templ) => select(templ, true)}
                        selected={props.selected}
                        onDelete={props.onDelete}
                        onAttach={props.onAttach}
                      />
                    </AccordionDetails>
                  </Accordion>
                )
              })
            ) : (
              <div className={classes.resultsContainer}>
                <EmptySearchResult textInfo="No items found" />
              </div>
            )}
          </div>
        </TabPanel>
        <TabPanel value={tab} index={TemplateTabs.FunctionalGroupLibrary}>
          {filteredFG?.length ? (
            <div className={classes.resultsContainer}>
              <TemplateTable
                titleRows={1}
                onDoubleClick={(templ) => select(templ, true)}
                templates={filteredFG}
                onSelect={(templ) => select(templ)}
                selected={props.selected}
              />
            </div>
          ) : (
            <div className={classes.resultsContainer}>
              <EmptySearchResult textInfo="No items found" />
            </div>
          )}
        </TabPanel>
      </div>
    </Dialog>
  )
}

export default connect(
  (store) => ({
    ...omit(['attach'], (store as any).templates),
    initialTab: (store as any).modal?.prop?.tab,
    functionalGroups: functionalGroupsSelector(store).map((template) => {
      const struct = template.struct.clone()
      struct.sgroups.delete(0)
      return { ...template, modifiedStruct: struct }
    })
  }),
  (dispatch: Dispatch<any>, props) => ({
    onFilter: (filter) => dispatch(changeFilter(filter)),
    onSelect: (tmpl) => dispatch(selectTmpl(tmpl)),
    onChangeGroup: (group) => dispatch(changeGroup(group)),
    onAttach: (tmpl) => dispatch(editTmpl(tmpl)),
    onDelete: (tmpl) => dispatch(deleteTmpl(tmpl)),
    onOk: (res) => {
      dispatch(onAction({ tool: 'template', opts: res }))
      ;(props as any).onOk(res)
    }
  })
)(TemplateDialog)
