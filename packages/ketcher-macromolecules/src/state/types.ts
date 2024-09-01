export enum PreviewType {
  Monomer = 'monomer',
  Preset = 'preset',
  Bond = 'bond',
  AmbiguousMonomer = 'ambiguousMonomer',
}

export interface PreviewStyle {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly transform?: string;
}
