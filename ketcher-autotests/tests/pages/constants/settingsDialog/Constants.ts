export enum SettingsSection {
  General = 'General-accordion',
  Stereochemistry = 'Stereochemistry-accordion',
  Atoms = 'Atoms-accordion',
  Bonds = 'Bonds-accordion',
  Server = 'Server-accordion',
  ThreeDViewer = '3D Viewer-accordion',
  OptionsForDebugging = 'Options for Debugging-accordion',
}

// export enum ControlType {
//   Combobox,
//   Editbox,
//   Switcher,
//   Colorpicker,
// }

export enum GeneralSetting {
  ResetToSelectTool = 'reset-to-select',
  RotationStep = 'rotation-step-input-span',
  ShowValenceWarnings = 'show-valence-warnings-input-span',
  AtomColoring = 'atom-coloring-input-span',
  Font = 'font-selection-input-span',
  FontSize = 'Font size-value-input',
  FontSizeUnits = 'Font size-measure-input',
  SubFontSize = 'Sub font size-value-input',
  SubFontSizeUnits = 'Sub font size-measure-input',
  ReactionComponentMarginSize = 'Reaction component margin size-value-input',
  ReactionComponentMarginSizeUnits = 'Reaction component margin size-measure-input',
  ImageResolution = 'image-resolution',
}

export enum StereochemistrySetting {
  ShowTheStereoFlags = 'show-stereo-flags-input-span',
  LabelDisplayAtStereogenicCenters = 'stereo-label-style',
  AbsoluteCenterColor = 'colorOfAbsoluteCenters-color-picker-preview',
  ANDCentersColor = 'colorOfAndCenters-color-picker-preview',
  ORCentersColor = 'colorOfOrCenters-color-picker-preview',
  ColorStereogenicCenters = 'color-stereogenic-centers',
  AutoFadeAndOrCenterLabels = 'auto-fade-of-stereo-labels-input-span',
  TextOfAbsoluteFlag = 'abs-flag-label-input-span',
  TextOfANDFlag = 'and-flag-label-input-span',
  TextOfORFlag = 'or-flag-label-input-span',
  TextOfMixedFlag = 'mixed-flag-label-input-span',
  IgnoreTheChiralFlag = 'ignore-chiral-flag-input-span',
}

export enum AtomsSetting {
  DisplayCarbonExplicitly = 'carbon-explicitly-input-span',
  DisplayCharge = 'show-charge-input-span',
  DisplayValence = 'show-valence-input-span',
  ShowHydrogenLabels = 'show-hydrogen-labels',
}

export enum BondsSetting {
  AromaticBondsAsCircle = 'aromatic-circle-input-span',
  BondLength = 'Bond length-value-input',
  BondLengthUnits = 'Bond length-measure-input',
  BondSpacing = 'bondSpacing-input',
  BondThickness = 'Bond thickness-value-input',
  BondThicknessUnits = 'Bond thickness-measure-input',
  StereoWedgeBondWidth = 'Stereo (Wedge) bond width-value-input',
  StereoWedgeBondWidthUnits = 'Stereo (Wedge) bond width-measure-input',
  HashSpacing = 'Hash spacing-value-input',
  HashSpacingUnits = 'Hash spacing-measure-input',
}

export enum ServerSetting {
  SmartLayout = 'smart-layout-input-span',
  IgnoreStereochemistryErrors = 'ignore-stereochemistry-errors-input-span',
  IgnorePseudoatomsAtMass = 'mass-skip-error-on-pseudoatoms-input-span',
  AddRsitesAtMassCalculation = 'gross-formula-add-rsites-input-span',
  AddIsotopesAtMassCalculation = 'gross-formula-add-isotopes-input-span',
}

export enum ThreeDViewerSetting {
  DisplayMode = 'display-mode-input-span',
  BackgroundColor = 'background-color-input-span',
  LabelColoring = 'label-coloring-input-span',
}

