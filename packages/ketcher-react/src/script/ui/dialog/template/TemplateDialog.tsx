/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type FC,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import { connect, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TemplateTable, { type Template } from './TemplateTable';
import {
  changeFilter,
  changeGroup,
  deleteTmpl,
  editTmpl,
  selectTmpl,
  changeTab,
} from '../../state/templates';
import {
  filterLib as filterLibrary,
  filterFGLib as filterFGLibrary,
  greekify,
} from '../../utils';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Dialog } from '../../views/components';
import Input from '../../component/form/Input/Input';
import { SaveButton } from '../../component/view/savebutton';
import { SdfSerializer, KetcherLogger, type RenderOptions } from 'ketcher-core';
import classes from './template-lib.module.less';
import accordionClasses from '../../../../components/Accordion/Accordion.module.less';
import { createSelector } from 'reselect';
import { omit } from 'lodash/fp';
import { onAction } from '../../state';
import { functionalGroupsSelector } from '../../state/functionalGroups/selectors';
import { saltsAndSolventsSelector } from '../../state/saltsAndSolvents/selectors';
import EmptySearchResult from '../../../ui/dialog/template/EmptySearchResult';
import { showSnackbarNotification } from '../../state/notifications';
import type { AppDispatch } from '../../state/hooks';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useSaltsAndSolvents from './useSaltsAndSolvets';
import { Icon } from 'components';
import clsx from 'clsx';

const MemoizedTemplateTable = memo(TemplateTable);

