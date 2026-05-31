/* eslint-disable prettier/prettier */
export enum SettingsSection {
  General = 'General-accordion',
  Stereochemistry = 'Stereochemistry-accordion',
  Atoms = 'Atoms-accordion',
  Bonds = 'Bonds-accordion',
  Server = 'Server-accordion',
  ThreeDViewer = '3D Viewer-accordion',
  OptionsForDebugging = 'Options for Debugging-accordion',
}

export enum GeneralSetting {
  ResetToSelectTool = 'reset-to-select-input-span',
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
  ImageResolution = 'image-resolution-input-span',
}

export enum StereochemistrySetting {
  ShowTheStereoFlags = 'show-stereo-flags-input-span',
  LabelDisplayAtStereogenicCenters = 'stereo-label-style-input-span',
  AbsoluteCenterColor = 'colorOfAbsoluteCenters-color-picker-preview',
  ANDCentersColor = 'colorOfAndCenters-color-picker-preview',
  ORCentersColor = 'colorOfOrCenters-color-picker-preview',
  ColorStereogenicCenters = 'color-stereogenic-centers-input-span',
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
  ShowHydrogenLabels = 'show-hydrogen-labels-input-span',
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

export enum MeasurementUnit {
  Px = 'px-option',
  Cm = 'cm-option',
  Pt = 'pt-option',
  Inch = 'inch-option',
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
  GeneralSetting.ReactionComponentMarginSizeUnits,
  GeneralSetting.ImageResolution,
  StereochemistrySetting.LabelDisplayAtStereogenicCenters,
  StereochemistrySetting.ColorStereogenicCenters,
  AtomsSetting.ShowHydrogenLabels,
  BondsSetting.BondLengthUnits,
  BondsSetting.BondThicknessUnits,
  BondsSetting.StereoWedgeBondWidthUnits,
  BondsSetting.HashSpacingUnits,
  ThreeDViewerSetting.DisplayMode,
  ThreeDViewerSetting.BackgroundColor,
  ThreeDViewerSetting.LabelColoring,
];

export type ComboBoxValue =
  | MeasurementUnit
  | ResetToSelectToolOption
  | FontOption
  | ImageResolutionOption
  | LabelDisplayAtStereogenicCentersOption
  | ColorStereogenicCentersOption
  | ShowHydrogenLabelsOption
  | DisplayModeOption
  | BackgroundColorOption
  | LabelColoringOption;

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
  OptionsForDebuggingSetting.ShowAtomIds,
  OptionsForDebuggingSetting.ShowBondsIds,
  OptionsForDebuggingSetting.ShowHalfBondsIds,
  OptionsForDebuggingSetting.ShowLoopIds,
];

export const editboxOptions: AllSettingsOptions[] = [
  GeneralSetting.RotationStep,
  GeneralSetting.FontSize,
  GeneralSetting.SubFontSize,
  GeneralSetting.ReactionComponentMarginSize,
  StereochemistrySetting.TextOfAbsoluteFlag,
  StereochemistrySetting.TextOfANDFlag,
  StereochemistrySetting.TextOfORFlag,
  StereochemistrySetting.TextOfMixedFlag,
  BondsSetting.BondLength,
  BondsSetting.BondSpacing,
  BondsSetting.BondThickness,
  BondsSetting.StereoWedgeBondWidth,
  BondsSetting.HashSpacing,
];

export type ComboBoxOptionEntry = {
  option: (typeof comboBoxOptions)[number];
  value: ComboBoxValue;
};

export type SwitcherOptionEntry = {
  option: (typeof switcherOptions)[number];
  // value is not needed for switcher options, as they are boolean
};

export type EditboxOptionEntry = {
  option: (typeof editboxOptions)[number];
  value: string;
};
export type OtherOptionEntry = {
  option: Exclude<
    AllSettingsOptions,
    | (typeof comboBoxOptions)[number]
    | (typeof switcherOptions)[number]
    | (typeof editboxOptions)[number]
  >;
  value?: string;
};