export enum OptionsForDebuggingSetting {
  ShowAtomIds = 'show-atom-ids-input-span',
  ShowBondsIds = 'show-bond-ids-input-span',
  ShowHalfBondsIds = 'show-half-bond-ids-input-span',
  ShowLoopIds = 'show-loop-ids-input-span',
}

// export const optionToSectionMap = new Map<string, SettingsSection>([
//   [GeneralSetting.ResetToSelectTool, SettingsSection.General],
//   [GeneralSetting.RotationStep, SettingsSection.General],
//   [GeneralSetting.ShowValenceWarnings, SettingsSection.General],
//   [GeneralSetting.AtomColoring, SettingsSection.General],
//   [GeneralSetting.Font, SettingsSection.General],
//   [GeneralSetting.FontSize, SettingsSection.General],
//   [GeneralSetting.FontSizeUnits, SettingsSection.General],
//   [GeneralSetting.SubFontSize, SettingsSection.General],
//   [GeneralSetting.SubFontSizeUnits, SettingsSection.General],
//   [GeneralSetting.ReactionComponentMarginSize, SettingsSection.General],
//   [GeneralSetting.ReactionComponentMarginSizeUnits, SettingsSection.General],
//   [GeneralSetting.ImageResolution, SettingsSection.General],
//   [StereochemistrySetting.ShowTheStereoFlagsSettings, Section.Stereochemistry],
//   [
//     StereochemistrySetting.LabelDisplayAtStereogenicCenters,
//     SettingsSection.Stereochemistry,
//   ],
//   [StereochemistrySetting.AbsoluteCenterColor, SettingsSection.Stereochemistry],
//   [StereochemistrySetting.ANDCentersColor, SettingsSection.Stereochemistry],
//   [StereochemistrySetting.ORCentersColor, SettingsSection.Stereochemistry],
//   [
//     StereochemistrySetting.ColorStereogenicCenters,
//     SettingsSection.Stereochemistry,
//   ],
//   [
//     StereochemistrySetting.AutoFadeAndOrCenterLabels,
//     SettingsSection.Stereochemistry,
//   ],
//   [StereochemistrySetting.TextOfAbsoluteFlag, SettingsSection.Stereochemistry],
//   [StereochemistrySetting.TextOfANDFlag, SettingsSection.Stereochemistry],
//   [StereochemistrySetting.TextOfORFlag, SettingsSection.Stereochemistry],
//   [StereochemistrySetting.TextOfMixedFlag, SettingsSection.Stereochemistry],
//   [StereochemistrySetting.IgnoreTheChiralFlag, SettingsSection.Stereochemistry],
//   [AtomsSetting.DisplayCarbonExplicitly, SettingsSection.Atoms],
//   [AtomsSetting.DisplayCharge, SettingsSection.Atoms],
//   [AtomsSetting.DisplayValence, SettingsSection.Atoms],
//   [AtomsSetting.ShowHydrogenLabels, SettingsSection.Atoms],
//   [BondsSetting.AromaticBondsAsCircle, SettingsSection.Bonds],
//   [BondsSetting.BondLength, SettingsSection.Bonds],
//   [BondsSetting.BondLengthUnits, SettingsSection.Bonds],
//   [BondsSetting.BondSpacing, SettingsSection.Bonds],
//   [BondsSetting.BondThickness, SettingsSection.Bonds],
//   [BondsSetting.BondThicknessUnits, SettingsSection.Bonds],
//   [BondsSetting.StereoWedgeBondWidth, SettingsSection.Bonds],
//   [BondsSetting.StereoWedgeBondWidthUnits, SettingsSection.Bonds],
//   [BondsSetting.HashSpacing, SettingsSection.Bonds],
//   [BondsSetting.HashSpacingUnits, SettingsSection.Bonds],
//   [ServerSetting.SmartLayout, SettingsSection.Server],
//   [ServerSetting.IgnoreStereochemistryErrors, SettingsSection.Server],
//   [ServerSetting.IgnorePseudoatomsAtMass, SettingsSection.Server],
//   [ServerSetting.AddRsitesAtMassCalculation, SettingsSection.Server],
//   [ServerSetting.AddIsotopesAtMassCalculation, SettingsSection.Server],
//   [ThreeDViewerSetting.DisplayMode, SettingsSection.ThreeDViewer],
//   [ThreeDViewerSetting.BackgroundColor, SettingsSection.ThreeDViewer],
//   [ThreeDViewerSetting.LabelColoring, SettingsSection.ThreeDViewer],
//   [OptionsForDebuggingSetting.ShowAtomIds, SettingsSection.OptionsForDebugging],
//   [
//     OptionsForDebuggingSetting.ShowBondsIds,
//     SettingsSection.OptionsForDebugging,
//   ],
//   [
//     OptionsForDebuggingSetting.ShowHalfBondsIds,
//     SettingsSection.OptionsForDebugging,
//   ],
//   [OptionsForDebuggingSetting.ShowLoopIds, SettingsSection.OptionsForDebugging],
// ]);

