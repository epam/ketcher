import type { Api } from '../../../../../../api';
import type {
  FormatterFactoryOptions,
  GenerateImageOptions,
  OutputFormatType,
  Struct,
} from 'ketcher-core';

/**
 * Save dialog receives the same async API instance that is stored in the app:
 * a StructService with Promise-like info loading behavior created by `createApi`.
 */
export type SaveServer = Api;
/**
 * Save dialog reuses regular formatter/server export options and augments them
 * with image-generation options when the selected export format is png/svg.
 */
export type SaveServerSettings = FormatterFactoryOptions &
  Partial<GenerateImageOptions>;
/**
 * Server-side structure validation option keys requested before saving.
 */
export type SaveCheckOptions = string[];

export interface SaveFormState {
  result: {
    filename: string;
    format: string;
  };
  valid: boolean;
  errors: Record<string, string>;
  moleculeErrors?: Record<string, string>;
}

export interface SaveCheckState {
  checkOptions: SaveCheckOptions;
}

export interface SaveEditor {
  selection: () => { atoms?: number[] } | null;
  errorHandler: (message: string) => void;
  struct: () => Struct;
  render: {
    options: {
      ignoreChiralFlag: boolean;
    };
  };
}

export interface SaveDialogState {
  disableControls: boolean;
  imageFormat: OutputFormatType;
  tabIndex: number;
  isLoading: boolean;
  structStr?: string;
  imageSrc?: string;
}

export interface SaveDialogOwnProps {
  onOk: (result?: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export interface SaveDialogProps extends SaveDialogOwnProps {
  server: SaveServer | null;
  struct: Struct;
  options: SaveServerSettings;
  formState: SaveFormState;
  moleculeErrors?: Record<string, string>;
  checkState: SaveCheckState;
  bondThickness?: number;
  ignoreChiralFlag: boolean;
  editor: SaveEditor;
  onCheck: (checkOptions: SaveCheckOptions) => void;
  onTmplSave: (struct: Struct) => void;
  onResetForm: (prevState: SaveFormState) => void;
}

export interface SaveAppState {
  options: {
    app: {
      server?: boolean;
    };
    getServerSettings: () => SaveServerSettings;
    check: SaveCheckState;
    settings: {
      bondThickness?: number;
    };
  };
  server: SaveServer;
  editor: SaveEditor;
  modal: {
    form: SaveFormState;
  };
}
