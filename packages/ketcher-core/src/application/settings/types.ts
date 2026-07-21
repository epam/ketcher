/**
 * Settings type definitions for Ketcher
 */

import type { DeepPartial } from 'types';

export type { DeepPartial };

export type CssLengthUnit = 'px' | 'pt' | 'cm' | 'inch';

/**
 * Complete settings structure in flat format
 */
export interface Settings {
  // Editor settings
  readonly resetToSelect: boolean | 'paste';
  readonly rotationStep: number;

  // General render settings
  readonly showValenceWarnings: boolean;
  readonly atomColoring: boolean;
  readonly font: string;
  readonly fontsz: number;
  readonly fontszUnit: CssLengthUnit;
  readonly fontszsub: number;
  readonly fontszsubUnit: CssLengthUnit;

  // Stereochemistry
  readonly showStereoFlags: boolean;
  readonly stereoLabelStyle: 'classic' | 'IUPAC' | 'On-Atoms' | 'off';
  readonly colorOfAbsoluteCenters: string;
  readonly colorOfAndCenters: string;
  readonly colorOfOrCenters: string;
  readonly colorStereogenicCenters: string;
  readonly autoFadeOfStereoLabels: boolean;
  readonly absFlagLabel: string;
  readonly andFlagLabel: string;
  readonly orFlagLabel: string;
  readonly mixedFlagLabel: string;
  readonly ignoreChiralFlag: boolean;

  // Atoms
  readonly carbonExplicitly: boolean;
  readonly showCharge: boolean;
  readonly showValence: boolean;
  readonly showHydrogenLabels:
    | 'off'
    | 'Hetero'
    | 'Terminal'
    | 'Terminal and Hetero'
    | 'On';

  // Bonds
  readonly aromaticCircle: boolean;
  readonly bondSpacing: number;
  readonly bondLength: number;
  readonly bondLengthUnit: CssLengthUnit;
  readonly bondThickness: number;
  readonly bondThicknessUnit: CssLengthUnit;
  readonly stereoBondWidth: number;
  readonly stereoBondWidthUnit: CssLengthUnit;
  readonly hashSpacing: number;
  readonly hashSpacingUnit: CssLengthUnit;

  // Image resolution
  readonly imageResolution: number;

  // Reaction
  readonly reactionComponentMarginSize: number;
  readonly reactionComponentMarginSizeUnit: CssLengthUnit;

  // Server-side processing settings
  readonly 'smart-layout': boolean;
  readonly 'ignore-stereochemistry-errors': boolean;
  readonly 'mass-skip-error-on-pseudoatoms': boolean;
  readonly 'gross-formula-add-rsites': boolean;
  readonly 'aromatize-skip-superatoms': boolean;
  readonly 'dearomatize-on-load': boolean;
  readonly 'gross-formula-add-isotopes': boolean;
  readonly 'valence-mode': 'biovia-2009' | 'biovia-2017' | 'default';

  // Debug/developer settings
  readonly showAtomIds: boolean;
  readonly showBondIds: boolean;
  readonly showHalfBondIds: boolean;
  readonly showLoopIds: boolean;

  // Miew 3D viewer settings
  readonly miewMode: string;
  readonly miewTheme: string;
  readonly miewAtomLabel: string;

  // Macromolecules editor settings
  readonly selectionTool: string;
  readonly editorLineLength: Record<string, number>;
  readonly disableCustomQuery: boolean;
  readonly monomerLibraryUpdates: string[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Storage abstraction interface
 */
export interface ISettingsStorage {
  load(key: string): Promise<Partial<Settings> | null>;
  save(key: string, settings: Settings): Promise<void>;
  clear(key: string): Promise<void>;
  isAvailable(): boolean;
}

/**
 * Validator abstraction interface
 */
export interface ISettingsValidator {
  validate(settings: unknown): ValidationResult;
  validatePartial(partial: unknown): ValidationResult;
}

/**
 * Options for configuring SettingsService
 */
export interface SettingsServiceOptions {
  storage?: ISettingsStorage;
  validator?: ISettingsValidator;
  defaults?: DeepPartial<Settings>;
  storageKey?: string;
  autoSave?: boolean;
  migrateOnLoad?: boolean;
}

/**
 * Settings change listener callback
 */
export type SettingsListener = (settings: Settings) => void;

/**
 * Unsubscribe function returned by subscribe
 */
export type Unsubscribe = () => void;

/**
 * Custom error for settings validation failures
 */
export class SettingsValidationError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super(
      `Settings validation failed: ${errors.map((e) => e.message).join(', ')}`,
    );
    this.name = 'SettingsValidationError';
  }
}
