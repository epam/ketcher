# Implementation Plan: Settings Window for Macromolecules Mode

**Status:** Planning Phase
**Date:** 2026-03-07
**Target:** Introduce full-featured settings dialog in ketcher-macromolecules

---

## Executive Summary

This plan details the implementation of a settings window in macromolecules mode that:
- ✅ Shows **ALL** settings (no hiding based on relevance)
- ✅ Follows macromolecules UI patterns (MUI-based modals)
- ✅ Maintains consistency with small molecules UX (same field organization)
- ✅ Leverages centralized SettingsService from ketcher-core
- ✅ Implements import/export, reset, and preset functionality

---

## Current State Summary

**Small Molecules (ketcher-react):**
- ✅ Full-featured Settings dialog with 7 accordion tabs
- ✅ Custom Dialog component with Header/Body/Footer structure
- ✅ Redux integration (legacy) + SettingsService (modern)
- ✅ Features: Open/Save JSON, Reset to defaults, Apply ACS preset
- ✅ Styled with CSS Modules (LESS)

**Macromolecules (ketcher-macromolecules):**
- ⚠️ Settings button exists but only logs to console
- ✅ MUI-based modal system with Redux Toolkit
- ✅ Working examples: Save, Open, Delete, About modals
- ✅ Access to SettingsService via `editor.ketcher.settingsService`
- ❌ No settings UI implementation

---

## Architectural Approach

**Adapt Small Molecules Pattern with MUI Components**

**Rationale:**
- Leverage proven field organization (7 categories, ~40-50 settings)
- Maintain consistency with small molecules UX
- Use macromolecules UI framework (MUI) for native look/feel
- Follow established modal patterns in macromolecules

**Benefits:**
- ✅ Consistent user experience across modes
- ✅ Proven field groupings and validation
- ✅ Native macromolecules look and feel
- ✅ Reuses existing SettingsService infrastructure
- ✅ Follows macromolecules modal conventions

---

## Implementation Plan

### **Phase 1: Modal System Integration** (1-2 hours)

#### 1.1 Update Modal Types

**File:** `src/state/modal/modalSlice.ts`

Add `'settings'` to `ModalName` type:

```typescript
type ModalName =
  | 'open'
  | 'save'
  | 'delete'
  | 'updateSequenceInRNABuilder'
  | 'monomerConnection'
  | 'confirmationDialog'
  | 'settings';  // Add this
```

#### 1.2 Create Settings Component Structure

**Location:** `src/components/modal/Settings/`

**Files to create:**
```
Settings/
├── Settings.tsx           # Main component
├── Settings.module.less   # Styles
├── SettingsAccordion.tsx  # Accordion wrapper
├── SettingsField.tsx      # Individual field renderer
├── fieldGroups.ts         # Field organization and definitions
├── types.ts               # TypeScript interfaces
├── utils.ts               # Helper functions
├── __tests__/
│   ├── Settings.test.tsx
│   ├── SettingsAccordion.test.tsx
│   └── SettingsField.test.tsx
└── index.ts               # Barrel export
```

#### 1.3 Register in Modal System

**File:** `src/components/modal/modalContainer/modalComponentList.ts`

```typescript
import { Settings } from '../Settings';

export const modalComponentList = {
  open: Open,
  save: Save,
  delete: Delete,
  updateSequenceInRNABuilder: UpdateSequenceInRNABuilder,
  monomerConnection: MonomerConnection,
  confirmationDialog: ConfirmationDialog,
  settings: Settings,  // Add this
};
```

#### 1.4 Update Settings Button

**File:** `src/components/ButtonsComponents/ButtonsComponents.tsx`

Replace console.log with modal dispatch:

```typescript
import { useAppDispatch } from '../../hooks';
import { openModal } from '../../state/modal';

const ButtonsComponents = () => {
  const dispatch = useAppDispatch();

  const handleSettingsClick = () => {
    dispatch(openModal('settings'));
  };

  return (
    // ...
    <IconButton
      iconName="settings"
      title="Settings"
      onClick={handleSettingsClick}
      testId="settings-button"
    />
  );
};
```

---

### **Phase 2: Settings Component Implementation** (4-6 hours)

#### 2.1 Main Settings Component

