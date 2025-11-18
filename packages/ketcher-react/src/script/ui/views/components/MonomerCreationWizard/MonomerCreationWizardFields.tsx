import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon, IconButton } from 'components';
import {
  AttachmentPointName,
  ketcherProvider,
  KetMonomerClass,
} from 'ketcher-core';
import { ChangeEvent, useEffect, useState } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker, {
  isNaturalAnalogueRequired,
} from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import AttributeField from './components/AttributeField/AttributeField';
import { WizardFormFieldId, WizardState } from './MonomerCreationWizard.types';
import { MAX_MODIFICATION_TYPES } from './MonomerCreationWizard.constants';
import { useAppContext } from '../../../../../hooks';
import Editor from '../../../../editor';
import AttachmentPoint from './components/AttachmentPoint/AttachmentPoint';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import accordionClasses from '../../../../../components/Accordion/Accordion.module.less';
import ModificationTypeDropdown from './components/ModificationTypeDropdown/ModificationTypeDropdown';
import { Autocomplete, TextField } from '@mui/material';

interface IMonomerCreationWizardFieldsProps {
  wizardState: WizardState;
  assignedAttachmentPoints: Map<AttachmentPointName, [number, number]>;
  onChangeModificationTypes?: (modificationTypes: string[]) => void;
  onFieldChange: (fieldId: WizardFormFieldId, value: string) => void;
  showNaturalAnalogue?: boolean;
}

