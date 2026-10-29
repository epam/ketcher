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

/**
 * Enumerates discrete pieces of Ketcher functionality that can be turned off
 * by host applications via the `disabledFunctionality` configuration option
 * passed to the `Editor` component.
 *
 * A given functionality can potentially be triggered from several UI entry
 * points (context menu item, toolbar button, keyboard shortcut, etc). Each of
 * those entry points is expected to consult
 * `Ketcher.isFunctionalityDisabled(functionality)` and hide/disable itself
 * accordingly, so disabling a functionality here has effect everywhere it is
 * exposed.
 *
 * Extend this enum when adding support for disabling additional features.
 */
export enum KetcherFunctionality {
  ExpandMonomers = 'expandMonomers',
}

/**
 * List of functionality names to disable across all of their UI entry
 * points. Passed to the `Editor` component (or directly to `Ketcher`) as
 * `disabledFunctionality`.
 */
export type DisabledFunctionalityConfig = KetcherFunctionality[];
