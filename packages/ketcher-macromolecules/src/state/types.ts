import {
  AmbiguousMonomerType,
  AttachmentPointsToBonds,
  IKetIdtAliases,
  MonomerItemType,
  PolymerBond,
} from 'ketcher-core';

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

interface BasePreviewState {
  readonly type: PreviewType;
  readonly style?: PreviewStyle;
}

export interface MonomerPreviewState extends BasePreviewState {
  readonly type: PreviewType.Monomer;
  readonly monomer: MonomerItemType | undefined;
  readonly attachmentPointsToBonds?: AttachmentPointsToBonds;
}

export enum PresetPosition {
  Library = 'library',
  ChainStart = 'chainStart',
  ChainMiddle = 'chainMiddle',
  ChainEnd = 'chainEnd',
}

export interface PresetPreviewState extends BasePreviewState {
  readonly type: PreviewType.Preset;
  readonly monomers: ReadonlyArray<MonomerItemType | undefined>;
  readonly position: PresetPosition;
  readonly name?: string;
  readonly idtAliases?: IKetIdtAliases;
}

export interface BondPreviewState extends BasePreviewState {
  readonly type: PreviewType.Bond;
  readonly polymerBond: PolymerBond;
}

export interface AmbiguousMonomerPreviewState extends BasePreviewState {
  readonly type: PreviewType.AmbiguousMonomer;
  readonly monomer: AmbiguousMonomerType;
  readonly presetMonomers?: ReadonlyArray<MonomerItemType | undefined>;
}

export type EditorStatePreview =
  | MonomerPreviewState
  | PresetPreviewState
  | BondPreviewState
  | AmbiguousMonomerPreviewState;
