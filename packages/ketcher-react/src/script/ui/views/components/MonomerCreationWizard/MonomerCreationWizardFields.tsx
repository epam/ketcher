import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon, IconButton } from 'components';
import {
  AtomLabel,
  AttachmentPointName,
  ketcherProvider,
  KetMonomerClass,
} from 'ketcher-core';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker, {
  isNaturalAnalogueRequired,
} from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import AttributeField from './components/AttributeField/AttributeField';
import {
  StringWizardFormFieldId,
  WizardState,
} from './MonomerCreationWizard.types';
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
  onFieldChange: (fieldId: StringWizardFormFieldId, value: string) => void;
  showNaturalAnalogue?: boolean;
}

interface ModificationTypeItem {
  id: number;
  value: string;
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
  const [modificationTypes, setModificationTypes] = useState<
    ModificationTypeItem[]
  >([]);
  const modificationTypeIdRef = useRef(0);

  useEffect(() => {
    editor?.setMonomerCreationSelectedType?.(values.type);
  }, [editor, values.type]);

  const handleModificationTypeChange = (id: number, value: string) => {
    const newModificationTypes = modificationTypes.map((item) =>
      item.id === id ? { ...item, value } : item,
    );

    setModificationTypes(newModificationTypes);
    onChangeModificationTypes?.(newModificationTypes.map((item) => item.value));
  };

  const handleAddModificationType = () => {
    const newModificationTypes =
      modificationTypes.length >= MAX_MODIFICATION_TYPES
        ? modificationTypes
        : [
            ...modificationTypes,
            { id: modificationTypeIdRef.current++, value: '' },
          ];

    setModificationTypes(newModificationTypes);
    onChangeModificationTypes?.(newModificationTypes.map((item) => item.value));
  };

  const deleteModificationType = (id: number) => {
    const newModificationTypes = modificationTypes.filter(
      (item) => item.id !== id,
    );

    setModificationTypes(newModificationTypes);
    onChangeModificationTypes?.(newModificationTypes.map((item) => item.value));
  };

  const handleAttachmentPointNameChange = (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => {
    editor.reassignAttachmentPoint(currentName, newName);
  };

  const handleLeavingAtomChange = (
    apName: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) => {
    editor.changeLeavingAtomLabel(apName, newLeavingAtomLabel);
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
      KetMonomerClass.CHEM,
      KetMonomerClass.Phosphate,
      KetMonomerClass.RNA,
    ].includes(type as KetMonomerClass);

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
                  <div
                    className={styles.modificationTypeRow}
                    key={modificationType.id}
                  >
                    <ModificationTypeDropdown
                      value={modificationType.value}
                      naturalAnalogue={naturalAnalogue}
                      error={
                        errors[modificationType.value] ||
                        (errors.emptyModificationType &&
                          !modificationType.value.trim())
                      }
                      onChange={(value) =>
                        handleModificationTypeChange(modificationType.id, value)
                      }
                      testId={`modification-type-dropdown-${idx}`}
                    />

                    <IconButton
                      iconName="delete"
                      className={styles.deleteModificationTypeButton}
                      title="Delete modification type"
                      onClick={() =>
                        deleteModificationType(modificationType.id)
                      }
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
