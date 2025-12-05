import Tab from '@mui/material/Tab';
import { Icon } from 'components';
import Tabs from '@mui/material/Tabs';
import { ChangeEvent, useEffect, useState, useCallback } from 'react';
import {
  RnaPresetWizardAction,
  RnaPresetWizardState,
  RnaPresetWizardStatePresetFieldValue,
  StringWizardFormFieldId,
  WizardState,
} from './MonomerCreationWizard.types';
import MonomerCreationWizardFields from './MonomerCreationWizardFields';
import { KetMonomerClass } from 'ketcher-core';
import clsx from 'clsx';
import monomerCreationWizardStyles from './MonomerCreationWizard.module.less';
import styles from './RnaPresetTabs.module.less';
import AttributeField from './components/AttributeField/AttributeField';
import { selectionSelector } from '../../../state/editor/selectors';
import { useSelector } from 'react-redux';
import { Editor } from '../../../../editor';
import inputStyles from '../../../component/form/Input/Input.module.less';

interface IRnaPresetTabsProps {
  wizardState: RnaPresetWizardState;
  editor: Editor;
  wizardStateDispatch: (action: RnaPresetWizardAction) => void;
}

// Colors for highlighting components
const ACTIVE_TAB_HIGHLIGHT_COLOR = '#CDF1FC'; // Pale blue shading for active tab component
const INACTIVE_TAB_HIGHLIGHT_COLOR = '#00EAFF'; // Fluorescent blue outline for inactive tab components

const RNA_COMPONENT_KEYS = ['base', 'sugar', 'phosphate'] as const;
type RnaComponentKeyType = typeof RNA_COMPONENT_KEYS[number];

export const RnaPresetTabs = (props: IRnaPresetTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);
  const structureSelection = useSelector(selectionSelector);
  const hasSelectedAtoms = Boolean(structureSelection?.atoms?.length);
  const { wizardState, wizardStateDispatch, editor } = props;

  const currentTabState = wizardState[RNA_COMPONENT_KEYS[selectedTab - 1]];

  const applyHighlights = useCallback(
    (activeTabIndex: number, highlightEnabled: boolean) => {
      editor.highlights.clear();

      if (!highlightEnabled) {
        return;
      }

      // Apply highlights for all components based on whether they're active or not
      RNA_COMPONENT_KEYS.forEach((componentKey, index) => {
        const componentState = wizardState[componentKey];
        if (!componentState?.structure) {
          return;
        }

        const isActiveTab = index + 1 === activeTabIndex;
        const highlightColor = isActiveTab
          ? ACTIVE_TAB_HIGHLIGHT_COLOR
          : INACTIVE_TAB_HIGHLIGHT_COLOR;

        editor.highlights.create({
          atoms: componentState.structure.atoms || [],
          bonds: componentState.structure.bonds || [],
          rgroupAttachmentPoints: [],
          color: highlightColor,
        });
      });
    },
    [editor, wizardState],
  );

  const handleChange = (_, newValue: number) => {
    setSelectedTab(newValue);
    applyHighlights(newValue, isHighlightEnabled);
  };

  const handleHighlightToggle = () => {
    const newHighlightEnabled = !isHighlightEnabled;
    setIsHighlightEnabled(newHighlightEnabled);
    applyHighlights(selectedTab, newHighlightEnabled);
  };

  const handleFieldChange = (
    fieldId: StringWizardFormFieldId,
    value: KetMonomerClass | string,
    rnaComponentKey: RnaComponentKeyType | 'preset',
  ) => {
    wizardStateDispatch({
      type: 'SetFieldValue',
      fieldId,
      value,
      rnaComponentKey,
      editor,
    });
  };

  const handleClickCreateComponent = (rnaComponentKey: RnaComponentKeyType) => {
    wizardStateDispatch({
      type: 'SetRnaPresetComponentStructure',
      rnaComponentKey,
      editor,
    });
  };

  useEffect(() => {
    if (!currentTabState) {
      return;
    }

    applyHighlights(selectedTab, isHighlightEnabled);
    editor.selection(null);
    // We only want to reapply highlights when the structure changes, not on every render.
    // Other dependencies (selectedTab, isHighlightEnabled, applyHighlights, editor) are
    // handled by their respective handlers (handleChange, handleHighlightToggle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTabState?.structure]);

  const hasErrorInTab = (
    wizardState: WizardState | RnaPresetWizardStatePresetFieldValue,
  ) => {
    return Object.values(wizardState.errors).some((errorValue) =>
      Boolean(errorValue),
    );
  };

  return (
    <div>
      <Tabs
        className={styles.styledTabsWrapper}
        value={selectedTab}
        onChange={handleChange}
      >
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.preset) && styles.errorTab,
          )}
          label={<div className={styles.tabLabel}>Preset</div>}
          icon={<Icon name="preset" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.base) && styles.errorTab,
          )}
          label={<div className={styles.tabLabel}>Base</div>}
          icon={<Icon name="base" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.sugar) && styles.errorTab,
          )}
          label={<div className={styles.tabLabel}>Sugar</div>}
          icon={<Icon name="sugar" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.phosphate) && styles.errorTab,
          )}
          label={<div className={styles.tabLabel}>Phosphate</div>}
          icon={<Icon name="phosphate" />}
        />
      </Tabs>
      <div className={styles.tabsContentWrapper}>
        {selectedTab === 0 && (
          <AttributeField
            title="Name"
            control={
              <input
                type="text"
                className={clsx(
                  monomerCreationWizardStyles.input,
                  wizardState.preset.errors.name &&
                    monomerCreationWizardStyles.inputError,
                )}
                placeholder="e.g. Diethylene Glycol"
                value={wizardState.preset.name}
                data-testid="name-input"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange('name', event.target.value, 'preset')
                }
              />
            }
            required
          />
        )}
        {RNA_COMPONENT_KEYS.map((rnaComponentKey, index) => {
          return (
            index + 1 === selectedTab && (
              <>
                <div className={styles.createComponentWrapper}>
                  <div>
                    Select all atoms that form this nucleotide component.
                  </div>
                  <button
                    className={clsx(
                      monomerCreationWizardStyles.buttonSubmit,
                      styles.createComponentButton,
                    )}
                    disabled={!hasSelectedAtoms}
                    onClick={() => handleClickCreateComponent(rnaComponentKey)}
                  >
                    Mark as {rnaComponentKey}
                  </button>
                </div>
                <MonomerCreationWizardFields
                  key={rnaComponentKey}
                  assignedAttachmentPoints={new Map()}
                  showNaturalAnalogue={rnaComponentKey === 'base'}
                  onFieldChange={(
                    fieldId: StringWizardFormFieldId,
                    value: string,
                  ) => {
                    handleFieldChange(fieldId, value, rnaComponentKey);
                  }}
                  wizardState={wizardState[rnaComponentKey]}
                />
              </>
            )
          );
        })}
      </div>
      <label className={styles.highlightCheckboxWrapper}>
        <input
          type="checkbox"
          checked={isHighlightEnabled}
          onChange={handleHighlightToggle}
          className={inputStyles.input}
          data-testid="highlight-checkbox"
        />
        <span className={inputStyles.checkbox} />
        Highlight
      </label>
    </div>
  );
};