export enum MeasurementUnit {
  Px = 'px',
  Cx = 'cm',
  Pt = 'pt',
  Inch = 'inch',
}

export enum ResetToSelectToolOption {
  On = 'on-option',
  AfterPaste = 'After Paste-option',
  Off = 'off-option',
}

export enum FontOption {
  Arial = 'Arial-option',
  ArialBlack = 'Arial Black-option',
  ComicSansMS = 'Comic Sans MS-option',
  CourierNew = 'Courier New-option',
  Georgia = 'Georgia-option',
  Impact = 'Impact-option',
  LucidaConsole = 'Lucida Console-option',
  PalatinoLinotype = 'Palatino Linotype-option',
  BookAntiqua = 'Book Antiqua-option',
  Verdana = 'Verdana-option',
  Symbol = 'Symbol-option',
  MSSansSerif = 'MS Sans Serif-option',
}

export enum ImageResolutionOption {
  High = 'high-option',
  Low = 'low-option',
}

export enum LabelDisplayAtStereogenicCentersOption {
  IUPACStyle = 'IUPAC style-option',
  Classic = 'Classic-option',
  On = 'On-option',
  Off = 'Off-option',
}

export enum ColorStereogenicCentersOption {
  LabelsOnly = 'Labels Only-option',
  BondsOnly = 'Bonds Only-option',
  LabelsAndBonds = 'Labels And Bonds-option',
  Off = 'Off-option',
}

export enum ShowHydrogenLabelsOption {
  Off = 'Off-option',
  Hetero = 'Hetero-option',
  Terminal = 'Terminal-option',
  TerminalAndHetero = 'Terminal and Hetero-option',
  On = 'On-option',
}

export enum DisplayModeOption {
  Lines = 'Lines-option',
  BallsAndSticks = 'Balls and Sticks-option',
  Licorice = 'Licorice-option',
}

export enum BackgroundColorOption {
  Light = 'Light-option',
  Dark = 'Dark-option',
}

export enum LabelColoringOption {
  No = 'No-option',
  Bright = 'Bright-option',
  BlackAndWhite = 'Black and White-option',
  Black = 'Black-option',
}

// export interface ISettingOption {
//   testId:
//     | GeneralSetting
//     | StereochemistrySetting
//     | AtomsSetting
//     | BondsSetting
//     | ServerSetting
//     | ThreeDViewerSetting
//     | OptionsForDebuggingSetting;
//   controlType: ControlType;
//   valuesEnum?:
//     | typeof MeasurementUnit
//     | typeof ResetToSelectToolOption
//     | typeof FontOption
//     | typeof ImageResolutionOption
//     | typeof LabelDisplayAtStereogenicCentersOption
//     | typeof ColorStereogenicCentersOption
//     | typeof ShowHydrogenLabelsOption
//     | typeof DisplayModeOption
//     | typeof BackgroundColorOption
//     | typeof LabelColoringOption;
// }

export type AllSettingsOptions =
  | GeneralSetting
  | StereochemistrySetting
  | AtomsSetting
  | BondsSetting
  | ServerSetting
  | ThreeDViewerSetting
  | OptionsForDebuggingSetting;