function TabPanel(properties) {
  const { children, value, index, ...other } = properties;
  return (
    <div
      className={classes.tabPanel}
      role="tabpanel"
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

interface TemplateLibraryProperties {
  filter: string;
  group: string;
  lib: Array<Template>;
  selected: Template | null;
  tab: number;
  saltsAndSolvents: Template[];
  renderOptions?: RenderOptions;
  isMonomerCreationWizardActive?: boolean;
}

interface TemplateLibraryCallProperties {
  onAttach: (tmpl: Template) => void;
  onCancel: () => void;
  onChangeGroup: (group: string) => void;
  onDelete: (tmpl: Template) => void;
  onFilter: (filter: string) => void;
  onOk: (result: unknown) => void;
  onSelect: (tmpl: Template | null) => void;
  onTabChange: (tab: number) => void;
  functionalGroups: Template[];
}

type Properties = TemplateLibraryProperties & TemplateLibraryCallProperties;

interface TemplateDialogStoreState {
  templates: Pick<
    TemplateLibraryProperties,
    'filter' | 'group' | 'lib' | 'selected' | 'tab'
  > & { attach: Record<string, unknown> };
  editor?: {
    render?: { options?: RenderOptions };
    isMonomerCreationWizardActive?: boolean;
  };
}

enum TemplateTabs {
  TemplateLibrary = 0,
  FunctionalGroupLibrary = 1,
  SaltsAndSolvents = 2,
}

const filterLibrarySelector = createSelector(
  (properties: Properties) => properties.lib,
  (properties: Properties) => properties.filter,
  filterLibrary,
);

const FUNCTIONAL_GROUPS = 'Functional Groups';

const HeaderContent = () => {
  const { t } = useTranslation('dialogs');
  return (
    <div className={classes.dialogHeader}>
      <Icon name="template-dialog" />
      <span>{t('toolbox.templateLibrary.title')}</span>
    </div>
  );
};

const FooterContent = ({
  getData,
  tab,
  isMonomerCreationWizardActive,
  onError,
}) => {
  const { t } = useTranslation('dialogs');
  const clickToAddToCanvas = (
    <span data-testid="add-to-canvas-button">
      {t('toolbox.templateLibrary.clickToAddToCanvas')}
    </span>
  );

  // Determine filename based on tab
  let filename: string;
  if (tab === TemplateTabs.TemplateLibrary) {
    filename = 'ketcher-tmpls.sdf';
  } else if (tab === TemplateTabs.FunctionalGroupLibrary) {
    filename = 'ketcher-fg-tmpls.sdf';
  } else {
    filename = 'ketcher-salts-solvents.sdf';
  }

  return (
    <div
      style={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <SaveButton
        key="save-to-SDF"
        getData={getData}
        className={clsx(
          classes.saveButton,
          isMonomerCreationWizardActive && classes.disabled,
        )}
        testId="save-to-sdf-button"
        filename={filename}
        disabled={isMonomerCreationWizardActive}
        onError={onError}
      >
        {t('toolbox.templateLibrary.saveToSdf')}
      </SaveButton>
      {clickToAddToCanvas}
    </div>
  );
};

const EMPTY_TEMPLATES: ReadonlyArray<Template> = [];

export const TemplateDialog: FC<Properties> = (properties) => {
  const {
    filter,
    onFilter,
    onTabChange,
    onChangeGroup,
    tab,
    functionalGroups,
    lib: templateLibrary,
    saltsAndSolvents,
    onSelect,
    isMonomerCreationWizardActive = false,
    ...rest
  } = properties;

  const dispatch = useDispatch();
  const { t } = useTranslation('dialogs');
  const searchInputReference = useRef<HTMLInputElement>(null);

  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    properties.group,
  ]);
  const filteredSaltsAndSolvents = useSaltsAndSolvents(
    saltsAndSolvents,
    filter,
  );
  const filteredFG = useMemo(
    () => filterFGLibrary(functionalGroups, filter)[FUNCTIONAL_GROUPS],
    [functionalGroups, filter],
  );

  const filteredTemplateLibrary = filterLibrarySelector(properties);

  const activeTab =
    isMonomerCreationWizardActive && tab === TemplateTabs.FunctionalGroupLibrary
      ? TemplateTabs.TemplateLibrary
      : tab;

  useEffect(() => {
    searchInputReference.current?.focus();
    onSelect(null);
  }, [activeTab, onSelect]);

  const handleAccordionChange = (accordion) => (_, isExpanded) => {
    setExpandedAccordions((previousAccordions) =>
      isExpanded
        ? [...previousAccordions, accordion]
        : previousAccordions.filter(
            (expandedAccordion) => expandedAccordion !== accordion,
          ),
    );
  };

  const handleTabChange = (value) => {
    onTabChange(value);
  };

  const getData = useCallback(() => {
    const sdfSerializer = new SdfSerializer();
    const serializerMapper = {
      [TemplateTabs.TemplateLibrary]: templateLibrary,
      [TemplateTabs.FunctionalGroupLibrary]: functionalGroups,
      [TemplateTabs.SaltsAndSolvents]: saltsAndSolvents,
    };
    return sdfSerializer.serialize(serializerMapper[activeTab]);
  }, [activeTab, templateLibrary, functionalGroups, saltsAndSolvents]);

  const onSaveError = useCallback(
    (error: unknown) => {
      KetcherLogger.error(
        'TemplateDialog.tsx::TemplateDialog::onSaveError',
        error,
      );
      dispatch(
        showSnackbarNotification(
          t('toolbox.templateLibrary.exportPartialFailure'),
        ),
      );
    },
    [dispatch, t],
  );

  // Recreate selection handler only when upstream callbacks change.
  const select = useCallback(
    (tmpl: Template): void => {
      onChangeGroup(tmpl.props.group);
      onSelect(tmpl);
    },
    [onChangeGroup, onSelect],
  );

  // Memoize group names to avoid Object.keys call on every render
  const groupNames = useMemo(
    () => Object.keys(filteredTemplateLibrary),
    [filteredTemplateLibrary],
  );

  return (
    <Dialog
      headerContent={<HeaderContent />}
      footerContent={
        <FooterContent
          tab={activeTab}
          getData={getData}
          isMonomerCreationWizardActive={isMonomerCreationWizardActive}
          onError={onSaveError}
        />
      }
      className={`${classes.dialog_body}`}
      params={omit(['group'], rest)}
      buttons={[]}
      needMargin={false}
    >
      <div className={classes.inputContainer}>
        <Input
          ref={searchInputReference}
          className={classes.input}
          type="search"
          value={filter}
          onChange={(value) => onFilter(value as string)}
          placeholder={t('toolbox.templateLibrary.searchPlaceholder')}
          isFocused={true}
          data-testid="template-search-input"
        />
        <Icon name="search" className={classes.searchIcon} />
      </div>
      <Tabs
        value={activeTab}
        onChange={(_, value) => handleTabChange(value)}
        className={classes.tabs}
      >
        <Tab
          label={t('toolbox.templateLibrary.tabTemplateLibrary')}
          data-testid="template-library-tab"
          {...a11yProps(TemplateTabs.TemplateLibrary)}
        />
        <Tab
          label={t('toolbox.templateLibrary.tabFunctionalGroups')}
          data-testid="functional-groups-tab"
          disabled={isMonomerCreationWizardActive}
          className={clsx(isMonomerCreationWizardActive && classes.disabled)}
          {...a11yProps(TemplateTabs.FunctionalGroupLibrary)}
        />
        <Tab
          label={t('toolbox.templateLibrary.tabSaltsAndSolvents')}
          data-testid="salts-and-solvents-tab"
          {...a11yProps(TemplateTabs.SaltsAndSolvents)}
        />
      </Tabs>
      <div className={classes.tabsContent}>
        <TabPanel value={activeTab} index={TemplateTabs.TemplateLibrary}>
          <div>
            {groupNames.length ? (
              groupNames.map((groupName) => {
                const shouldGroupBeRended =
                  expandedAccordions.includes(groupName);
                return (
                  <Accordion
                    className={accordionClasses.accordion}
                    square={true}
                    key={groupName}
                    onChange={handleAccordionChange(groupName)}
                    expanded={shouldGroupBeRended}
                  >
                    <AccordionSummary
                      className={classes.accordionSummary}
                      data-testid={`${groupName}-accordion-item`}
                      expandIcon={
                        <Icon
                          className={accordionClasses.expandIcon}
                          name="chevron"
                        />
                      }
                    >
                      <Icon
                        name="elements-group"
                        className={classes.groupIcon}
                      />
                      {`${greekify(groupName)} (${
                        filteredTemplateLibrary[groupName].length
                      })`}
                    </AccordionSummary>
                    <AccordionDetails>
                      <MemoizedTemplateTable
                        templates={
                          shouldGroupBeRended
                            ? filteredTemplateLibrary[groupName]
                            : EMPTY_TEMPLATES
                        }
                        onSelect={select}
                        selected={properties.selected}
                        onDelete={properties.onDelete}
                        onAttach={properties.onAttach}
                        renderOptions={properties.renderOptions}
                      />
                    </AccordionDetails>
                  </Accordion>
                );
              })
            ) : (
              <div className={classes.resultsContainer}>
                <EmptySearchResult
                  textInfo={t('toolbox.templateLibrary.noItemsFound')}
                />
              </div>
            )}
          </div>
        </TabPanel>
        <TabPanel value={activeTab} index={TemplateTabs.FunctionalGroupLibrary}>
          {filteredFG?.length ? (
            <div className={classes.resultsContainer}>
              <MemoizedTemplateTable
                titleRows={1}
                templates={filteredFG}
                onSelect={select}
                selected={properties.selected}
                renderOptions={properties.renderOptions}
              />
            </div>
          ) : (
            <div className={classes.resultsContainer}>
              <EmptySearchResult
                textInfo={t('toolbox.templateLibrary.noItemsFound')}
              />
            </div>
          )}
        </TabPanel>
        <TabPanel value={activeTab} index={TemplateTabs.SaltsAndSolvents}>
          {filteredSaltsAndSolvents?.length ? (
            <div className={classes.resultsContainer}>
              <MemoizedTemplateTable
                titleRows={1}
                templates={filteredSaltsAndSolvents}
                onSelect={select}
                selected={properties.selected}
                renderOptions={properties.renderOptions}
              />
            </div>
          ) : (
            <div className={classes.resultsContainer}>
              <EmptySearchResult
                textInfo={t('toolbox.templateLibrary.noItemsFound')}
              />
            </div>
          )}
        </TabPanel>
      </div>
    </Dialog>
  );
};

const selectTemplate = (template, properties, dispatch) => {
  dispatch(selectTmpl(null));
  if (!template) {
    return;
  }
  dispatch(changeFilter(''));
  dispatch(selectTmpl(template));
  dispatch(onAction({ tool: 'template', opts: template }));
  properties.onOk(template);
};

const onModalClose = (properties, dispatch) => {
  dispatch(changeFilter(''));
  properties.onCancel();
};

export default connect(
  (store: TemplateDialogStoreState) => ({
    ...omit(['attach'], store.templates),
    renderOptions: store.editor?.render?.options,
    functionalGroups: functionalGroupsSelector(store),
    saltsAndSolvents: saltsAndSolventsSelector(store),
    isMonomerCreationWizardActive: store.editor?.isMonomerCreationWizardActive,
  }),
  (dispatch: AppDispatch, properties: Properties) => ({
    onFilter: (filter) => dispatch(changeFilter(filter)),
    onTabChange: (tab) => dispatch(changeTab(tab)),
    onSelect: (tmpl) => selectTemplate(tmpl, properties, dispatch),
    onChangeGroup: (group) => dispatch(changeGroup(group)),
    onAttach: (tmpl) => dispatch(editTmpl(tmpl)),
    onCancel: () => onModalClose(properties, dispatch),
    onDelete: (tmpl) => dispatch(deleteTmpl(tmpl)),
  }),
)(TemplateDialog);
