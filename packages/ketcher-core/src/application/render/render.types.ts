import { RxnArrowMode, Vec2 } from 'domain/entities';
import { StereLabelStyleType } from 'application/render/restruct';

type RenderOptionStyles = Record<string, string | number>;

export enum MeasurementUnits {
  Px = 'px',
  Cm = 'cm',
  Pt = 'pt',
  Inch = 'inch',
}

export enum UsageInMacromolecule {
  MonomerConnectionsModal,
  MonomerPreview,
  BondPreview,
}

export type RenderOptions = {
  width?: number;
  height?: number;

  rotationStep?: number;
  doubleBondWidth: number;
  doubleBondWidthUnit: MeasurementUnits;
  stereoBondWidth: number;
  stereoBondWidthUnit: MeasurementUnits;
  bondThickness: number;
  bondThicknessUnit: MeasurementUnits;

  downScale?: boolean;
  rescaleAmount?: number;
  radiusScaleFactor: number;

  'dearomatize-on-load'?: boolean;
  ignoreChiralFlag?: boolean;
  disableQueryElements?: string[] | null;

  showAtomIds: boolean;
  showBondIds: boolean;
  showHalfBondIds: boolean;
  showLoopIds: boolean;
  showValenceWarnings: boolean;
  autoScale: boolean;
  autoScaleMargin: number;
  maxBondLength: number;
  atomColoring: boolean;
  hideImplicitHydrogen: boolean;
  hideTerminalLabels: boolean;
  carbonExplicitly: boolean;
  showCharge: boolean;
  showHydrogenLabels: string;
  showValence: boolean;
  aromaticCircle: boolean;
  microModeScale: number;
  macroModeScale: number;
  zoom: number;
  offset: Vec2;
  lineWidth: number;

  bondSpace: number;
  stereoBond: number;
  subFontSize: number;
  font: string;
  fontsz: number;
  fontszUnit: MeasurementUnits;
  fontszsubUnit: MeasurementUnits;
  fontszsub: number;
  fontRLabel: number;
  fontRLogic: number;

  /* styles */
  lineattr: RenderOptionStyles;
  arrowSnappingStyle: RenderOptionStyles;
  bondSnappingStyle: RenderOptionStyles;
  selectionStyle: RenderOptionStyles;
  hoverStyle: RenderOptionStyles;
  movingStyle: RenderOptionStyles;
  sgroupBracketStyle: RenderOptionStyles;
  lassoStyle: RenderOptionStyles;
  selectionStyleSimpleObject: RenderOptionStyles;
  hoverStyleSimpleObject: RenderOptionStyles;
  atomSelectionPlateRadius: number;
  contractedFunctionalGroupSize: number;

  stereoLabelStyle?: StereLabelStyleType;

  previewOpacity: number;

  connectedMonomerAttachmentPoints?: string[];
  currentlySelectedMonomerAttachmentPoint?: string;
  labelInMonomerConnectionsModal?: boolean;
  labelInPreview?: boolean;

  // Converted
  fontszInPx: number;
  fontszsubInPx: number;
  doubleBondWidthInPx: number;
  bondThicknessInPx: number;
  stereoBondWidthInPx: number;
  usageInMacromolecule?: UsageInMacromolecule;
};

export interface RelativeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArrowItem {
  mode?: RxnArrowMode;
  pos: Vec2[];
  height: number;
}

export type ViewBox = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};
