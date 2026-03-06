/**
 * Settings type definitions for Ketcher
 */

/**
 * Editor-specific settings
 */
export interface EditorSettings {
  resetToSelect: boolean | 'paste';
  rotationStep: number;
}

/**
 * Rendering settings for atoms, bonds, fonts, colors, stereochemistry
 */
export interface RenderSettings {
  // General render settings
  showValenceWarnings: boolean;
  atomColoring: boolean;
  font: string;
  fontsz: number;
  fontszUnit: 'px' | 'pt';
  fontszsub: number;

  // Stereochemistry
  showStereoFlags: boolean;
  stereoLabelStyle: 'classic' | 'IUPAC' | 'On-Atoms';
  colorOfAbsoluteCenters: string;
  colorOfAndCenters: string;
  colorOfOrCenters: string;
  colorStereogenicCenters: string;
  autoFadeOfStereoLabels: boolean;
  absFlagLabel: string;
  andFlagLabel: string;
  orFlagLabel: string;
  mixedFlagLabel: string;
  ignoreChiralFlag: boolean;

  // Atoms
  carbonExplicitly: boolean;
  showCharge: boolean;
  showValence: boolean;
  showHydrogenLabels:
    | 'off'
    | 'Hetero'
    | 'Terminal'
    | 'Terminal and Hetero'
    | 'On';

  // Bonds
  aromaticCircle: boolean;
  bondSpacing: number;
  bondLength: number;
  bondLengthUnit: 'px' | 'cm' | 'pt' | 'inch';
  bondThickness: number;
  bondThicknessUnit: 'px' | 'cm' | 'pt' | 'inch';
  stereoBondWidth: number;
  stereoBondWidthUnit: 'px' | 'cm' | 'pt' | 'inch';
  hashSpacing: number;
  hashSpacingUnit: 'px' | 'cm' | 'pt' | 'inch';

  // Image resolution
  imageResolution: number;

  // Reaction
  reactionComponentMarginSize: number;
}

/**
 * Server-side processing settings
 */
export interface ServerSettings {
  'smart-layout': boolean;
  'ignore-stereochemistry-errors': boolean;
  'mass-skip-error-on-pseudoatoms': boolean;
  'gross-formula-add-rsites': boolean;
  'aromatize-skip-superatoms': boolean;
  'dearomatize-on-load': boolean;
  'gross-formula-add-isotopes': boolean;
}

/**
 * Debug/developer settings
 */
export interface DebugSettings {
  showAtomIds: boolean;
  showBondIds: boolean;
  showHalfBondIds: boolean;
  showLoopIds: boolean;
}

/**
 * Miew 3D viewer settings
 */
export interface MiewSettings {
  miewMode: string;
  miewTheme: string;
  miewAtomLabel: string;
}

/**
 * Macromolecules editor settings
 */
export interface MacromoleculesSettings {
  selectionTool: string;
  editorLineLength: Record<string, number>;
  disableCustomQuery: boolean;
  monomerLibraryUpdates: string[];
  ignoreChiralFlag: boolean;
}

/**
 * Complete settings structure organized by category
 */
export interface Settings {
  readonly editor: EditorSettings;
  readonly render: RenderSettings;
  readonly server: ServerSettings;
  readonly debug: DebugSettings;
  readonly miew: MiewSettings;
  readonly macromolecules: MacromoleculesSettings;
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
 * Deep partial type helper
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

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