export const comboBoxOptions: AllSettingsOptions[] = [
  GeneralSetting.ResetToSelectTool,
  GeneralSetting.Font,
  GeneralSetting.FontSizeUnits,
  GeneralSetting.SubFontSizeUnits,
  GeneralSetting.ImageResolution,
  StereochemistrySetting.LabelDisplayAtStereogenicCenters,
  StereochemistrySetting.ColorStereogenicCenters,
  AtomsSetting.ShowHydrogenLabels,
  BondsSetting.BondLengthUnits,
  BondsSetting.BondThicknessUnits,
  BondsSetting.StereoWedgeBondWidthUnits,
  BondsSetting.HashSpacingUnits,
];

export const switcherOptions: AllSettingsOptions[] = [
  GeneralSetting.ShowValenceWarnings,
  GeneralSetting.AtomColoring,
  StereochemistrySetting.ShowTheStereoFlags,
  StereochemistrySetting.AutoFadeAndOrCenterLabels,
  StereochemistrySetting.IgnoreTheChiralFlag,
  AtomsSetting.DisplayCarbonExplicitly,
  AtomsSetting.DisplayCharge,
  AtomsSetting.DisplayValence,
  BondsSetting.AromaticBondsAsCircle,
  ServerSetting.SmartLayout,
  ServerSetting.IgnoreStereochemistryErrors,
  ServerSetting.IgnorePseudoatomsAtMass,
  ServerSetting.AddRsitesAtMassCalculation,
  ServerSetting.AddIsotopesAtMassCalculation,
  ThreeDViewerSetting.DisplayMode,
  OptionsForDebuggingSetting.ShowAtomIds,
  OptionsForDebuggingSetting.ShowBondsIds,
  OptionsForDebuggingSetting.ShowHalfBondsIds,
  OptionsForDebuggingSetting.ShowLoopIds,
];

// export interface ISettingSection {
//   testId: SettingsSection;
//   options: ISettingOption[];
// }

// export const generalSection: ISettingSection = {
//   testId: SettingsSection.General,
//   options: [
//     {
//       testId: GeneralSetting.ResetToSelectTool,
//       controlType: ControlType.Combobox,
//       valuesEnum: ResetToSelectToolOption,
//     },
//     {
//       testId: GeneralSetting.RotationStep,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: GeneralSetting.ShowValenceWarnings,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: GeneralSetting.AtomColoring,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: GeneralSetting.Font,
//       controlType: ControlType.Combobox,
//       valuesEnum: FontOption,
//     },
//     {
//       testId: GeneralSetting.FontSize,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: GeneralSetting.FontSizeUnits,
//       controlType: ControlType.Combobox,
//       valuesEnum: MeasurementUnit,
//     },
//     {
//       testId: GeneralSetting.SubFontSize,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: GeneralSetting.SubFontSizeUnits,
//       controlType: ControlType.Combobox,
//       valuesEnum: MeasurementUnit,
//     },
//     {
//       testId: GeneralSetting.ReactionComponentMarginSize,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: GeneralSetting.ImageResolution,
//       controlType: ControlType.Combobox,
//       valuesEnum: ImageResolutionOption,
//     },
//   ],
// };

// export const stereochemistrySection: ISettingSection = {
//   testId: SettingsSection.Stereochemistry,
//   options: [
//     {
//       testId: StereochemistrySetting.ShowTheStereoFlags,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: StereochemistrySetting.LabelDisplayAtStereogenicCenters,
//       controlType: ControlType.Combobox,
//       valuesEnum: LabelDisplayAtStereogenicCentersOption,
//     },
//     {
//       testId: StereochemistrySetting.AbsoluteCenterColor,
//       controlType: ControlType.Colorpicker,
//     },
//     {
//       testId: StereochemistrySetting.ANDCentersColor,
//       controlType: ControlType.Colorpicker,
//     },
//     {
//       testId: StereochemistrySetting.ORCentersColor,
//       controlType: ControlType.Colorpicker,
//     },
//     {
//       testId: StereochemistrySetting.ColorStereogenicCenters,
//       controlType: ControlType.Combobox,
//       valuesEnum: ColorStereogenicCentersOption,
//     },
//     {
//       testId: StereochemistrySetting.AutoFadeAndOrCenterLabels,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: StereochemistrySetting.TextOfAbsoluteFlag,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: StereochemistrySetting.TextOfANDFlag,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: StereochemistrySetting.TextOfORFlag,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: StereochemistrySetting.TextOfMixedFlag,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: StereochemistrySetting.IgnoreTheChiralFlag,
//       controlType: ControlType.Switcher,
//     },
//   ],
// };

