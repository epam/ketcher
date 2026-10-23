import type { RenderOptions } from './render';

// Types for 'setMode'
export enum ModeTypes {
  flex = 'flex-layout-mode',
  snake = 'snake-layout-mode',
  sequence = 'sequence-layout-mode',
}
export type SupportedModes = keyof typeof ModeTypes;

// Types for 'exportImage'
export enum BlobTypes {
  svg = 'image/svg+xml',
}
export type SupportedImageFormats = keyof typeof BlobTypes;
export type ExportImageParams = {
  margin?: number;
};

export type UpdateMonomersLibraryParams = {
  format: 'ket' | 'sdf';
  shouldPersist?: boolean;
  needDispatchLibraryUpdateEvent?: boolean;
};

type PublicApiSettingsValueMap = {
  'general.dearomatize-on-load': RenderOptions['dearomatize-on-load'];
  ignoreChiralFlag: RenderOptions['ignoreChiralFlag'];
  disableQueryElements: RenderOptions['disableQueryElements'];
  bondThickness: RenderOptions['bondThickness'];
};

export type KetcherApiSettings = Partial<{
  [Key in keyof PublicApiSettingsValueMap]: PublicApiSettingsValueMap[Key];
}> & {
  disableCustomQuery?: boolean;
  persistMonomerLibraryUpdates?: boolean;
};
