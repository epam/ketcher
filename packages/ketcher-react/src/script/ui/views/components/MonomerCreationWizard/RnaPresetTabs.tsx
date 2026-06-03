import Tab from '@mui/material/Tab';
import { Icon } from 'components';
import Tabs from '@mui/material/Tabs';
import {
  KetMonomerClass,
  type AtomLabel,
  type AttachmentPointId,
  type AttachmentPointName,
  type RnaPresetComponentKey,
} from 'ketcher-core';
import {
  type ChangeEvent,
  Fragment,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type {
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
import type { Editor } from '../../../../editor';
import selectStyles from '../../../component/form/Select/Select.module.less';
import {
  type RnaPresetComponentType,
  MonomerCreationMarkAsComponentAction,
} from './MonomerCreationWizard.constants';
import AttachmentPoint from './components/AttachmentPoint/AttachmentPoint';
import {
  type PhosphatePosition,
  getLeavingAtomForAttachmentPoint,
} from './RnaPresetAttachmentPointValidation';
import {
  getAttachmentPointsForRnaPresetComponent,
  getConnectionAttachmentPointAtomIdsForComponent,
  getVisibleAttachmentPointsForRnaPreset,
} from './RnaPresetAttachmentPointsVisibility';
import { hasRequiredRnaPresetComponents } from './RnaPresetStructureValidation';

interface IRnaPresetTabsProps {
  wizardState: RnaPresetWizardState;
  editor: Editor;
  wizardStateDispatch: (action: RnaPresetWizardAction) => void;
  phosphatePosition: '3' | '5' | undefined;
  onPhosphatePositionChange: (position: '3' | '5') => void;
  /** User-overridden leaving atom labels for connection APs, keyed by
   * "<componentKey>:<apName>". Persists across tab switches. */
  connectionLeavingAtoms?: Map<string, AtomLabel>;
  onConnectionLeavingAtomChange?: (
    apName: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
    componentKey: RnaPresetComponentKey,
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
  const structureSelection = useSelector(selectionSelector);
  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);
  const hasSelectedAtoms = Boolean(structureSelection?.atoms?.length);
  const { wizardState, wizardStateDispatch, editor } = props;
  const currentTabState = wizardState[RNA_COMPONENT_KEYS[selectedTab - 1]];
  const {
    phosphatePosition,
    onPhosphatePositionChange,
    onConnectionLeavingAtomChange,
    connectionLeavingAtoms,
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
    base: getConnectionAttachmentPointAtomIdsForComponent(
      wizardState,
      struct,
      'base',
      phosphatePosition as PhosphatePosition | undefined,
    ),
    sugar: getConnectionAttachmentPointAtomIdsForComponent(
      wizardState,
      struct,
      'sugar',
      phosphatePosition as PhosphatePosition | undefined,
    ),
    phosphate: getConnectionAttachmentPointAtomIdsForComponent(
      wizardState,
      struct,
      'phosphate',
      phosphatePosition as PhosphatePosition | undefined,
    ),
  };
  const readonlyComponentAttachmentPoints = {
    base: Array.from(componentConnectionAttachmentPoints.base.entries()).map(
      ([id, { name, attachmentAtomId }]) => ({
        id,
        name,
        atomId: attachmentAtomId,
        leavingAtomLabel:
          connectionLeavingAtoms?.get(`base:${name}`) ??
          getLeavingAtomForAttachmentPoint(KetMonomerClass.Base, name),
      }),
    ),
    sugar: Array.from(componentConnectionAttachmentPoints.sugar.entries()).map(
      ([id, { name, attachmentAtomId }]) => ({
        id,
        name,
        atomId: attachmentAtomId,
        leavingAtomLabel:
          connectionLeavingAtoms?.get(`sugar:${name}`) ??
          getLeavingAtomForAttachmentPoint(KetMonomerClass.Sugar, name),
      }),
    ),
    phosphate: Array.from(
      componentConnectionAttachmentPoints.phosphate.entries(),
    ).map(([id, { name, attachmentAtomId }]) => ({
      id,
      name,
      atomId: attachmentAtomId,
      leavingAtomLabel:
        connectionLeavingAtoms?.get(`phosphate:${name}`) ??
        getLeavingAtomForAttachmentPoint(KetMonomerClass.Phosphate, name),
    })),
  };

  const applyHighlights = useCallback(
    (activeTabIndex: number) => {
      editor.highlights.clear();

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
    applyHighlights(newValue);
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
      const selection = editor.explicitSelected();
      const atomIds = selection?.atoms || [];
      const bondIds = selection?.bonds || [];

      editor.markAsRnaComponent(rnaComponentKey, atomIds, bondIds);
    },
    [editor],
  );

  const handlePhosphatePositionChange = (position: '3' | '5') => {
    onPhosphatePositionChange(position);
  };

  const handleAttachmentPointNameChange = (
    attachmentPointId: AttachmentPointId,
    newName: AttachmentPointName,
  ) => {
    editor.reassignAttachmentPoint(attachmentPointId, newName);
  };

  const handleLeavingAtomChange = (
    attachmentPointId: AttachmentPointId,
    newLeavingAtomLabel: AtomLabel,
  ) => {
    editor.changeLeavingAtomLabel(attachmentPointId, newLeavingAtomLabel);
  };

  const handleAttachmentPointRemove = (
    attachmentPointId: AttachmentPointId,
  ) => {
    editor.removeAttachmentPoint(attachmentPointId);
  };

  const currentTabStructure = currentTabState?.structure;

  useEffect(() => {
    if (!currentTabStructure) {
      return;
    }

    applyHighlights(selectedTab);
    editor.selection(null);
  }, [applyHighlights, currentTabStructure, editor, selectedTab]);

  // Sync connection (readonly) attachment points with the canvas whenever the
  // active RNA component tab or the wizard state changes. All assigned APs
  // (R-labels) stay visible on every tab so users can see the full attachment-
  // point picture while editing a single component.
  useEffect(() => {
    editor.setVisibleAssignedAttachmentPoints(undefined);

    const activeComponentKey = RNA_COMPONENT_KEYS[selectedTab - 1];

    if (!activeComponentKey) {
      editor.setConnectionAttachmentPoints(new Map());
      return;
    }

    // Component tab: restrict visible assigned APs to those belonging to this
    // component only, so APs from other components are hidden on the canvas.
    editor.setVisibleAssignedAttachmentPoints(
      getAttachmentPointsForRnaPresetComponent(
        assignedAttachmentPoints,
        wizardState,
        activeComponentKey,
      ),
    );

    editor.setConnectionAttachmentPoints(
      getConnectionAttachmentPointAtomIdsForComponent(
        wizardState,
        struct,
        activeComponentKey,
        phosphatePosition as PhosphatePosition | undefined,
      ),
    );
  }, [
    assignedAttachmentPoints,
    editor,
    phosphatePosition,
    selectedTab,
    struct,
    wizardState,
  ]);

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
      applyHighlights(selectedTab);
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
  }, [wizardState, handleClickCreateComponent, applyHighlights, selectedTab]);

  const hasErrorInTab = (
    wizardState: WizardState | RnaPresetWizardStatePresetFieldValue,
  ) => {
    return Object.values(wizardState.errors).some((errorValue) =>
      Boolean(errorValue),
    );
  };
  // Keep component tabs red only while the missing-components condition still
  // applies; marking the required components clears the visual state immediately.
  const hasComponentsError =
    Boolean(wizardState.preset.errors.components) &&
    !hasRequiredRnaPresetComponents(wizardState);

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
            (hasErrorInTab(wizardState.base) || hasComponentsError) &&
              styles.errorTab,
          )}
          data-testid="nucleotide-base-tab"
          label={<div className={styles.tabLabel}>Base</div>}
          icon={<Icon name="base" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            (hasErrorInTab(wizardState.sugar) || hasComponentsError) &&
              styles.errorTab,
          )}
          data-testid="nucleotide-sugar-tab"
          label={<div className={styles.tabLabel}>Sugar</div>}
          icon={<Icon name="sugar" />}
        />
        <Tab
          className={clsx(
            styles.styledTab,
            (hasErrorInTab(wizardState.phosphate) || hasComponentsError) &&
              styles.errorTab,
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
              {presetAttachmentPoints.size > 0 && (
                <div className={monomerCreationWizardStyles.attachmentPoints}>
                  {Array.from(presetAttachmentPoints.entries()).map(
                    ([attachmentPointId, attachmentPoint]) => (
                      <AttachmentPoint
                        id={attachmentPointId}
                        name={attachmentPoint.name}
                        editor={editor}
                        onNameChange={handleAttachmentPointNameChange}
                        onLeavingAtomChange={handleLeavingAtomChange}
                        onRemove={handleAttachmentPointRemove}
                        key={attachmentPointId}
                      />
                    ),
                  )}
                </div>
              )}
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
                  onReadonlyLeavingAtomChange={
                    onConnectionLeavingAtomChange
                      ? (apName, newLabel) =>
                          onConnectionLeavingAtomChange(
                            apName,
                            newLabel,
                            rnaComponentKey,
                          )
                      : undefined
                  }
                  wizardState={wizardState[rnaComponentKey]}
                />
              </Fragment>
            )
          );
        })}
      </div>
    </div>
  );
};