// export const atomsSection: ISettingSection = {
//   testId: SettingsSection.Atoms,
//   options: [
//     {
//       testId: AtomsSetting.DisplayCarbonExplicitly,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: AtomsSetting.DisplayCharge,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: AtomsSetting.DisplayValence,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: AtomsSetting.ShowHydrogenLabels,
//       controlType: ControlType.Combobox,
//       valuesEnum: ShowHydrogenLabelsOption,
//     },
//   ],
// };

// export const bondsSection: ISettingSection = {
//   testId: SettingsSection.Bonds,
//   options: [
//     {
//       testId: BondsSetting.AromaticBondsAsCircle,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: BondsSetting.BondLength,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: BondsSetting.BondLengthUnits,
//       controlType: ControlType.Combobox,
//       valuesEnum: MeasurementUnit,
//     },
//     {
//       testId: BondsSetting.BondSpacing,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: BondsSetting.BondThickness,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: BondsSetting.BondThicknessUnits,
//       controlType: ControlType.Combobox,
//       valuesEnum: MeasurementUnit,
//     },
//     {
//       testId: BondsSetting.StereoWedgeBondWidth,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: BondsSetting.StereoWedgeBondWidthUnits,
//       controlType: ControlType.Combobox,
//       valuesEnum: MeasurementUnit,
//     },
//     {
//       testId: BondsSetting.HashSpacing,
//       controlType: ControlType.Editbox,
//     },
//     {
//       testId: BondsSetting.HashSpacingUnits,
//       controlType: ControlType.Combobox,
//       valuesEnum: MeasurementUnit,
//     },
//   ],
// };

// export const serverSection: ISettingSection = {
//   testId: SettingsSection.Server,
//   options: [
//     {
//       testId: ServerSetting.SmartLayout,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: ServerSetting.IgnoreStereochemistryErrors,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: ServerSetting.IgnorePseudoatomsAtMass,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: ServerSetting.AddRsitesAtMassCalculation,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: ServerSetting.AddIsotopesAtMassCalculation,
//       controlType: ControlType.Switcher,
//     },
//   ],
// };

// export const threeDViewerSection: ISettingSection = {
//   testId: SettingsSection.ThreeDViewer,
//   options: [
//     {
//       testId: ThreeDViewerSetting.DisplayMode,
//       controlType: ControlType.Combobox,
//       valuesEnum: DisplayModeOption,
//     },
//     {
//       testId: ThreeDViewerSetting.BackgroundColor,
//       controlType: ControlType.Combobox,
//       valuesEnum: BackgroundColorOption,
//     },
//     {
//       testId: ThreeDViewerSetting.LabelColoring,
//       controlType: ControlType.Combobox,
//       valuesEnum: LabelColoringOption,
//     },
//   ],
// };

// export const optionsForDebuggingSection: ISettingSection = {
//   testId: SettingsSection.OptionsForDebugging,
//   options: [
//     {
//       testId: OptionsForDebuggingSetting.ShowAtomIds,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: OptionsForDebuggingSetting.ShowBondsIds,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: OptionsForDebuggingSetting.ShowHalfBondsIds,
//       controlType: ControlType.Switcher,
//     },
//     {
//       testId: OptionsForDebuggingSetting.ShowLoopIds,
//       controlType: ControlType.Switcher,
//     },
//   ],
// };
