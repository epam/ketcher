import type { SettingsFormValue } from 'ketcher-core';
import type { FileContent } from '../../component/view/openButton.types';

export type CheckOption =
  | 'valence'
  | 'radicals'
  | 'isotopes'
  | 'pseudoatoms'
  | 'stereo'
  | 'query'
  | 'overlapping_atoms'
  | 'overlapping_bonds'
  | 'rgroups'
  | 'chiral'
  | '3d'
  | 'chiral_flag';

export type RecognizeImageFile = File | FileContent | null;

export type AnalyseRoundName = 'roundWeight' | 'roundMass' | 'roundElAnalysis';

export interface AnalyseValues {
  gross?: string;
  'molecular-weight'?: number;
  'monoisotopic-mass'?: number;
  'mass-composition'?: string;
  [key: string]: string | number | undefined;
}

export interface AnalyseState {
  values: AnalyseValues | null;
  loading: boolean;
  roundWeight: number | string;
  roundMass: number | string;
  roundElAnalysis: number | string;
}

export interface OptionsAppState {
  server: boolean;
  templates: boolean;
  functionalGroups: boolean;
  saltsAndSolvents: boolean;
  buildDate: string;
  version: string;
  imagoVersions: string[];
  indigoVersion?: string;
  indigoMachine?: string;
  errorMessage?: string;
}

export interface OptionsCheckState {
  checkOptions: CheckOption[];
  [key: string]: unknown;
}

export interface OptionsRecognizeState {
  file: RecognizeImageFile;
  structStr: string | Promise<unknown> | null;
  fragment: boolean;
  version: string | null;
}

export interface ServerSettings {
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface OptionsState {
  app: OptionsAppState;
  analyse: AnalyseState;
  check: OptionsCheckState;
  recognize: OptionsRecognizeState;
  settings: SettingsFormValue;
  buttons?: Record<string, unknown>;
  customButtons?: unknown;
  getSettings: () => void;
  getServerSettings: () => ServerSettings;
}

export type RecognizeActionType =
  | 'SET_RECOGNIZE_STRUCT'
  | 'CHANGE_RECOGNIZE_FILE'
  | 'CHANGE_IMAGO_VERSION'
  | 'IS_FRAGMENT_RECOGNIZE';

export type OptionsAction =
  | { type: 'APP_OPTIONS'; data: Partial<OptionsAppState> }
  | { type: 'SAVE_SETTINGS'; data: SettingsFormValue }
  | { type: 'SYNC_SETTINGS_FROM_CORE'; data: SettingsFormValue }
  | { type: 'SAVE_CHECK_OPTS'; data: OptionsCheckState }
  | { type: 'CHANGE_ANALYSE'; data: Partial<AnalyseState> }
  | { type: 'ANALYSE_LOADING' }
  | {
      type: RecognizeActionType;
      data: Partial<OptionsRecognizeState>;
    };
