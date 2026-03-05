/**
 * Settings schema with defaults, validation schema, and presets
 * Migrated from ketcher-react options-schema.ts
 */

import type {
  Settings,
  EditorSettings,
  RenderSettings,
  ServerSettings,
  DebugSettings,
  MiewSettings,
  MacromoleculesSettings,
  DeepPartial,
} from './types';

/**
 * Editor settings defaults
 */
export const EDITOR_DEFAULTS: EditorSettings = {
  resetToSelect: 'paste', // true, 'paste', or false
  rotationStep: 15, // degrees
};

/**
 * Render settings defaults
 */
export const RENDER_DEFAULTS: RenderSettings = {
  // General
  showValenceWarnings: true,
  atomColoring: true,
  font: '30px Arial',
  fontsz: 13,
  fontszUnit: 'px',
  fontszsub: 13,

  // Stereochemistry
  showStereoFlags: true,
  stereoLabelStyle: 'IUPAC', // 'IUPAC', 'classic', 'On-Atoms'
  colorOfAbsoluteCenters: '#ff0000',
  colorOfAndCenters: '#0000cd',
  colorOfOrCenters: '#228b22',
  colorStereogenicCenters: 'LabelsOnly', // 'LabelsOnly', 'BondsOnly', 'LabelsAndBonds', 'Off'
  autoFadeOfStereoLabels: true,
  absFlagLabel: 'ABS',
  andFlagLabel: 'AND Enantiomer',
  orFlagLabel: 'OR Enantiomer',
  mixedFlagLabel: 'Mixed',
  ignoreChiralFlag: false,

  // Atoms
  carbonExplicitly: false,
  showCharge: true,
  showValence: true,
  showHydrogenLabels: 'Terminal and Hetero', // 'off', 'Hetero', 'Terminal', 'Terminal and Hetero', 'On'

  // Bonds
  aromaticCircle: true,
  bondSpacing: 15,
  bondLength: 40,
  bondLengthUnit: 'px',
  bondThickness: 1.2,
  bondThicknessUnit: 'px',
  stereoBondWidth: 6,
  stereoBondWidthUnit: 'px',
  hashSpacing: 1.2,
  hashSpacingUnit: 'px',

  // Image resolution
  imageResolution: 72, // 72 or 600

  // Reaction
  reactionComponentMarginSize: 20,
};

/**
 * Server settings defaults
 */
export const SERVER_DEFAULTS: ServerSettings = {
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'gross-formula-add-isotopes': true,
};

/**
 * Debug settings defaults
 */
export const DEBUG_DEFAULTS: DebugSettings = {
  showAtomIds: false,
  showBondIds: false,
  showHalfBondIds: false,
  showLoopIds: false,
};

/**
 * Miew 3D viewer settings defaults
 */
export const MIEW_DEFAULTS: MiewSettings = {
  miewMode: 'LN', // 'LN', 'BS', 'LC'
  miewTheme: 'light', // 'light', 'dark'
  miewAtomLabel: 'bright', // 'no', 'bright', 'blackAndWhite', 'black'
};

/**
 * Macromolecules editor settings defaults
 */
export const MACROMOLECULES_DEFAULTS: MacromoleculesSettings = {
  selectionTool: 'lasso',
  editorLineLength: {
    'sequence-layout-mode': 30,
    'snake-layout-mode': 0,
  },
  disableCustomQuery: false,
  monomerLibraryUpdates: [],
  ignoreChiralFlag: false,
};

/**
 * Complete default settings
 */
export function getDefaultSettings(): Settings {
  return {
    editor: { ...EDITOR_DEFAULTS },
    render: { ...RENDER_DEFAULTS },
    server: { ...SERVER_DEFAULTS },
    debug: { ...DEBUG_DEFAULTS },
    miew: { ...MIEW_DEFAULTS },
    macromolecules: { ...MACROMOLECULES_DEFAULTS },
  };
}

/**
 * Settings presets
 */
export const PRESETS: Record<string, DeepPartial<Settings>> = {
  /**
   * American Chemical Society (ACS) style preset
   * Based on ACS guidelines for chemical structure drawings
   */
  acs: {
    render: {
      atomColoring: false,
      font: '30px Arial',
      fontsz: 10,
      fontszUnit: 'pt',
      fontszsub: 10,
      bondLength: 14.4,
      bondLengthUnit: 'pt',
      bondSpacing: 18,
      bondThickness: 0.6,
      bondThicknessUnit: 'pt',
      stereoBondWidth: 2,
      stereoBondWidthUnit: 'pt',
      hashSpacing: 2.5,
      hashSpacingUnit: 'pt',
      reactionComponentMarginSize: 1.6,
      imageResolution: 600,
    },
  },
};

