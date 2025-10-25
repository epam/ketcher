/* eslint-disable prettier/prettier */
/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  AllSettingsOptions,
  AtomsSetting,
  BondsSetting,
  ComboBoxOptionEntry,
  comboBoxOptions,
  ComboBoxValue,
  EditboxOptionEntry,
  editboxOptions,
  GeneralSetting,
  OptionsForDebuggingSetting,
  OtherOptionEntry,
  ServerSetting,
  SettingsSection,
  StereochemistrySetting,
  SwitcherOptionEntry,
  switcherOptions,
  ThreeDViewerSetting,
} from '@tests/pages/constants/settingsDialog/Constants';
import { InfoMessageDialog } from '@tests/pages/molecules/canvas/InfoMessageDialog';
import { TopRightToolbar } from '../TopRightToolbar';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';

type GeneralSectionLocators = {
  generalSection: Locator;
  resetToSelectToolCombobox: Locator;
  rotationStepEditbox: Locator;
  showValenceWarningsSwitcher: Locator;
  atomColoringSwitcher: Locator;
  fontCombobox: Locator;
  fontSizeEditbox: Locator;
  fontSizeUnitsCombobox: Locator;
  subFontSizeEditbox: Locator;
  subFontSizeUnitsCombobox: Locator;
  reactionComponentMarginSizeEditbox: Locator;
  reactionComponentMarginSizeCombobox: Locator;
  imageResolutionCombobox: Locator;
};

type StereochemistrySectionLocators = {
  stereochemistrySection: Locator;
  showTheStereoFlagsSwitcher: Locator;
  labelDisplayAtStereogenicCentersCombobox: Locator;
  absoluteCenterColorColorpicker: Locator;
  andCentersColorColorpicker: Locator;
  orCentersColorColorpicker: Locator;
  colorStereogenicCentersCombobox: Locator;
  autoFadeAndOrCenterLabelsSwitcher: Locator;
  textOfAbsoluteFlagEditbox: Locator;
  textOfANDFlagEditbox: Locator;
  textOfORFlagEditbox: Locator;
  textOfMixedFlagEditbox: Locator;
  ignoreTheChiralFlagSwitcher: Locator;
};

type AtomsSectionLocators = {
  atomsSection: Locator;
  displayCarbonExplicitlySwitcher: Locator;
  displayChargeSwitcher: Locator;
  displayValenceSwitcher: Locator;
  showHydrogenLabelsCombobox: Locator;
};

type BondsSectionLocators = {
  bondsSection: Locator;
  aromaticBondsAsCircleSwitcher: Locator;
  bondLengthEditbox: Locator;
  bondLengthUnitsCombobox: Locator;
  bondSpacingEditbox: Locator;
  bondThicknessEditbox: Locator;
  bondThicknessUnitsCombobox: Locator;
  stereoWedgeBondWidthEditbox: Locator;
  stereoWedgeBondWidthUnitsCombobox: Locator;
  hashSpacingEditbox: Locator;
  hashSpacingUnitsCombobox: Locator;
};

type ServerSectionLocators = {
  serverSection: Locator;
  smartLayoutSwitcher: Locator;
  ignoreStereochemistryErrorsSwitcher: Locator;
  ignorePseudoatomsAtMassSwitcher: Locator;
  addRsitesAtMassCalculationSwitcher: Locator;
  addIsotopesAtMassCalculationSwitcher: Locator;
};

type ThreeDViewerSectionLocators = {
  threeDViewerSection: Locator;
  displayModeCombobox: Locator;
  backgroundColorCombobox: Locator;
  labelColoringCombobox: Locator;
};

type OptionsForDebuggingSectionLocators = {
  optionsForDebuggingSection: Locator;
  showAtomIdsSwitcher: Locator;
  showBondsIdsSwitcher: Locator;
  showHalfBondsIdsSwitcher: Locator;
  showLoopIdsSwitcher: Locator;
};

