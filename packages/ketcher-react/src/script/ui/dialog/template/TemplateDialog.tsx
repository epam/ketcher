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

import { Dispatch, FC, useState, useEffect, useRef } from 'react'
import TemplateTable, { Template } from './TemplateTable'
import {
  changeFilter,
  changeGroup,
  deleteTmpl,
  editTmpl,
  selectTmpl,
  changeTab
} from '../../state/templates'
import { filterLib, filterFGLib, greekify } from '../../utils'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Icon from '../../component/view/icon'

import { Dialog } from '../../views/components'
import Input from '../../component/form/input'
import { SaveButton } from '../../component/view/savebutton'
import { SdfSerializer } from 'ketcher-core'
import classes from './template-lib.module.less'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { omit } from 'lodash/fp'
import { onAction } from '../../state'
import { functionalGroupsSelector } from '../../state/functionalGroups/selectors'
import { saltsAndSolventsSelector } from '../../state/saltsAndSolvents/selectors'
import EmptySearchResult from '../../../ui/dialog/template/EmptySearchResult'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import useSaltsAndSolvents from './useSaltsAndSolvets'

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      className={classes.tabPanel}
      component="div"
      role="tabpanel"
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
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
  selected: Template | null
  mode: string
  tab: number
  saltsAndSolvents: Template[]
}

interface TemplateLibCallProps {
  onAttach: (tmpl: Template) => void
  onCancel: () => void
  onChangeGroup: (group: string) => void
  onDelete: (tmpl: Template) => void
  onFilter: (filter: string) => void
  onOk: (res: any) => void
  onSelect: (res: any) => void
  onTabChange: (tab: number) => void
  functionalGroups: Template[]
}

type Props = TemplateLibProps & TemplateLibCallProps

enum TemplateTabs {
  TemplateLibrary = 0,
  FunctionalGroupLibrary = 1,
  SaltsAndSolvents = 2
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

const FooterContent = ({ data, tab }) => {
  const clickToAddToCanvas = <span>Click to add to canvas</span>
  if (tab === TemplateTabs.SaltsAndSolvents) {
    return clickToAddToCanvas
  }
  return (
    <div
      style={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <SaveButton
        key="save-to-SDF"
        data={data}
        className={classes.saveButton}
        filename={
          tab === TemplateTabs.TemplateLibrary
            ? 'ketcher-tmpls.sdf'
            : 'ketcher-fg-tmpls.sdf'
        }
      >
        Save to SDF
      </SaveButton>
      {clickToAddToCanvas}
    </div>
  )
}

const TemplateDialog: FC<Props> = (props) => {
  const {
    filter,
    onFilter,
    onTabChange,
    onChangeGroup,
    mode,
    tab,
    functionalGroups,
    lib: templateLib,
    saltsAndSolvents,
    onSelect,
    ...rest
  } = props

  const searchInputRef = useRef<HTMLInputElement>(null)

  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    props.group
  ])
  const filteredSaltsAndSolvents = useSaltsAndSolvents(saltsAndSolvents, filter)
  const [filteredFG, setFilteredFG] = useState(
    functionalGroups[FUNCTIONAL_GROUPS]
  )

  const filteredTemplateLib = filterLibSelector(props)

  useEffect(() => {
    setFilteredFG(filterFGLib(functionalGroups, filter)[FUNCTIONAL_GROUPS])
  }, [functionalGroups, filter])

  useEffect(() => {
    searchInputRef.current?.focus()
    onSelect(null)
  }, [tab, onSelect])

  const handleAccordionChange = (accordion) => (_, isExpanded) => {
    setExpandedAccordions(
      isExpanded
        ? [...expandedAccordions, accordion]
        : [...expandedAccordions].filter(
            (expandedAccordion) => expandedAccordion !== accordion
          )
    )
  }

  const sdfSerializer = new SdfSerializer()
  const serializerMapper = {
    [TemplateTabs.TemplateLibrary]: templateLib,
    [TemplateTabs.FunctionalGroupLibrary]: functionalGroups,
    [TemplateTabs.SaltsAndSolvents]: saltsAndSolvents
  }
  const data = sdfSerializer.serialize(serializerMapper[tab])

  const select = (tmpl: Template): void => {
    onChangeGroup(tmpl.props.group)
    props.onSelect(tmpl)
  }

  return (
    <Dialog
      headerContent={<HeaderContent />}
      footerContent={<FooterContent tab={tab} data={data} />}
      className={`${classes.dialog_body}`}
      params={omit(['group'], rest)}
      buttons={[]}
      needMargin={false}
    >
      <div className={classes.inputContainer}>
        <Input
          ref={searchInputRef}
          className={classes.input}
          type="search"
          value={filter}
          onChange={(value) => onFilter(value)}
          placeholder="Search by elements..."
          isFocused={true}
        />
        <Icon name="search" className={classes.searchIcon} />
      </div>
      <Tabs
        value={tab}
        onChange={(_, value) => onTabChange(value)}
        className={classes.tabs}
      >
        <Tab
          label="Template Library"
          {...a11yProps(TemplateTabs.TemplateLibrary)}
        />
        <Tab
          label="Functional Groups"
          {...a11yProps(TemplateTabs.FunctionalGroupLibrary)}
        />
        <Tab
          label="Salts and Solvents"
          {...a11yProps(TemplateTabs.SaltsAndSolvents)}
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
                    expanded={shouldGroupBeRended}
                  >
                    <AccordionSummary
                      className={classes.accordionSummary}
                      expandIcon={
                        <Icon className={classes.expandIcon} name="chevron" />
                      }
                    >
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
        <TabPanel value={tab} index={TemplateTabs.SaltsAndSolvents}>
          {filteredSaltsAndSolvents?.length ? (
            <div className={classes.resultsContainer}>
              <TemplateTable
                titleRows={1}
                templates={filteredSaltsAndSolvents}
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

const selectTemplate = (template, props, dispatch) => {
  dispatch(selectTmpl(null))
  if (!template) return
  dispatch(changeFilter(''))
  dispatch(selectTmpl(template))
  dispatch(onAction({ tool: 'template', opts: template }))
  props.onOk(template)
}

const onModalClose = (props, dispatch) => {
  dispatch(changeFilter(''))
  props.onCancel()
}

export default connect(
  (store) => ({
    ...omit(['attach'], (store as any).templates),
    initialTab: (store as any).modal?.prop?.tab || TemplateTabs.TemplateLibrary,
    functionalGroups: functionalGroupsSelector(store),
    saltsAndSolvents: saltsAndSolventsSelector(store)
  }),
  (dispatch: Dispatch<any>, props: Props) => ({
    onFilter: (filter) => dispatch(changeFilter(filter)),
    onTabChange: (tab) => dispatch(changeTab(tab)),
    onSelect: (tmpl) => selectTemplate(tmpl, props, dispatch),
    onChangeGroup: (group) => dispatch(changeGroup(group)),
    onAttach: (tmpl) => dispatch(editTmpl(tmpl)),
    onCancel: () => onModalClose(props, dispatch),
    onDelete: (tmpl) => dispatch(deleteTmpl(tmpl))
  })
)(TemplateDialog)