/**
 * JSON Schema for validation with Ajv
 * This is used by SchemaValidator
 */
export const SCHEMA = {
  title: 'Settings',
  type: 'object',
  properties: {
    editor: {
      type: 'object',
      properties: {
        resetToSelect: {
          enum: [true, 'paste', false],
        },
        rotationStep: {
          type: 'integer',
          minimum: 1,
          maximum: 90,
        },
      },
    },
    render: {
      type: 'object',
      properties: {
        showValenceWarnings: { type: 'boolean' },
        atomColoring: { type: 'boolean' },
        font: { type: 'string' },
        fontsz: { type: 'number', minimum: 0.1, maximum: 96 },
        fontszUnit: { enum: ['px', 'pt', 'cm', 'inch'] },
        fontszsub: { type: 'number', minimum: 0.1, maximum: 96 },
        showStereoFlags: { type: 'boolean' },
        stereoLabelStyle: { enum: ['IUPAC', 'classic', 'On-Atoms', 'off'] },
        colorOfAbsoluteCenters: { type: 'string' },
        colorOfAndCenters: { type: 'string' },
        colorOfOrCenters: { type: 'string' },
        colorStereogenicCenters: {
          enum: ['LabelsOnly', 'BondsOnly', 'LabelsAndBonds', 'Off'],
        },
        autoFadeOfStereoLabels: { type: 'boolean' },
        absFlagLabel: { type: 'string' },
        andFlagLabel: { type: 'string' },
        orFlagLabel: { type: 'string' },
        mixedFlagLabel: { type: 'string' },
        ignoreChiralFlag: { type: 'boolean' },
        carbonExplicitly: { type: 'boolean' },
        showCharge: { type: 'boolean' },
        showValence: { type: 'boolean' },
        showHydrogenLabels: {
          enum: ['off', 'Hetero', 'Terminal', 'Terminal and Hetero', 'On'],
        },
        aromaticCircle: { type: 'boolean' },
        bondSpacing: { type: 'integer', minimum: 1, maximum: 100 },
        bondLength: { type: 'number', minimum: 0.1, maximum: 1000 },
        bondLengthUnit: { enum: ['px', 'pt', 'cm', 'inch'] },
        bondThickness: { type: 'number', minimum: 0.1, maximum: 96 },
        bondThicknessUnit: { enum: ['px', 'pt', 'cm', 'inch'] },
        stereoBondWidth: { type: 'number', minimum: 0.1, maximum: 96 },
        stereoBondWidthUnit: { enum: ['px', 'pt', 'cm', 'inch'] },
        hashSpacing: { type: 'number', minimum: 0.1, maximum: 1000 },
        hashSpacingUnit: { enum: ['px', 'pt', 'cm', 'inch'] },
        imageResolution: { type: 'number' },
        reactionComponentMarginSize: {
          type: 'number',
          minimum: 0.1,
          maximum: 1000,
        },
      },
    },
    server: {
      type: 'object',
      properties: {
        'smart-layout': { type: 'boolean' },
        'ignore-stereochemistry-errors': { type: 'boolean' },
        'mass-skip-error-on-pseudoatoms': { type: 'boolean' },
        'gross-formula-add-rsites': { type: 'boolean' },
        'aromatize-skip-superatoms': { type: 'boolean' },
        'dearomatize-on-load': { type: 'boolean' },
        'gross-formula-add-isotopes': { type: 'boolean' },
      },
    },
    debug: {
      type: 'object',
      properties: {
        showAtomIds: { type: 'boolean' },
        showBondIds: { type: 'boolean' },
        showHalfBondIds: { type: 'boolean' },
        showLoopIds: { type: 'boolean' },
      },
    },
    miew: {
      type: 'object',
      properties: {
        miewMode: { enum: ['LN', 'BS', 'LC'] },
        miewTheme: { enum: ['light', 'dark'] },
        miewAtomLabel: { enum: ['no', 'bright', 'blackAndWhite', 'black'] },
      },
    },
    macromolecules: {
      type: 'object',
      properties: {
        selectionTool: { type: 'string' },
        editorLineLength: { type: 'object' },
        disableCustomQuery: { type: 'boolean' },
        monomerLibraryUpdates: { type: 'array', items: { type: 'string' } },
        ignoreChiralFlag: { type: 'boolean' },
      },
    },
  },
};
