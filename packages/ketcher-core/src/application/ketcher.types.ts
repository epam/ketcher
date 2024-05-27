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
