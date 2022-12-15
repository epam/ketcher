import { Vec2 } from 'domain/entities'

export type RenderOptions = {
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
  lineattr: Record<string, string>
  /* eslint-enable quote-props */
  selectionStyle: Record<string, string>
  hoverStyle: Record<string, string>
  sgroupBracketStyle: Record<string, string>
  lassoStyle: Record<string, string>
  hoverStyleSimpleObject: Record<string, string>
  atomSelectionPlateRadius: number
  contractedFunctionalGroupSize: number
}

// ketcher.setSettings('{"showAtomIds":true,"showBondIds":true,"showHalfBondIds":false}')
