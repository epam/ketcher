import Tab from '@mui/material/Tab';
import { Icon } from 'components';
import Tabs from '@mui/material/Tabs';
import { ChangeEvent, useState } from 'react';
import { WizardFormFieldId, WizardState } from './MonomerCreationWizard.types';
import MonomerCreationWizardFields from './MonomerCreationWizardFields';
import { KetMonomerClass } from 'application/formatters';
import clsx from 'clsx';
import monomerCreationWizardStyles from './MonomerCreationWizard.module.less';
import styles from './RnaPresetTabs.module.less';
import AttributeField from './components/AttributeField/AttributeField';

interface IRnaPresetTabsProps {
  wizardState: {
    base: WizardState;
    sugar: WizardState;
    phosphate: WizardState;
    preset: {
      name: string;
      errors: {
        name: string | null;
      };
    };
  };
}

export const RnaPresetTabs = (props: IRnaPresetTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (_, newValue: number) => {
    setSelectedTab(newValue);
  };

  const { wizardState, wizardStateDispatch } = props;

  const rnaComponentsKeys = ['base', 'sugar', 'phosphate'] as const;

  const handleFieldChange = (
    fieldId: WizardFormFieldId,
    value: KetMonomerClass | string,
    rnaComponentKey: typeof rnaComponentsKeys[number] | 'preset',
  ) => {
    wizardStateDispatch({
      type: 'SetFieldValue',
      fieldId,
      value,
      rnaComponentKey,
    });
  };

  return (
    <div>
      <Tabs
        className={styles.styledTabsWrapper}
        value={selectedTab}
        onChange={handleChange}
      >
        <Tab
          className={styles.styledTab}
          label={<div className={styles.tabLabel}>Preset</div>}
          icon={<Icon name="preset" />}
        />
        <Tab
          className={styles.styledTab}
          label={<div className={styles.tabLabel}>Base</div>}
          icon={<Icon name="base" />}
        />
        <Tab
          className={styles.styledTab}
          label={<div className={styles.tabLabel}>Sugar</div>}
          icon={<Icon name="sugar" />}
        />
        <Tab
          className={styles.styledTab}
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
              <MonomerCreationWizardFields
                key={rnaComponentKey}
                assignedAttachmentPoints={new Map()}
                showNaturalAnalogue={rnaComponentKey === 'base'}
                onFieldChange={(fieldId: WizardFormFieldId, value: string) => {
                  handleFieldChange(fieldId, value, rnaComponentKey);
                }}
                wizardState={wizardState[rnaComponentKey]}
              />
            )
          );
        })}
      </div>
    </div>
  );
};
