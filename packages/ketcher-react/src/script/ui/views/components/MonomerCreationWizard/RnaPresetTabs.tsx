import Tab from '@mui/material/Tab';
import { Icon } from 'components';
import Tabs from '@mui/material/Tabs';
import {
  AtomLabel,
  AttachmentPointName,
  KetMonomerClass,
  RnaPresetComponentKey,
} from 'ketcher-core';
import { ChangeEvent, Fragment, useEffect, useState, useCallback } from 'react';
import {
  RnaPresetWizardAction,
  RnaPresetWizardState,
  RnaPresetWizardStatePresetFieldValue,
  StringWizardFormFieldId,
  WizardState,
} from './MonomerCreationWizard.types';
import MonomerCreationWizardFields from './MonomerCreationWizardFields';
import clsx from 'clsx';
import monomerCreationWizardStyles from './MonomerCreationWizard.module.less';
import styles from './RnaPresetTabs.module.less';
import AttributeField from './components/AttributeField/AttributeField';
import {
  editorMonomerCreationStateSelector,
  selectionSelector,
} from '../../../state/editor/selectors';
import { useSelector } from 'react-redux';
import { Editor } from '../../../../editor';
import inputStyles from '../../../component/form/Input/Input.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import {
  MonomerCreationMarkAsComponentAction,
  RnaPresetComponentType,
} from './MonomerCreationWizard.constants';
import AttachmentPoint from './components/AttachmentPoint/AttachmentPoint';
import ReadonlyAttachmentPoint from './components/ReadonlyAttachmentPoint/ReadonlyAttachmentPoint';
import {
  getLeavingAtomForAttachmentPoint,
  PhosphatePosition,
} from './RnaPresetAttachmentPointValidation';
import {
  getAttachmentPointsForRnaPresetComponent,
  getConnectionAttachmentPointAtomIdsForComponent,
  getConnectionAttachmentPointsForRnaPresetComponent,
  getVisibleAttachmentPointsForRnaPreset,
} from './RnaPresetAttachmentPointsVisibility';

interface IRnaPresetTabsProps {
  wizardState: RnaPresetWizardState;
  editor: Editor;
  wizardStateDispatch: (action: RnaPresetWizardAction) => void;
  phosphatePosition: '3' | '5' | undefined;
  onPhosphatePositionChange: (position: '3' | '5') => void;
  onConnectionLeavingAtomChange?: (
    apName: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) => void;
}

const ACTIVE_HIGHLIGHT_COLOR = '#CDF1FC';
const INACTIVE_HIGHLIGHT_COLOR = '#EFF2F5';
const RNA_COMPONENT_KEYS = ['base', 'sugar', 'phosphate'] as const;
const RNA_COMPONENT_HINTS: Record<RnaPresetComponentKey, string> = {
  base: 'Select all atoms that form the base.',
  sugar: 'Select all atoms that form the sugar.',
  phosphate: 'Select all atoms that form the phosphate.',
};