**File:** `src/components/modal/Settings/Settings.tsx`

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../shared/modal/Modal';
import { ActionButton } from '../../shared/actionButton';
import { SettingsAccordion } from './SettingsAccordion';
import { useAppSelector } from '../../../hooks';
import { selectEditor } from '../../../state/common/editorSlice';
import { Settings as SettingsType } from 'ketcher-core';
import isEqual from 'lodash/isEqual';
import styles from './Settings.module.less';

interface SettingsProps {
  isModalOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isModalOpen, onClose }) => {
  const editor = useAppSelector(selectEditor);
  const settingsService = editor?.ketcher?.settingsService;

  // Local state for editing
  const [currentSettings, setCurrentSettings] = useState<SettingsType | null>(null);
  const [initialSettings, setInitialSettings] = useState<SettingsType | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['general']);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize from SettingsService
  useEffect(() => {
    if (!settingsService || !isModalOpen) return;

    const settings = settingsService.getSettings();
    setCurrentSettings(settings);
    setInitialSettings(settings);

    // Subscribe to external changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setCurrentSettings(newSettings);
    });

    return unsubscribe;
  }, [settingsService, isModalOpen]);

  // Detect changes
  const hasChanges = useMemo(() => {
    return !isEqual(currentSettings, initialSettings);
  }, [currentSettings, initialSettings]);

  // Handlers
  const handleSettingsChange = (partial: Partial<SettingsType>) => {
    setCurrentSettings((prev) => prev ? { ...prev, ...partial } : null);
  };

  const handleGroupToggle = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleApply = async () => {
    if (!settingsService || !currentSettings) return;

    setIsLoading(true);
    try {
      await settingsService.updateSettings(currentSettings);
      setInitialSettings(currentSettings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      // TODO: Show error notification via modal system
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!settingsService) return;

    if (!window.confirm('Reset all settings to defaults?')) return;

    setIsLoading(true);
    try {
      const defaults = await settingsService.resetToDefaults();
      setCurrentSettings(defaults);
      setInitialSettings(defaults);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!window.confirm('Discard changes?')) return;
    }
    onClose();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !settingsService) return;

      setIsLoading(true);
      try {
        const text = await file.text();
        await settingsService.importSettings(text);
        // Settings automatically updated via subscription
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert(`Import failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    input.click();
  };

  const handleExport = () => {
    if (!settingsService) return;

    try {
      const json = settingsService.exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ketcher-settings-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
      alert('Export failed');
    }
  };

  if (!currentSettings) {
    return null;
  }

  return (
    <Modal
      title="Settings"
      isOpen={isModalOpen}
      onClose={handleCancel}
      showExpandButton={true}
      modalWidth="800px"
      testId="settings-modal"
    >
      <Modal.Content>
        <div className={styles.settingsContent}>
          <SettingsAccordion
            settings={currentSettings}
            onChange={handleSettingsChange}
            expandedGroups={expandedGroups}
            onGroupToggle={handleGroupToggle}
          />
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className={styles.footerLeft}>
          <ActionButton
            label="Open from File"
            styleType="secondary"
            onClick={handleImport}
            disabled={isLoading}
          />
          <ActionButton
            label="Save to File"
            styleType="secondary"
            onClick={handleExport}
            disabled={isLoading}
          />
          <ActionButton
            label="Reset"
            styleType="secondary"
            onClick={handleReset}
            disabled={isLoading}
          />
        </div>
        <div className={styles.footerRight}>
          <ActionButton
            label="Cancel"
            styleType="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          />
          <ActionButton
            label="Apply"
            onClick={handleApply}
            disabled={!hasChanges || isLoading}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
};
```

#### 2.2 Styles

**File:** `src/components/modal/Settings/Settings.module.less`

```less
.settingsContent {
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.footerLeft {
  display: flex;
  gap: 8px;
  flex: 1;
}

.footerRight {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
```

---

### **Phase 3: Settings Accordion Implementation** (3-4 hours)

#### 3.1 Accordion Component

**File:** `src/components/modal/Settings/SettingsAccordion.tsx`

```typescript
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Settings } from 'ketcher-core';
import { FIELD_GROUPS } from './fieldGroups';
import { SettingsFields } from './SettingsFields';
import styles from './Settings.module.less';

interface SettingsAccordionProps {
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
  expandedGroups: string[];
  onGroupToggle: (groupId: string) => void;
}

export const SettingsAccordion: React.FC<SettingsAccordionProps> = ({
  settings,
  onChange,
  expandedGroups,
  onGroupToggle,
}) => {
  return (
    <div className={styles.accordionContainer}>
      {FIELD_GROUPS.map((group) => (
        <Accordion
          key={group.id}
          expanded={expandedGroups.includes(group.id)}
          onChange={() => onGroupToggle(group.id)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${group.id}-content`}
            id={`${group.id}-header`}
          >
            <Typography>{group.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SettingsFields
              fields={group.fields}
              settings={settings}
              onChange={onChange}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
```

---

### **Phase 4: Settings Fields Implementation** (4-5 hours)

#### 4.1 Fields Container

**File:** `src/components/modal/Settings/SettingsFields.tsx`

```typescript
import React from 'react';
import { Settings } from 'ketcher-core';
import { SettingsField } from './SettingsField';
import { FIELD_DEFINITIONS } from './fieldGroups';
import styles from './Settings.module.less';

interface SettingsFieldsProps {
  fields: string[];
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
}

export const SettingsFields: React.FC<SettingsFieldsProps> = ({
  fields,
  settings,
  onChange,
}) => {
  return (
    <div className={styles.fieldsContainer}>
      {fields.map((fieldName) => {
        const field = FIELD_DEFINITIONS[fieldName];
        if (!field) {
          console.warn(`Field definition not found: ${fieldName}`);
          return null;
        }

        return (
          <SettingsField
            key={fieldName}
            name={fieldName}
            label={field.label}
            type={field.type}
            value={settings[fieldName]}
            options={field.options}
            min={field.min}
            max={field.max}
            step={field.step}
            tooltip={field.tooltip}
            onChange={(value) => onChange({ [fieldName]: value })}
          />
        );
      })}
    </div>
  );
};
```

#### 4.2 Individual Field Component

**File:** `src/components/modal/Settings/SettingsField.tsx`

```typescript
import React from 'react';
import {
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import styles from './Settings.module.less';

interface SettingsFieldProps {
  name: string;
  label: string;
  type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

export const SettingsField: React.FC<SettingsFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  options,
  min,
  max,
  step,
  tooltip,
}) => {
  const renderField = () => {
    switch (type) {
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                data-testid={`setting-${name}`}
              />
            }
            label={label}
          />
        );

      case 'number':
        return (
          <TextField
            type="number"
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
            inputProps={{ min, max, step: step ?? 1 }}
            fullWidth
            size="small"
            data-testid={`setting-${name}`}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              label={label}
              data-testid={`setting-${name}`}
            >
              {options?.map((opt) => (
                <MenuItem key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'color':
        return (
          <TextField
            type="color"
            label={label}
            value={value ?? '#000000'}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            size="small"
            data-testid={`setting-${name}`}
          />
        );

      case 'text':
      default:
        return (
          <TextField
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            size="small"
            data-testid={`setting-${name}`}
          />
        );
    }
  };

  const field = renderField();

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="top">
        <div className={styles.fieldWrapper}>{field}</div>
      </Tooltip>
    );
  }

  return <div className={styles.fieldWrapper}>{field}</div>;
};
```

---

### **Phase 5: Field Definitions** (2-3 hours)

#### 5.1 Field Groups and Definitions

**File:** `src/components/modal/Settings/fieldGroups.ts`

```typescript
import { Settings } from 'ketcher-core';

export interface FieldGroup {
  id: string;
  title: string;
  fields: Array<keyof Settings>;
}

export interface FieldDefinition {
  label: string;
  type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

/**
 * All 7 field groups from small molecules mode
 * NO FILTERING - all settings are shown
 */
export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'general',
    title: 'General',
    fields: [
      'resetToSelect',
      'rotationStep',
      'showValenceWarnings',
      'atomColoring',
      'font',
      'fontsz',
      'fontszsub',
      'zoom',
      'imageResolution',
    ],
  },
  {
    id: 'stereochemistry',
    title: 'Stereochemistry',
    fields: [
      'stereoColoringType',
      'stereoLabelStyle',
      'colorStereogenicCenters',
      'colorOfAbsoluteCenters',
      'colorOfAndCenters',
      'colorOfOrCenters',
      'labelOfAbsoluteCenters',
      'labelOfAndCenters',
      'labelOfOrCenters',
    ],
  },
  {
    id: 'atoms',
    title: 'Atoms',
    fields: [
      'carbonExplicitly',
      'showCharge',
      'showHydrogenLabels',
      'showValence',
      'aromaticityType',
    ],
  },
  {
    id: 'bonds',
    title: 'Bonds',
    fields: [
      'aromaticCircle',
      'bondSpacing',
      'bondThickness',
      'bondLength',
      'stereoBondWidth',
      'doubleBondWidth',
      'tripleBondWidth',
    ],
  },
  {
    id: 'server',
    title: 'Server',
    fields: [
      'smart-layout',
      'ignore-stereochemistry-errors',
      'mass-skip-error-on-pseudoatoms',
      'gross-formula-add-rsites',
      'gross',
    ],
  },
  {
    id: 'viewer3d',
    title: '3D Viewer',
    fields: [
      'miewMode',
      'miewTheme',
      'miewAtomLabel',
    ],
  },
  {
    id: 'debug',
    title: 'Options for Debugging',
    fields: [
      'showAtomIds',
      'showBondIds',
      'showHalfBondIds',
      'showLoopIds',
    ],
  },
];

/**
 * Field definitions for all settings
 * NO FILTERING - all settings are defined
 */
export const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  // General
  resetToSelect: {
    label: 'Reset to Select Tool',
    type: 'select',
    options: [
      { value: true, label: 'Enabled' },
      { value: false, label: 'Disabled' },
      { value: 'paste', label: 'After Paste' },
    ],
    tooltip: 'Automatically switch back to selection tool after drawing',
  },
  rotationStep: {
    label: 'Rotation Step (degrees)',
    type: 'number',
    min: 1,
    max: 90,
    step: 1,
    tooltip: 'Angle increment for rotating structures',
  },
  showValenceWarnings: {
    label: 'Show Valence Warnings',
    type: 'checkbox',
    tooltip: 'Highlight atoms with unusual valence',
  },
  atomColoring: {
    label: 'Atom Coloring',
    type: 'checkbox',
    tooltip: 'Color atoms by element type',
  },
  font: {
    label: 'Font',
    type: 'select',
    options: [
      { value: '30px Arial', label: 'Arial' },
      { value: '30px Times New Roman', label: 'Times New Roman' },
      { value: '30px Courier New', label: 'Courier New' },
    ],
  },
  fontsz: {
    label: 'Font Size',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  fontszsub: {
    label: 'Sub/Superscript Font Size',
    type: 'number',
    min: 1,
    max: 96,
    step: 1,
  },
  zoom: {
    label: 'Zoom',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  imageResolution: {
    label: 'Image Resolution (DPI)',
    type: 'number',
    min: 72,
    max: 600,
    step: 1,
  },

  // Stereochemistry
  stereoColoringType: {
    label: 'Stereo Coloring Type',
    type: 'select',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'by-abs', label: 'By Absolute Configuration' },
      { value: 'by-label', label: 'By Label' },
    ],
  },
  stereoLabelStyle: {
    label: 'Stereo Label Style',
    type: 'select',
    options: [
      { value: 'classic', label: 'Classic' },
      { value: 'iupac', label: 'IUPAC' },
    ],
  },
  colorStereogenicCenters: {
    label: 'Color Stereogenic Centers',
    type: 'checkbox',
  },
  colorOfAbsoluteCenters: {
    label: 'Color of Absolute Centers',
    type: 'color',
  },
  colorOfAndCenters: {
    label: 'Color of AND Centers',
    type: 'color',
  },
  colorOfOrCenters: {
    label: 'Color of OR Centers',
    type: 'color',
  },
  labelOfAbsoluteCenters: {
    label: 'Label of Absolute Centers',
    type: 'text',
  },
  labelOfAndCenters: {
    label: 'Label of AND Centers',
    type: 'text',
  },
  labelOfOrCenters: {
    label: 'Label of OR Centers',
    type: 'text',
  },

  // Atoms
  carbonExplicitly: {
    label: 'Show Carbon Explicitly',
    type: 'checkbox',
    tooltip: 'Always display carbon atom labels',
  },
  showCharge: {
    label: 'Show Charge',
    type: 'checkbox',
  },
  showHydrogenLabels: {
    label: 'Show Hydrogen Labels',
    type: 'select',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'Hetero', label: 'Heteroatoms' },
      { value: 'Terminal', label: 'Terminal and Hetero' },
      { value: 'on', label: 'On' },
    ],
  },
  showValence: {
    label: 'Show Valence',
    type: 'checkbox',
  },
  aromaticityType: {
    label: 'Aromaticity Type',
    type: 'select',
    options: [
      { value: 'basic', label: 'Basic' },
      { value: 'generic', label: 'Generic' },
    ],
  },

  // Bonds
  aromaticCircle: {
    label: 'Aromatic Circle',
    type: 'checkbox',
    tooltip: 'Show circle inside aromatic rings',
  },
  bondSpacing: {
    label: 'Bond Spacing',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  bondThickness: {
    label: 'Bond Thickness',
    type: 'number',
    min: 0.1,
    max: 96,
    step: 0.1,
  },
  bondLength: {
    label: 'Bond Length',
    type: 'number',
    min: 1,
    max: 100,
    step: 1,
  },
  stereoBondWidth: {
    label: 'Stereo Bond Width',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  doubleBondWidth: {
    label: 'Double Bond Width',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  tripleBondWidth: {
    label: 'Triple Bond Width',
    type: 'number',
    min: 0.1,
    max: 10,
    step: 0.1,
  },

  // Server
  'smart-layout': {
    label: 'Smart Layout',
    type: 'checkbox',
    tooltip: 'Use server-based layout algorithm',
  },
  'ignore-stereochemistry-errors': {
    label: 'Ignore Stereochemistry Errors',
    type: 'checkbox',
  },
  'mass-skip-error-on-pseudoatoms': {
    label: 'Skip Mass Error on Pseudoatoms',
    type: 'checkbox',
  },
  'gross-formula-add-rsites': {
    label: 'Add R-sites to Gross Formula',
    type: 'checkbox',
  },
  gross: {
    label: 'Gross Formula Format',
    type: 'select',
    options: [
      { value: 'formula', label: 'Formula' },
      { value: 'molfile', label: 'Molfile' },
    ],
  },

  // 3D Viewer
  miewMode: {
    label: 'Miew Mode',
    type: 'select',
    options: [
      { value: 'immediate', label: 'Immediate' },
      { value: 'deferred', label: 'Deferred' },
    ],
  },
  miewTheme: {
    label: 'Miew Theme',
    type: 'select',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  miewAtomLabel: {
    label: 'Miew Atom Label',
    type: 'select',
    options: [
      { value: 'serial', label: 'Serial' },
      { value: 'name', label: 'Name' },
      { value: 'element', label: 'Element' },
    ],
  },

  // Debug
  showAtomIds: {
    label: 'Show Atom IDs',
    type: 'checkbox',
  },
  showBondIds: {
    label: 'Show Bond IDs',
    type: 'checkbox',
  },
  showHalfBondIds: {
    label: 'Show Half-Bond IDs',
    type: 'checkbox',
  },
  showLoopIds: {
    label: 'Show Loop IDs',
    type: 'checkbox',
  },
};
```

---

### **Phase 6: Testing & Polish** (4-6 hours)

#### 6.1 Unit Tests

**File:** `src/components/modal/Settings/__tests__/Settings.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

describe('Settings Modal', () => {
  let mockSettingsService: any;
  let store: any;

  beforeEach(() => {
    mockSettingsService = {
      getSettings: jest.fn(() => ({
        rotationStep: 15,
        atomColoring: true,
        // ... other default settings
      })),
      updateSettings: jest.fn(),
      resetToDefaults: jest.fn(),
      exportSettings: jest.fn(() => '{}'),
      importSettings: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    };

    store = configureStore({
      reducer: {
        editor: () => ({
          ketcher: {
            settingsService: mockSettingsService,
          },
        }),
      },
    });
  });

  it('should render settings modal', () => {
    render(
      <Provider store={store}>
        <Settings isModalOpen={true} onClose={jest.fn()} />
      </Provider>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should load settings on mount', () => {
    render(
      <Provider store={store}>
        <Settings isModalOpen={true} onClose={jest.fn()} />
      </Provider>
    );

    expect(mockSettingsService.getSettings).toHaveBeenCalled();
  });

  it('should save settings on apply', async () => {
    render(
      <Provider store={store}>
        <Settings isModalOpen={true} onClose={jest.fn()} />
      </Provider>
    );

    // Change a setting
    // ... fireEvent interactions

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockSettingsService.updateSettings).toHaveBeenCalled();
    });
  });

  // More tests...
});
```

#### 6.2 Integration Tests

Test complete flows:
- Open modal → Change settings → Apply → Verify persistence
- Open modal → Reset → Verify defaults loaded
- Open modal → Import JSON → Verify settings updated
- Open modal → Export JSON → Verify correct format

---

### **Phase 7: Additional Features** (2-3 hours)

#### 7.1 Keyboard Shortcuts

Add to Settings.tsx:

```typescript
useEffect(() => {
  if (!isModalOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && hasChanges) {
      handleApply();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isModalOpen, hasChanges]);
```

#### 7.2 Preset Support (ACS Style)

Add to Settings.tsx:

```typescript
const handleLoadPreset = async (presetName: string) => {
  if (!settingsService) return;

  setIsLoading(true);
  try {
    await settingsService.loadPreset(presetName);
    // Settings automatically updated via subscription
  } catch (error) {
    console.error('Failed to load preset:', error);
  } finally {
    setIsLoading(false);
  }
};

// In footer:
<ActionButton
  label="Set ACS Settings"
  styleType="secondary"
  onClick={() => handleLoadPreset('acs')}
  disabled={isLoading}
/>
```

---

## Technical Considerations

### **1. Settings Visibility and Relevance**

**Design Decision: Show ALL Settings**

All settings from the Settings interface will be displayed in the macromolecules settings dialog, regardless of their current relevance to macromolecules mode.

**Rationale:**
- **Consistency**: Maintains identical settings UX across small molecules and macromolecules modes
- **Single Source of Truth**: SettingsService manages all settings centrally - both modes share the same settings
- **Future-Proofing**: Settings that seem irrelevant now may become relevant as features evolve
- **Simplicity**: No need to maintain separate "relevant settings" lists or conditional logic
- **User Expectation**: Users switching between modes expect to see the same settings
- **No Harm**: Unused settings simply have no effect in macromolecules rendering

**Current Relevance (for reference only - all will be shown):**

**Fully Relevant:**
- General: rotationStep, font, fontsz, resetToSelect
- Display: atomColoring, showValenceWarnings, imageResolution
- Bonds: bondLength, bondThickness, stereoBondWidth

**Potentially Relevant:**
- Stereochemistry: May affect mixed structure rendering
- Atoms: carbonExplicitly, charge display
- Server: If using Indigo service for validation/layout

**Currently Less Relevant:**
- 3D Viewer: Miew settings (macromolecules may have different 3D viewer)
- Debug: Atom/bond IDs (different structure representation)

**Implementation Approach:**
- Use the exact same 7-group structure as small molecules
- Use the exact same field definitions from ketcher-core Settings interface
- No filtering, no hiding, no conditional rendering
- Future macromolecules-specific settings can be added to appropriate groups or as a new group

### **2. Settings Synchronization**

**Challenge:** Macromolecules and small molecules share the same SettingsService instance.

**Solution:**
- Settings are already centralized in SettingsService (flat structure)
- Both modes automatically see updates via subscription system
- No special sync logic needed - it's built-in

**Example Flow:**
1. User changes rotationStep in macromolecules settings
2. SettingsService.updateSettings() is called
3. Settings are validated, persisted to localStorage
4. SettingsService notifies all subscribers
5. Both macromolecules and micromolecules UIs update automatically

### **3. Redux Integration**

**In Small Molecules:**
- Redux state mirrors SettingsService (bidirectional sync)
- Legacy components use Redux
- Modern code uses `useSettings()` hook

**In Macromolecules (Recommended Approach):**
- Don't duplicate settings in Redux
- Access directly via `editor.ketcher.settingsService`
- Keep state local to Settings component
- Let SettingsService handle persistence and validation

**Why?**
- Avoids Redux duplication
- Simpler state management
- SettingsService is the single source of truth
- Follows modern patterns

### **4. Validation and Error Handling**

**SettingsService automatically validates:**
- All updates go through Ajv JSON Schema validation
- Invalid values are rejected with descriptive errors
- No need to implement validation in UI (but can add field-level hints)

**Error Handling Pattern:**
```typescript
const handleApply = async () => {
  try {
    await settingsService.updateSettings(currentSettings);
    onClose();
  } catch (error) {
    if (error.name === 'SettingsValidationError') {
      // Show specific validation errors
      dispatch(openErrorModal({
        errorTitle: 'Invalid Settings',
        errorMessage: error.errors.map(e => e.message).join('\n')
      }));
    } else {
      // Generic error
      dispatch(openErrorModal({
        errorTitle: 'Error',
        errorMessage: 'Failed to save settings'
      }));
    }
  }
};
```

---

## Implementation Checklist

- [ ] **Phase 1: Modal System Integration**
  - [ ] Update `ModalName` type in modalSlice.ts
  - [ ] Create Settings folder structure
  - [ ] Register Settings in modalComponentList
  - [ ] Update ButtonsComponents to dispatch openModal('settings')
  - [ ] Test modal opens/closes correctly

- [ ] **Phase 2: Settings Component**
  - [ ] Create Settings.tsx main component
  - [ ] Implement SettingsService integration
  - [ ] Add state management (current/initial settings)
  - [ ] Implement handleApply, handleReset, handleClose
  - [ ] Add Modal wrapper with header/content/footer
  - [ ] Test basic rendering

- [ ] **Phase 3: Accordion Implementation**
  - [ ] Create SettingsAccordion.tsx
  - [ ] Define FIELD_GROUPS structure (7 groups, ALL settings)
  - [ ] Implement expand/collapse logic
  - [ ] Style accordion to match macromolecules theme
  - [ ] Test accordion interactions

- [ ] **Phase 4: Field Rendering**
  - [ ] Create SettingsField.tsx
  - [ ] Implement field type handlers (checkbox, number, select, color, text)
  - [ ] Add field validation hints
  - [ ] Style fields consistently
  - [ ] Test all field types

- [ ] **Phase 5: Field Definitions**
  - [ ] Create fieldGroups.ts
  - [ ] Define ALL ~40-50 settings fields (no filtering)
  - [ ] Add labels, types, options, min/max
  - [ ] Organize into 7 groups
  - [ ] Document field purposes

- [ ] **Phase 6: Testing**
  - [ ] Unit tests for Settings component
  - [ ] Unit tests for SettingsAccordion
  - [ ] Unit tests for SettingsField
  - [ ] Integration tests for modal flow
  - [ ] Test settings persistence
  - [ ] Test validation errors
  - [ ] Test import/export

- [ ] **Phase 7: Additional Features**
  - [ ] Implement import from file
  - [ ] Implement export to file
  - [ ] Add preset support (ACS style, etc.)
  - [ ] Add keyboard shortcuts (ESC, Ctrl+Enter)
  - [ ] Add loading states
  - [ ] Add error handling with modal errors

- [ ] **Phase 8: Polish**
  - [ ] Review all styles
  - [ ] Add tooltips for complex settings
  - [ ] Test keyboard navigation
  - [ ] Test with screen readers (accessibility)
  - [ ] Responsive design for smaller screens
  - [ ] Performance optimization (memoization)

---

## Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Modal system integration | 1-2 hours |
| Phase 2 | Settings component | 4-6 hours |
| Phase 3 | Accordion implementation | 3-4 hours |
| Phase 4 | Field rendering | 4-5 hours |
| Phase 5 | Field definitions | 2-3 hours |
| Phase 6 | Testing | 4-6 hours |
| Phase 7 | Additional features | 2-3 hours |
| Phase 8 | Polish | 2-3 hours |
| **Total** | | **22-32 hours** (~3-4 days) |

---

## Success Criteria

- ✅ Settings modal opens from toolbar button
- ✅ ALL 7 groups render with ALL fields (no filtering)
- ✅ Changes are tracked and "Apply" button enables/disables
- ✅ Settings persist across sessions (via SettingsService)
- ✅ Import/export functionality works
- ✅ Reset to defaults works
- ✅ ACS preset works
- ✅ Validation errors shown clearly
- ✅ Keyboard shortcuts work (ESC/Enter)
- ✅ UI matches macromolecules design language
- ✅ Unit and integration tests pass
- ✅ No console errors or warnings
- ✅ Settings are shared between small molecules and macromolecules modes

---

## Key Design Principles

1. **Show Everything** - No hiding of settings based on relevance
2. **Consistency First** - Match small molecules UX exactly
3. **Single Source of Truth** - SettingsService manages all state
4. **No Redux Duplication** - Access SettingsService directly
5. **Automatic Sync** - Subscription system handles updates
6. **Validation at Service** - Let SettingsService validate
7. **MUI Components** - Use Material-UI for native macromolecules look
8. **Accessibility** - Keyboard nav, ARIA labels, screen reader support

---

**Last Updated:** 2026-03-07
**Status:** Ready for Implementation