type SettingsDialogLocators = {
  window: Locator;
  openFromFileButton: Locator;
  saveToFileButton: Locator;
  resetButton: Locator;
  closeWindowButton: Locator;
  generalSection: Locator & GeneralSectionLocators;
  stereochemistrySection: Locator & StereochemistrySectionLocators;
  atomsSection: Locator & AtomsSectionLocators;
  bondsSection: Locator & BondsSectionLocators;
  serverSection: Locator & ServerSectionLocators;
  threeDViewerSection: Locator & ThreeDViewerSectionLocators;
  optionsForDebuggingSection: Locator & OptionsForDebuggingSectionLocators;
  setACSSettingsButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const SettingsDialog = (page: Page) => {
  const getElement = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const generalSection: GeneralSectionLocators = {
    generalSection: page.getByTestId(SettingsSection.General),
    resetToSelectToolCombobox: page.getByTestId(
      GeneralSetting.ResetToSelectTool,
    ),
    rotationStepEditbox: page.getByTestId(GeneralSetting.RotationStep),
    showValenceWarningsSwitcher: page.getByTestId(
      GeneralSetting.ShowValenceWarnings,
    ),
    atomColoringSwitcher: page.getByTestId(GeneralSetting.AtomColoring),
    fontCombobox: page.getByTestId(GeneralSetting.Font),
    fontSizeEditbox: page.getByTestId(GeneralSetting.FontSize),
    fontSizeUnitsCombobox: page.getByTestId(GeneralSetting.FontSizeUnits),
    subFontSizeEditbox: page.getByTestId(GeneralSetting.SubFontSize),
    subFontSizeUnitsCombobox: page.getByTestId(GeneralSetting.SubFontSizeUnits),
    reactionComponentMarginSizeEditbox: page.getByTestId(
      GeneralSetting.ReactionComponentMarginSize,
    ),
    reactionComponentMarginSizeCombobox: page.getByTestId(
      GeneralSetting.ReactionComponentMarginSizeUnits,
    ),
    imageResolutionCombobox: page.getByTestId(GeneralSetting.ImageResolution),
  };

  const stereochemistrySection: StereochemistrySectionLocators = {
    stereochemistrySection: page.getByTestId(SettingsSection.Stereochemistry),
    showTheStereoFlagsSwitcher: page.getByTestId(
      StereochemistrySetting.ShowTheStereoFlags,
    ),
    labelDisplayAtStereogenicCentersCombobox: page.getByTestId(
      StereochemistrySetting.LabelDisplayAtStereogenicCenters,
    ),
    absoluteCenterColorColorpicker: page.getByTestId(
      StereochemistrySetting.AbsoluteCenterColor,
    ),
    andCentersColorColorpicker: page.getByTestId(
      StereochemistrySetting.ANDCentersColor,
    ),
    orCentersColorColorpicker: page.getByTestId(
      StereochemistrySetting.ORCentersColor,
    ),
    colorStereogenicCentersCombobox: page.getByTestId(
      StereochemistrySetting.ColorStereogenicCenters,
    ),
    autoFadeAndOrCenterLabelsSwitcher: page.getByTestId(
      StereochemistrySetting.AutoFadeAndOrCenterLabels,
    ),
    textOfAbsoluteFlagEditbox: page.getByTestId(
      StereochemistrySetting.TextOfAbsoluteFlag,
    ),
    textOfANDFlagEditbox: page.getByTestId(
      StereochemistrySetting.TextOfANDFlag,
    ),
    textOfORFlagEditbox: page.getByTestId(StereochemistrySetting.TextOfORFlag),
    textOfMixedFlagEditbox: page.getByTestId(
      StereochemistrySetting.TextOfMixedFlag,
    ),
    ignoreTheChiralFlagSwitcher: page.getByTestId(
      StereochemistrySetting.IgnoreTheChiralFlag,
    ),
  };

  const atomsSection: AtomsSectionLocators = {
    atomsSection: page.getByTestId(SettingsSection.Atoms),
    displayCarbonExplicitlySwitcher: page.getByTestId(
      AtomsSetting.DisplayCarbonExplicitly,
    ),
    displayChargeSwitcher: page.getByTestId(AtomsSetting.DisplayCharge),
    displayValenceSwitcher: page.getByTestId(AtomsSetting.DisplayValence),
    showHydrogenLabelsCombobox: page.getByTestId(
      AtomsSetting.ShowHydrogenLabels,
    ),
  };

  const bondsSection: BondsSectionLocators = {
    bondsSection: page.getByTestId(SettingsSection.Bonds),
    aromaticBondsAsCircleSwitcher: page.getByTestId(
      BondsSetting.AromaticBondsAsCircle,
    ),
    bondLengthEditbox: page.getByTestId(BondsSetting.BondLength),
    bondLengthUnitsCombobox: page.getByTestId(BondsSetting.BondLengthUnits),
    bondSpacingEditbox: page.getByTestId(BondsSetting.BondSpacing),
    bondThicknessEditbox: page.getByTestId(BondsSetting.BondThickness),
    bondThicknessUnitsCombobox: page.getByTestId(
      BondsSetting.BondThicknessUnits,
    ),
    stereoWedgeBondWidthEditbox: page.getByTestId(
      BondsSetting.StereoWedgeBondWidth,
    ),
    stereoWedgeBondWidthUnitsCombobox: page.getByTestId(
      BondsSetting.StereoWedgeBondWidthUnits,
    ),
    hashSpacingEditbox: page.getByTestId(BondsSetting.HashSpacing),
    hashSpacingUnitsCombobox: page.getByTestId(BondsSetting.HashSpacingUnits),
  };

  const serverSection: ServerSectionLocators = {
    serverSection: page.getByTestId(SettingsSection.Server),
    smartLayoutSwitcher: page.getByTestId(ServerSetting.SmartLayout),
    ignoreStereochemistryErrorsSwitcher: page.getByTestId(
      ServerSetting.IgnoreStereochemistryErrors,
    ),
    ignorePseudoatomsAtMassSwitcher: page.getByTestId(
      ServerSetting.IgnorePseudoatomsAtMass,
    ),
    addRsitesAtMassCalculationSwitcher: page.getByTestId(
      ServerSetting.AddRsitesAtMassCalculation,
    ),
    addIsotopesAtMassCalculationSwitcher: page.getByTestId(
      ServerSetting.AddIsotopesAtMassCalculation,
    ),
  };

  const threeDViewerSection: ThreeDViewerSectionLocators = {
    threeDViewerSection: page.getByTestId(SettingsSection.ThreeDViewer),
    displayModeCombobox: page.getByTestId(ThreeDViewerSetting.DisplayMode),
    backgroundColorCombobox: page.getByTestId(
      ThreeDViewerSetting.BackgroundColor,
    ),
    labelColoringCombobox: page.getByTestId(ThreeDViewerSetting.LabelColoring),
  };

  const optionsForDebuggingSection: OptionsForDebuggingSectionLocators = {
    optionsForDebuggingSection: page.getByTestId(
      SettingsSection.OptionsForDebugging,
    ),
    showAtomIdsSwitcher: page.getByTestId(
      OptionsForDebuggingSetting.ShowAtomIds,
    ),
    showBondsIdsSwitcher: page.getByTestId(
      OptionsForDebuggingSetting.ShowBondsIds,
    ),
    showHalfBondsIdsSwitcher: page.getByTestId(
      OptionsForDebuggingSetting.ShowHalfBondsIds,
    ),
    showLoopIdsSwitcher: page.getByTestId(
      OptionsForDebuggingSetting.ShowLoopIds,
    ),
  };

  const locators: SettingsDialogLocators = {
    window: page.getByTestId('settings-dialog'),
    openFromFileButton: page.getByTestId('open-settings-from-file-button'),
    saveToFileButton: page.getByTestId('save-settings-to-file-button'),
    resetButton: page.getByTestId('reset-settings-button'),
    closeWindowButton: page.getByTestId('close-window-button'),
    generalSection: page.getByTestId('General-accordion') as Locator &
      typeof generalSection,
    stereochemistrySection: page.getByTestId(
      'Stereochemistry-accordion',
    ) as Locator & typeof stereochemistrySection,
    atomsSection: page.getByTestId('Atoms-accordion') as Locator &
      typeof atomsSection,
    bondsSection: page.getByTestId('Bonds-accordion') as Locator &
      typeof bondsSection,
    serverSection: page.getByTestId('Server-accordion') as Locator &
      typeof serverSection,
    threeDViewerSection: page.getByTestId('3D Viewer-accordion') as Locator &
      typeof threeDViewerSection,
    optionsForDebuggingSection: page.getByTestId(
      'Options for Debugging-accordion',
    ) as Locator & typeof optionsForDebuggingSection,
    setACSSettingsButton: page.getByTestId('acs-style-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async setACSSettings() {
      await locators.setACSSettingsButton.click();
    },

    async openSection(section: SettingsSection) {
      await getElement(section).click();
      // Wait for section to open
      await delay(0.2);
    },

    async setOptionValue(option: AllSettingsOptions, value = '') {
      if (Object.values(comboBoxOptions).includes(option)) {
        await getElement(option).click();
        await getElement(value).click();
      } else if (Object.values(switcherOptions).includes(option)) {
        await getElement(option).click({ force: true });
      } else {
        await getElement(option).fill(value);
      }
    },

    async getOptionValue(
      option: (typeof editboxOptions)[number],
    ): Promise<string | null> {
      return await getElement(option).inputValue();
    },

    async reset() {
      if (await locators.resetButton.isEnabled()) {
        await locators.resetButton.click();
      }
    },
  };
};

let cachedMap: Map<string, SettingsSection> | null = null;

function createOptionToSectionMap(): Map<string, SettingsSection> {
  if (cachedMap) return cachedMap;
  const map = new Map<string, SettingsSection>();

  Object.values(GeneralSetting).forEach((val) =>
    map.set(val, SettingsSection.General),
  );
  Object.values(StereochemistrySetting).forEach((val) =>
    map.set(val, SettingsSection.Stereochemistry),
  );
  Object.values(AtomsSetting).forEach((val) =>
    map.set(val, SettingsSection.Atoms),
  );
  Object.values(BondsSetting).forEach((val) =>
    map.set(val, SettingsSection.Bonds),
  );
  Object.values(ServerSetting).forEach((val) =>
    map.set(val, SettingsSection.Server),
  );
  Object.values(ThreeDViewerSetting).forEach((val) =>
    map.set(val, SettingsSection.ThreeDViewer),
  );
  Object.values(OptionsForDebuggingSetting).forEach((val) =>
    map.set(val, SettingsSection.OptionsForDebugging),
  );

  cachedMap = map;
  return cachedMap;
}

export async function setSettingsOption(
  page: Page,
  option: (typeof comboBoxOptions)[number],
  value: ComboBoxValue,
): Promise<void>;

export async function setSettingsOption(
  page: Page,
  option: (typeof switcherOptions)[number],
): Promise<void>;

export async function setSettingsOption(
  page: Page,
  option: AllSettingsOptions,
  value?: string,
): Promise<void>;

export async function setSettingsOption(
  page: Page,
  option: AllSettingsOptions,
  value = '',
) {
  const optionsToSectionMap = createOptionToSectionMap();
  const section = optionsToSectionMap.get(option);

  if (option === GeneralSetting.Font) {
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
  } else {
    await TopRightToolbar(page).Settings();
  }

  if (section && section !== SettingsSection.General) {
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(section);
  }
  await SettingsDialog(page).setOptionValue(option, value);
  await SettingsDialog(page).apply();

  // to close "To fully apply these changes, you need to apply the layout." dialog
  if (await InfoMessageDialog(page).isVisible()) {
    await InfoMessageDialog(page).ok();
  }
}

export function setSettingsOptions(
  page: Page,
  options: (
    | ComboBoxOptionEntry
    | SwitcherOptionEntry
    | EditboxOptionEntry
    | OtherOptionEntry
  )[],
): Promise<void>;

export async function setSettingsOptions(
  page: Page,
  options: { option: AllSettingsOptions; value?: string }[],
) {
  const optionsToSectionMap = createOptionToSectionMap();
  const hasFontOption = options.some(
    (entry) => entry.option === GeneralSetting.Font,
  );

  if (hasFontOption) {
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
  } else {
    await TopRightToolbar(page).Settings();
  }

  let openedSection = SettingsSection.General;

  const sortedOptions = [...options];
  sortedOptions.sort((a, b) => a.option.localeCompare(b.option));

  for (const { option, value } of sortedOptions) {
    const section = optionsToSectionMap.get(option) ?? SettingsSection.General;
    if (openedSection !== section) {
      await SettingsDialog(page).openSection(openedSection);
      await SettingsDialog(page).openSection(section);
      openedSection = section;
    }
    await SettingsDialog(page).setOptionValue(option, value);
  }
  await SettingsDialog(page).apply();

  // to close "To fully apply these changes, you need to apply the layout." dialog
  if (await InfoMessageDialog(page).isVisible()) {
    await InfoMessageDialog(page).ok();
  }
}

export async function getSettingsOptionValue(
  page: Page,
  option: (typeof editboxOptions)[number],
): Promise<string | null> {
  const optionsToSectionMap = createOptionToSectionMap();
  const section = optionsToSectionMap.get(option);

  if (option === GeneralSetting.Font) {
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
  } else {
    await TopRightToolbar(page).Settings();
  }

  if (section && section !== SettingsSection.General) {
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(section);
  }
  const optionValue = SettingsDialog(page).getOptionValue(option);
  await SettingsDialog(page).cancel();

  return optionValue;
}

export async function setACSSettings(page: Page) {
  await TopRightToolbar(page).Settings();
  await SettingsDialog(page).setACSSettings();
  await SettingsDialog(page).apply();

  if (await InfoMessageDialog(page).isVisible()) {
    await InfoMessageDialog(page).ok();
  }
}

export async function resetSettingsValuesToDefault(page: Page) {
  await TopRightToolbar(page).Settings();
  await SettingsDialog(page).reset();
  await SettingsDialog(page).apply();
}

export type SettingsDialogLocatorsType = ReturnType<typeof SettingsDialog>;