const MonomerCreationWizardFields = (
  props: IMonomerCreationWizardFieldsProps,
) => {
  const { ketcherId } = useAppContext();
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const editor = ketcher.editor as Editor;
  const {
    wizardState,
    assignedAttachmentPoints,
    onChangeModificationTypes,
    onFieldChange,
  } = props;
  const { values, errors } = wizardState;
  const { type, symbol, name, naturalAnalogue, aliasHELM } = values;
  const [modificationTypes, setModificationTypes] = useState<string[]>([]);

  useEffect(() => {
    editor?.setMonomerCreationSelectedType?.(values.type);
  }, [editor, values.type]);

  const handleModificationTypeChange = (
    indexToChange: number,
    value: string,
  ) => {
    const newModificationTypes = modificationTypes.map((t, i) =>
      i === indexToChange ? value : t,
    );

    setModificationTypes(newModificationTypes);
    onChangeModificationTypes(newModificationTypes);
  };

  const handleAddModificationType = () => {
    const newModificationTypes =
      modificationTypes.length >= MAX_MODIFICATION_TYPES
        ? modificationTypes
        : [...modificationTypes, ''];

    setModificationTypes(newModificationTypes);
    onChangeModificationTypes(newModificationTypes);
  };

  const deleteModificationType = (indexToDelete: number) => {
    const newModificationTypes = modificationTypes.filter(
      (_, i) => i !== indexToDelete,
    );

    setModificationTypes(newModificationTypes);
    onChangeModificationTypes(newModificationTypes);
  };

  const handleAttachmentPointNameChange = (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => {
    editor.reassignAttachmentPoint(currentName, newName);
  };

  const handleLeavingAtomChange = (
    apName: AttachmentPointName,
    newLeavingAtomId: number,
  ) => {
    editor.reassignAttachmentPointLeavingAtom(apName, newLeavingAtomId);
  };

  const handleAttachmentPointRemove = (name: AttachmentPointName) => {
    editor.removeAttachmentPoint(name);
  };

  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);

  if (!monomerCreationState) {
    return null;
  }

  const displayModificationTypes = type === KetMonomerClass.AminoAcid;
  const displayAliases =
    type &&
    [
      KetMonomerClass.AminoAcid,
      KetMonomerClass.Base,
      KetMonomerClass.Sugar,
      KetMonomerClass.Phosphate,
    ].includes(type);

  return (
    <div>
      <div
        className={clsx(styles.attributesFields, selectStyles.selectContainer)}
      >
        <AttributeField
          title="Symbol"
          control={
            <input
              type="text"
              className={clsx(styles.input, errors.symbol && styles.inputError)}
              placeholder="e.g. PEG-2"
              data-testid="symbol-input"
              value={symbol}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onFieldChange('symbol', event.target.value)
              }
              disabled={!type}
            />
          }
          required
          disabled={!type}
        />
        <AttributeField
          title="Name"
          control={
            <input
              type="text"
              className={clsx(styles.input, errors.name && styles.inputError)}
              placeholder="e.g. Diethylene Glycol"
              value={name}
              data-testid="name-input"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onFieldChange('name', event.target.value)
              }
              disabled={!type}
            />
          }
          required
          disabled={!type}
        />
        {props.showNaturalAnalogue !== false && (
          <AttributeField
            title="Natural analogue"
            control={
              <NaturalAnaloguePicker
                monomerType={type}
                value={naturalAnalogue}
                onChange={(value) => {
                  onFieldChange('naturalAnalogue', value);
                }}
                error={errors.naturalAnalogue}
              />
            }
            disabled={!isNaturalAnalogueRequired(type)}
            required
          />
        )}
      </div>

      <div className={styles.divider} />

      <div
        className={clsx(styles.attributesFields, selectStyles.selectContainer)}
      >
        <div className={styles.attachmentPointsHeader}>
          <p className={styles.attachmentPointsTitle}>Attachment points</p>
          <span
            className={styles.attachmentPointInfoIcon}
            title="To add new attachment points, right-click and mark atoms as leaving groups or connection points."
            data-testid="attachment-point-info-icon"
          >
            <Icon name="about" />
          </span>
        </div>
        {assignedAttachmentPoints.size > 0 && (
          <div className={styles.attachmentPoints}>
            {Array.from(assignedAttachmentPoints.entries()).map(
              ([name, atomPair]) => (
                <AttachmentPoint
                  name={name}
                  editor={editor}
                  onNameChange={handleAttachmentPointNameChange}
                  onLeavingAtomChange={handleLeavingAtomChange}
                  onRemove={handleAttachmentPointRemove}
                  key={`${name}-${atomPair[0]}-${atomPair[1]}`}
                />
              ),
            )}
          </div>
        )}
      </div>

      {displayModificationTypes && (
        <>
          <div className={styles.divider} />

          <div>
            <Accordion
              className={clsx(accordionClasses.accordion, styles.accordion)}
              square
            >
              <AccordionSummary
                className={styles.accordionSummary}
                expandIcon={
                  <Icon
                    className={accordionClasses.expandIcon}
                    name="chevron"
                  />
                }
                data-testid="modification-types-accordion"
              >
                Modification
              </AccordionSummary>
              <AccordionDetails>
                {modificationTypes.map((modificationType, idx) => (
                  <div className={styles.modificationTypeRow} key={idx}>
                    <ModificationTypeDropdown
                      value={modificationType}
                      naturalAnalogue={naturalAnalogue}
                      error={
                        errors[modificationType] ||
                        (errors.emptyModificationType &&
                          !modificationType.trim())
                      }
                      onChange={(value) =>
                        handleModificationTypeChange(idx, value)
                      }
                      testId={`modification-type-dropdown-${idx}`}
                    />

                    <IconButton
                      iconName="delete"
                      className={styles.deleteModificationTypeButton}
                      title="Delete modification type"
                      onClick={() => deleteModificationType(idx)}
                      testId={`delete-modification-type-button-${idx}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addModificationTypeButton}
                  onClick={handleAddModificationType}
                  disabled={modificationTypes.length >= MAX_MODIFICATION_TYPES}
                  data-testid="add-modification-type-button"
                >
                  Add modification type
                </button>
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      )}

      {displayAliases && (
        <>
          <div className={styles.divider} />

          <div>
            <Accordion
              className={clsx(accordionClasses.accordion, styles.accordion)}
              square
            >
              <AccordionSummary
                className={styles.accordionSummary}
                expandIcon={
                  <Icon
                    className={accordionClasses.expandIcon}
                    name="chevron"
                  />
                }
                data-testid="aliases-accordion"
              >
                Aliases
              </AccordionSummary>
              <AccordionDetails>
                <p className={styles.inputLabel}>HELM</p>
                <Autocomplete
                  freeSolo
                  options={[]}
                  value={aliasHELM}
                  onInputChange={(_event, newValue) =>
                    onFieldChange('aliasHELM', newValue)
                  }
                  data-testid="helm-alias-input"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      className={clsx(
                        styles.inputField,
                        errors.aliasHELM && styles.error,
                      )}
                      error={Boolean(errors.aliasHELM)}
                    />
                  )}
                />
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
};

export default MonomerCreationWizardFields;
