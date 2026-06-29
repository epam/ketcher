/**
 * Helpers for normalizing settings between SettingsService format and UI form
 * formats used by Ketcher packages.
 */

import type { Settings } from './types';

export type SettingsFormValue = Partial<
  Omit<Settings, 'imageResolution' | 'stereoLabelStyle' | 'showHydrogenLabels'>
> & {
  readonly imageResolution?: Settings['imageResolution'] | string;
  readonly stereoLabelStyle?:
    | Settings['stereoLabelStyle']
    | 'Iupac'
    | 'Classic'
    | 'On'
    | 'Off';
  readonly showHydrogenLabels?: Settings['showHydrogenLabels'] | 'all';
  readonly init?: unknown;
};

export interface NormalizeSettingsFromCoreOptions {
  readonly removeCoreOnlyFields?: boolean;
}

const CORE_ONLY_SETTING_FIELDS = [
  'selectionTool',
  'editorLineLength',
  'disableCustomQuery',
  'monomerLibraryUpdates',
] as const;

function ensureFontSizePrefix(font?: string): string | undefined {
  return font && !font.match(/^\d+px\s/) ? `30px ${font}` : font;
}

function normalizeStereoLabelStyleForCore(
  stereoLabelStyle: SettingsFormValue['stereoLabelStyle'],
): Settings['stereoLabelStyle'] | undefined {
  if (!stereoLabelStyle) {
    return undefined;
  }

  const style = stereoLabelStyle.toLowerCase();
  if (style === 'iupac') {
    return 'IUPAC';
  }

  if (style === 'classic') {
    return 'classic';
  }

  if (style === 'on' || style === 'on-atoms') {
    return 'On-Atoms';
  }

  if (style === 'off') {
    return 'off';
  }

  return undefined;
}

function normalizeStereoLabelStyleForForm(
  stereoLabelStyle: Settings['stereoLabelStyle'] | undefined,
): SettingsFormValue['stereoLabelStyle'] | undefined {
  if (stereoLabelStyle === 'IUPAC') {
    return 'Iupac';
  }

  if (stereoLabelStyle === 'classic') {
    return 'Classic';
  }

  if (stereoLabelStyle === 'On-Atoms') {
    return 'On';
  }

  if (stereoLabelStyle === 'off') {
    return 'Off';
  }

  return stereoLabelStyle;
}

/**
 * Normalize settings collected from UI forms or legacy Redux state to the
 * canonical SettingsService format validated by ketcher-core.
 */
export function normalizeSettingsForCore(
  settings: SettingsFormValue,
): Partial<Settings> {
  const transformed = { ...settings } as Record<string, unknown>;

  delete transformed.init;

  const normalizedStereoLabelStyle = normalizeStereoLabelStyleForCore(
    settings.stereoLabelStyle,
  );
  if (normalizedStereoLabelStyle) {
    transformed.stereoLabelStyle = normalizedStereoLabelStyle;
  }

  const normalizedFont = ensureFontSizePrefix(settings.font);
  if (normalizedFont) {
    transformed.font = normalizedFont;
  }

  if (typeof settings.imageResolution === 'string') {
    transformed.imageResolution = parseInt(settings.imageResolution, 10);
  }

  if (settings.showHydrogenLabels === 'all') {
    transformed.showHydrogenLabels = 'On';
  }

  return transformed as Partial<Settings>;
}

/**
 * Normalize SettingsService values for UI controls that still use legacy form
 * enum/string values.
 */
export function normalizeSettingsForForm(
  settings: Partial<Settings>,
  options: NormalizeSettingsFromCoreOptions = {},
): SettingsFormValue {
  const transformed = { ...settings } as Record<string, unknown>;

  const normalizedStereoLabelStyle = normalizeStereoLabelStyleForForm(
    settings.stereoLabelStyle,
  );
  if (normalizedStereoLabelStyle) {
    transformed.stereoLabelStyle = normalizedStereoLabelStyle;
  }

  const normalizedFont = ensureFontSizePrefix(settings.font);
  if (normalizedFont) {
    transformed.font = normalizedFont;
  }

  if (typeof settings.imageResolution === 'number') {
    transformed.imageResolution = settings.imageResolution.toString();
  }

  if (options.removeCoreOnlyFields) {
    CORE_ONLY_SETTING_FIELDS.forEach((field) => {
      delete transformed[field];
    });
  }

  return transformed as SettingsFormValue;
}
