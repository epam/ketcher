import Tab from '@mui/material/Tab';
import { Icon } from 'components';
import Tabs from '@mui/material/Tabs';
import { ChangeEvent, useEffect, useState } from 'react';
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

interface IRnaPresetTabsProps {
  wizardState: RnaPresetWizardState;
  editor: Editor;
  wizardStateDispatch: (action: RnaPresetWizardAction) => void;
}

export const RnaPresetTabs = (props: IRnaPresetTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const structureSelection = useSelector(selectionSelector);
  const hasSelectedAtoms = Boolean(structureSelection?.atoms?.length);
  const { wizardState, wizardStateDispatch, editor } = props;
  const rnaComponentsKeys = ['base', 'sugar', 'phosphate'] as const;
  type rnaComponentKeyType = typeof rnaComponentsKeys[number];
  const currentTabState = wizardState[rnaComponentsKeys[selectedTab - 1]];

  const highlightStructure = (activeTabState: WizardState) => {
    editor.highlights.clear();

    if (!activeTabState?.structure) {
      return;
    }

    editor.highlights.create({
      atoms: activeTabState.structure.atoms || [],
      bonds: activeTabState.structure.bonds || [],
      rgroupAttachmentPoints: [],
      color: '#CDF1FC',
    });
  };

  const handleChange = (_, newValue: number) => {
    setSelectedTab(newValue);

    const activeTabState = wizardState[rnaComponentsKeys[newValue - 1]];

    highlightStructure(activeTabState);
  };

  const handleFieldChange = (
    fieldId: StringWizardFormFieldId,
    value: KetMonomerClass | string,
    rnaComponentKey: rnaComponentKeyType | 'preset',
  ) => {
    wizardStateDispatch({
      type: 'SetFieldValue',
      fieldId,
      value,
      rnaComponentKey,
      editor,
    });
  };

  const handleClickCreateComponent = (rnaComponentKey: rnaComponentKeyType) => {
    // Get the current selection before dispatching the action
    const selection = editor.selection();
    const atomIds = selection?.atoms || [];

    // Update the preset component atoms mapping for tooltips
    editor.updatePresetComponentAtoms(rnaComponentKey, atomIds);

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

    highlightStructure(currentTabState);
    editor.selection(null);
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
        {rnaComponentsKeys.map((rnaComponentKey, index) => {
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
    </div>
  );
};
