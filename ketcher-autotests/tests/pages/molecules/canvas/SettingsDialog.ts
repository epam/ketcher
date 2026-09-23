/* eslint-disable no-redeclare */
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
import { waitForRender } from '@utils/common';

type GeneralSectionLocators = {
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
  displayCarbonExplicitlySwitcher: Locator;
  displayChargeSwitcher: Locator;
  displayValenceSwitcher: Locator;
  showHydrogenLabelsCombobox: Locator;
};

type BondsSectionLocators = {
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

type ReactionsSectionLocators = {
  addRsitesAtMassCalculationSwitcher: Locator;
  addIsotopesAtMassCalculationSwitcher: Locator;
};

type ValidationSectionLocators = {
  ignoreStereochemistryErrorsSwitcher: Locator;
  ignorePseudoatomsAtMassSwitcher: Locator;
};

type ThreeDViewerSectionLocators = {
  displayModeCombobox: Locator;
  backgroundColorCombobox: Locator;
  labelColoringCombobox: Locator;
};

type OptionsForDebuggingSectionLocators = {
  smartLayoutSwitcher: Locator;
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
  generalSection: Locator;
  stereochemistrySection: Locator;
  atomsSection: Locator;
  bondsSection: Locator;
  reactionsSection: Locator;
  validationSection: Locator;
  threeDViewerSection: Locator;
  optionsForDebuggingSection: Locator;
  setACSSettingsButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const SettingsDialog = (page: Page) => {
  const getElement = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const generalSection: Locator & GeneralSectionLocators = Object.assign(
    page.getByTestId(SettingsSection.General),
    {
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
      subFontSizeUnitsCombobox: page.getByTestId(
        GeneralSetting.SubFontSizeUnits,
      ),
      reactionComponentMarginSizeEditbox: page.getByTestId(
        GeneralSetting.ReactionComponentMarginSize,
      ),
      reactionComponentMarginSizeCombobox: page.getByTestId(
        GeneralSetting.ReactionComponentMarginSizeUnits,
      ),
      imageResolutionCombobox: page.getByTestId(GeneralSetting.ImageResolution),
    },
  );

  const stereochemistrySection: Locator & StereochemistrySectionLocators =
    Object.assign(page.getByTestId(SettingsSection.Stereochemistry), {
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
      textOfORFlagEditbox: page.getByTestId(
        StereochemistrySetting.TextOfORFlag,
      ),
      textOfMixedFlagEditbox: page.getByTestId(
        StereochemistrySetting.TextOfMixedFlag,
      ),
      ignoreTheChiralFlagSwitcher: page.getByTestId(
        StereochemistrySetting.IgnoreTheChiralFlag,
      ),
    });

  const atomsSection: Locator & AtomsSectionLocators = Object.assign(
    page.getByTestId(SettingsSection.Atoms),
    {
      displayCarbonExplicitlySwitcher: page.getByTestId(
        AtomsSetting.DisplayCarbonExplicitly,
      ),
      displayChargeSwitcher: page.getByTestId(AtomsSetting.DisplayCharge),
      displayValenceSwitcher: page.getByTestId(AtomsSetting.DisplayValence),
      showHydrogenLabelsCombobox: page.getByTestId(
        AtomsSetting.ShowHydrogenLabels,
      ),
    },
  );

  const bondsSection: Locator & BondsSectionLocators = Object.assign(
    page.getByTestId(SettingsSection.Bonds),
    {
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
    },
  );

  const reactionsSection: Locator & ReactionsSectionLocators = Object.assign(
    page.getByTestId(SettingsSection.Reactions),
    {
      addRsitesAtMassCalculationSwitcher: page.getByTestId(
        ServerSetting.AddRsitesAtMassCalculation,
      ),
      addIsotopesAtMassCalculationSwitcher: page.getByTestId(
        ServerSetting.AddIsotopesAtMassCalculation,
      ),
    },
  );

  const validationSection: Locator & ValidationSectionLocators = Object.assign(
    page.getByTestId(SettingsSection.Validation),
    {
      ignoreStereochemistryErrorsSwitcher: page.getByTestId(
        ServerSetting.IgnoreStereochemistryErrors,
      ),
      ignorePseudoatomsAtMassSwitcher: page.getByTestId(
        ServerSetting.IgnorePseudoatomsAtMass,
      ),
    },
  );

  const threeDViewerSection: Locator & ThreeDViewerSectionLocators =
    Object.assign(page.getByTestId(SettingsSection.ThreeDViewer), {
      displayModeCombobox: page.getByTestId(ThreeDViewerSetting.DisplayMode),
      backgroundColorCombobox: page.getByTestId(
        ThreeDViewerSetting.BackgroundColor,
      ),
      labelColoringCombobox: page.getByTestId(
        ThreeDViewerSetting.LabelColoring,
      ),
    });

  const optionsForDebuggingSection: Locator &
    OptionsForDebuggingSectionLocators = Object.assign(
    page.getByTestId(SettingsSection.Debugging),
    {
      smartLayoutSwitcher: page.getByTestId(ServerSetting.SmartLayout),
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
    },
  );

  const locators: SettingsDialogLocators = {
    window: page.getByTestId('settings-dialog'),
    openFromFileButton: page.getByTestId('open-settings-from-file-button'),
    saveToFileButton: page.getByTestId('save-settings-to-file-button'),
    resetButton: page.getByTestId('reset-settings-button'),
    closeWindowButton: page.getByTestId('close-window-button'),
    generalSection,
    stereochemistrySection,
    atomsSection,
    bondsSection,
    reactionsSection,
    validationSection,
    threeDViewerSection,
    optionsForDebuggingSection,
    setACSSettingsButton: page.getByTestId('acs-style-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  const sectionLocators: Record<SettingsSection, Locator> = {
    [SettingsSection.General]: locators.generalSection,
    [SettingsSection.Stereochemistry]: locators.stereochemistrySection,
    [SettingsSection.Atoms]: locators.atomsSection,
    [SettingsSection.Bonds]: locators.bondsSection,
    [SettingsSection.Reactions]: locators.reactionsSection,
    [SettingsSection.Validation]: locators.validationSection,
    [SettingsSection.ThreeDViewer]: locators.threeDViewerSection,
    [SettingsSection.Debugging]: locators.optionsForDebuggingSection,
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    getSectionLocator(option: AllSettingsOptions): Locator {
      const section =
        createOptionToSectionMap().get(option) ?? SettingsSection.General;
      return sectionLocators[section];
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
      await page.waitForTimeout(0.2 * 1000);
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

// The "*Setting" constant groups below no longer line up 1:1 with the
// Settings dialog's accordion sections (fields were regrouped without
// renaming the TS identifiers used across spec files, to avoid churn).
// These per-field overrides route each moved field to its real section;
// everything else still falls back to its constant group's original section.
const SECTION_OVERRIDES = new Map<string, SettingsSection>([
  [GeneralSetting.ShowValenceWarnings, SettingsSection.Validation],
  [GeneralSetting.AtomColoring, SettingsSection.Atoms],
  [GeneralSetting.ReactionComponentMarginSize, SettingsSection.Reactions],
  [GeneralSetting.ReactionComponentMarginSizeUnits, SettingsSection.Reactions],
  [ServerSetting.SmartLayout, SettingsSection.Debugging],
  [ServerSetting.IgnoreStereochemistryErrors, SettingsSection.Validation],
  [ServerSetting.IgnorePseudoatomsAtMass, SettingsSection.Validation],
  [ServerSetting.AddRsitesAtMassCalculation, SettingsSection.Reactions],
  [ServerSetting.AddIsotopesAtMassCalculation, SettingsSection.Reactions],
]);

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
  // ServerSetting fields are now split across the Reactions & Components,
  // Validation & Calculation, and Debugging sections; see SECTION_OVERRIDES.
  Object.values(ServerSetting).forEach((val) =>
    map.set(val, SettingsSection.Validation),
  );
  Object.values(ThreeDViewerSetting).forEach((val) =>
    map.set(val, SettingsSection.ThreeDViewer),
  );
  Object.values(OptionsForDebuggingSetting).forEach((val) =>
    map.set(val, SettingsSection.Debugging),
  );

  SECTION_OVERRIDES.forEach((section, val) => map.set(val, section));

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
  if (await InfoMessageDialog(page).isVisible()) {
    await InfoMessageDialog(page).ok();
  }
}

export type SettingsDialogLocatorsType = ReturnType<typeof SettingsDialog>;