export const RnaPresetTabs = (props: IRnaPresetTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);
  const structureSelection = useSelector(selectionSelector);
  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);
  const hasSelectedAtoms = Boolean(structureSelection?.atoms?.length);
  const { wizardState, wizardStateDispatch, editor } = props;
  const currentTabState = wizardState[RNA_COMPONENT_KEYS[selectedTab - 1]];
  const {
    phosphatePosition,
    onPhosphatePositionChange,
    onConnectionLeavingAtomChange,
  } = props;
  const assignedAttachmentPoints =
    monomerCreationState?.assignedAttachmentPoints ?? new Map();
  const struct = editor.struct();

  const presetAttachmentPoints = getVisibleAttachmentPointsForRnaPreset(
    assignedAttachmentPoints,
    wizardState,
    struct,
  );
  const componentAttachmentPoints = {
    base: getAttachmentPointsForRnaPresetComponent(
      assignedAttachmentPoints,
      wizardState,
      'base',
    ),
    sugar: getAttachmentPointsForRnaPresetComponent(
      assignedAttachmentPoints,
      wizardState,
      'sugar',
    ),
    phosphate: getAttachmentPointsForRnaPresetComponent(
      assignedAttachmentPoints,
      wizardState,
      'phosphate',
    ),
  };
  const componentConnectionAttachmentPoints = {
    base: getConnectionAttachmentPointsForRnaPresetComponent(
      wizardState,
      struct,
      'base',
      phosphatePosition as PhosphatePosition | undefined,
    ),
    sugar: getConnectionAttachmentPointsForRnaPresetComponent(
      wizardState,
      struct,
      'sugar',
      phosphatePosition as PhosphatePosition | undefined,
    ),
    phosphate: getConnectionAttachmentPointsForRnaPresetComponent(
      wizardState,
      struct,
      'phosphate',
      phosphatePosition as PhosphatePosition | undefined,
    ),
  };
  const readonlyComponentAttachmentPoints = {
    base: componentConnectionAttachmentPoints.base.map((name) => ({
      name,
      leavingAtomLabel: getLeavingAtomForAttachmentPoint(
        KetMonomerClass.Base,
        name,
      ),
    })),
    sugar: componentConnectionAttachmentPoints.sugar.map((name) => ({
      name,
      leavingAtomLabel: getLeavingAtomForAttachmentPoint(
        KetMonomerClass.Sugar,
        name,
      ),
    })),
    phosphate: componentConnectionAttachmentPoints.phosphate.map((name) => ({
      name,
      leavingAtomLabel: getLeavingAtomForAttachmentPoint(
        KetMonomerClass.Phosphate,
        name,
      ),
    })),
  };

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
          ? ACTIVE_HIGHLIGHT_COLOR
          : INACTIVE_HIGHLIGHT_COLOR;

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
    rnaComponentKey: RnaPresetComponentKey | 'preset',
  ) => {
    wizardStateDispatch({
      type: 'SetFieldValue',
      fieldId,
      value,
      rnaComponentKey,
      editor,
    });
  };

  const handleClickCreateComponent = useCallback(
    (rnaComponentKey: RnaPresetComponentKey) => {
      // Get the current selection from the editor
      const selection = editor.explicitSelected();
      const atomIds = selection?.atoms || [];
      const bondIds = selection?.bonds || [];

      // Update the wizard state
      wizardStateDispatch({
        type: 'SetRnaPresetComponentStructure',
        rnaComponentKey,
        editor,
      });

      // Sync the component atoms with the Editor for auto-assignment tracking
      editor.setRnaComponentAtoms(rnaComponentKey, atomIds, bondIds);
    },
    [editor, wizardStateDispatch],
  );

  const handlePhosphatePositionChange = (position: '3' | '5') => {
    onPhosphatePositionChange(position);
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

  const currentTabStructure = currentTabState?.structure;

  useEffect(() => {
    if (!currentTabStructure) {
      return;
    }

    applyHighlights(selectedTab, isHighlightEnabled);
    editor.selection(null);
  }, [
    applyHighlights,
    currentTabStructure,
    editor,
    isHighlightEnabled,
    selectedTab,
  ]);

  // Sync connection (readonly) attachment points with the canvas whenever the
  // active RNA component tab or the wizard state changes.
  useEffect(() => {
    const activeComponentKey = RNA_COMPONENT_KEYS[selectedTab - 1];
    if (!activeComponentKey) {
      // Preset tab: aggregate connection APs from all RNA components so that
      // hovering readonly attachment points on the Preset tab highlights the
      // corresponding atoms on the canvas.
      const allConnectionAtomIds = new Map<
        AttachmentPointName,
        [number, number]
      >();
      RNA_COMPONENT_KEYS.forEach((componentKey) => {
        const componentConnectionAtomIds =
          getConnectionAttachmentPointAtomIdsForComponent(
            wizardState,
            struct,
            componentKey,
            phosphatePosition as PhosphatePosition | undefined,
          );
        componentConnectionAtomIds.forEach((atomPair, apName) => {
          allConnectionAtomIds.set(apName, atomPair);
        });
      });
      editor.setConnectionAttachmentPoints(allConnectionAtomIds);
      return;
    }

    const connectionAtomIds = getConnectionAttachmentPointAtomIdsForComponent(
      wizardState,
      struct,
      activeComponentKey,
      phosphatePosition as PhosphatePosition | undefined,
    );
    editor.setConnectionAttachmentPoints(connectionAtomIds);
  }, [editor, selectedTab, struct, wizardState, phosphatePosition]);

  useEffect(() => {
    return () => {
      editor?.highlights.clear();
    };
  }, [editor?.highlights]);

  useEffect(() => {
    const handleMarkAsComponent = (event: Event) => {
      const componentType = (event as CustomEvent<RnaPresetComponentType>)
        .detail;
      const tabIndex = RNA_COMPONENT_KEYS.indexOf(componentType) + 1;

      // First, mark the structure as the component
      handleClickCreateComponent(componentType);

      // Then, switch to the appropriate tab
      setSelectedTab(tabIndex);
      applyHighlights(selectedTab, isHighlightEnabled);
    };

    window.addEventListener(
      MonomerCreationMarkAsComponentAction,
      handleMarkAsComponent,
    );

    return () => {
      window.removeEventListener(
        MonomerCreationMarkAsComponentAction,
        handleMarkAsComponent,
      );
    };
  }, [
    wizardState,
    handleClickCreateComponent,
    applyHighlights,
    selectedTab,
    isHighlightEnabled,
  ]);

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
          data-testid="nucleotide-preset-tab"
          label={<div className={styles.tabLabel}>Preset</div>}
          icon={<Icon name="preset" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.base) && styles.errorTab,
          )}
          data-testid="nucleotide-base-tab"
          label={<div className={styles.tabLabel}>Base</div>}
          icon={<Icon name="base" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.sugar) && styles.errorTab,
          )}
          data-testid="nucleotide-sugar-tab"
          label={<div className={styles.tabLabel}>Sugar</div>}
          icon={<Icon name="sugar" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            hasErrorInTab(wizardState.phosphate) && styles.errorTab,
          )}
          data-testid="nucleotide-phosphate-tab"
          label={<div className={styles.tabLabel}>Phosphate</div>}
          icon={<Icon name="phosphate" />}
        />
      </Tabs>
      <div className={styles.tabsContentWrapper}>
        {selectedTab === 0 && (
          <>
            <AttributeField
              title="Code"
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
                  data-testid="code-input"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleFieldChange('name', event.target.value, 'preset')
                  }
                />
              }
              required
            />
            <div className={monomerCreationWizardStyles.divider} />
            <div
              className={clsx(
                monomerCreationWizardStyles.attributesFields,
                selectStyles.selectContainer,
              )}
            >
              <div
                className={monomerCreationWizardStyles.attachmentPointsHeader}
              >
                <p
                  className={monomerCreationWizardStyles.attachmentPointsTitle}
                >
                  Attachment points
                </p>
                <span
                  className={
                    monomerCreationWizardStyles.attachmentPointInfoIcon
                  }
                  title="To add new attachment points, right-click and mark atoms as leaving groups or connection points."
                  data-testid="attachment-point-info-icon"
                >
                  <Icon name="about" />
                </span>
              </div>
              {(() => {
                // Aggregate readonly (inter-component connection) attachment points
                // from all RNA components so they are visible on the Preset tab.
                const allReadonlyAttachmentPoints = RNA_COMPONENT_KEYS.flatMap(
                  (key) => readonlyComponentAttachmentPoints[key],
                );
                const hasAnyAPs =
                  presetAttachmentPoints.size > 0 ||
                  allReadonlyAttachmentPoints.length > 0;
                return (
                  hasAnyAPs && (
                    <div
                      className={monomerCreationWizardStyles.attachmentPoints}
                    >
                      {Array.from(presetAttachmentPoints.entries()).map(
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
                      {allReadonlyAttachmentPoints.map(
                        ({ name: apName, leavingAtomLabel }) => (
                          <ReadonlyAttachmentPoint
                            key={`readonly-preset-${apName}`}
                            name={apName}
                            leavingAtomLabel={leavingAtomLabel}
                            editor={editor}
                            onLeavingAtomChange={onConnectionLeavingAtomChange}
                          />
                        ),
                      )}
                    </div>
                  )
                );
              })()}
            </div>
          </>
        )}
        {RNA_COMPONENT_KEYS.map((rnaComponentKey, index) => {
          return (
            index + 1 === selectedTab && (
              <Fragment key={rnaComponentKey}>
                <div className={styles.createComponentWrapper}>
                  <div>{RNA_COMPONENT_HINTS[rnaComponentKey]}</div>
                  <button
                    data-testid={`Mark-as-${rnaComponentKey}-button`}
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
                  assignedAttachmentPoints={
                    componentAttachmentPoints[rnaComponentKey]
                  }
                  readonlyAttachmentPoints={
                    readonlyComponentAttachmentPoints[rnaComponentKey]
                  }
                  showNaturalAnalogue={rnaComponentKey === 'base'}
                  attachmentPointsExtra={
                    rnaComponentKey === 'phosphate' ? (
                      <AttributeField
                        title="Position"
                        required
                        control={
                          <div
                            data-testid="phosphate-position-picker"
                            className={clsx(
                              styles.phosphatePositionPicker,
                              wizardState.preset.errors.phosphatePosition &&
                                styles.phosphatePositionPickerError,
                            )}
                          >
                            <button
                              type="button"
                              className={clsx(
                                styles.phosphatePositionButton,
                                phosphatePosition === '5' &&
                                  styles.phosphatePositionButtonActive,
                              )}
                              data-testid="phosphate-position-5-button"
                              aria-pressed={phosphatePosition === '5'}
                              onClick={() => handlePhosphatePositionChange('5')}
                            >
                              <Icon
                                name="preset-left-phosphate"
                                className={styles.phosphatePositionIcon}
                              />
                              <span
                                className={styles.phosphatePositionButtonLabel}
                              >
                                5&apos;-left
                              </span>
                            </button>
                            <button
                              type="button"
                              className={clsx(
                                styles.phosphatePositionButton,
                                phosphatePosition === '3' &&
                                  styles.phosphatePositionButtonActive,
                              )}
                              data-testid="phosphate-position-3-button"
                              aria-pressed={phosphatePosition === '3'}
                              onClick={() => handlePhosphatePositionChange('3')}
                            >
                              <Icon
                                name="preset-right-phosphate"
                                className={styles.phosphatePositionIcon}
                              />
                              <span
                                className={styles.phosphatePositionButtonLabel}
                              >
                                3&apos;-right
                              </span>
                            </button>
                          </div>
                        }
                      />
                    ) : null
                  }
                  onFieldChange={(
                    fieldId: StringWizardFormFieldId,
                    value: string,
                  ) => {
                    handleFieldChange(fieldId, value, rnaComponentKey);
                  }}
                  onReadonlyLeavingAtomChange={onConnectionLeavingAtomChange}
                  wizardState={wizardState[rnaComponentKey]}
                />
              </Fragment>
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
        />
        <span className={inputStyles.checkbox} /> Highlight
      </label>
    </div>
  );
};
