import { RxnArrowMode, Vec2 } from 'domain/entities'
import { StereLabelStyleType } from 'application/render/restruct'

type RenderOptionStyles = Record<string, string | number>

export type RenderOptions = {
  width?: number
  height?: number

  rotationStep?: number
  doubleBondWidth: number
  stereoBondWidth: number
  bondThickness: number

  downScale?: boolean
  rescaleAmount?: number
  radiusScaleFactor: number

  'dearomatize-on-load'?: boolean
  ignoreChiralFlag?: boolean
  disableQueryElements?: string[] | null

  showAtomIds: boolean
  showBondIds: boolean
  showHalfBondIds: boolean
  showLoopIds: boolean
  showValenceWarnings: boolean
  autoScale: boolean
  autoScaleMargin: number
  maxBondLength: number
  atomColoring: boolean
  hideImplicitHydrogen: boolean
  hideTerminalLabels: boolean
  carbonExplicitly: boolean
  showCharge: boolean
  showHydrogenLabels: string
  showValence: boolean
  aromaticCircle: boolean
  scale: number
  zoom: number
  offset: Vec2
  lineWidth: number

  bondSpace: number
  stereoBond: number
  subFontSize: number
  font: string
  fontsz: number
  fontszsub: number
  fontRLabel: number
  fontRLogic: number

  /* styles */
  // TODO check style properties types, how they work with numbers
  lineattr: RenderOptionStyles
  selectionStyle: RenderOptionStyles
  hoverStyle: RenderOptionStyles
  sgroupBracketStyle: RenderOptionStyles
  lassoStyle: RenderOptionStyles
  hoverStyleSimpleObject: RenderOptionStyles
  atomSelectionPlateRadius: number
  contractedFunctionalGroupSize: number

  stereoLabelStyle?: StereLabelStyleType
}

export interface RelativeBox {
  x: number
  y: number
  width: number
  height: number
}

// TODO check types if it's compatible with RxnArrowAttributes
export interface ArrowItem {
  mode?: RxnArrowMode
  pos: Vec2[]
  height: number
}
