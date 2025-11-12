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
  serverSection: Locator;
  threeDViewerSection: Locator;
  optionsForDebuggingSection: Locator;
  setACSSettingsButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const SettingsDialog = (page: Page) => {
  const getElement = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: SettingsDialogLocators = {
    window: page.getByTestId('settings-dialog'),
    openFromFileButton: page.getByTestId('open-settings-from-file-button'),
    saveToFileButton: page.getByTestId('save-settings-to-file-button'),
    resetButton: page.getByTestId('reset-settings-button'),
    closeWindowButton: page.getByTestId('close-window-button'),
    generalSection: page.getByTestId('General-accordion'),
    stereochemistrySection: page.getByTestId('Stereochemistry-accordion'),
    atomsSection: page.getByTestId('Atoms-accordion'),
    bondsSection: page.getByTestId('Bonds-accordion'),
    serverSection: page.getByTestId('Server-accordion'),
    threeDViewerSection: page.getByTestId('3D Viewer-accordion'),
    optionsForDebuggingSection: page.getByTestId(
      'Options for Debugging-accordion',
    ),
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
  if (await InfoMessageDialog(page).isVisible()) {
    await InfoMessageDialog(page).ok();
  }
}

export type SettingsDialogLocatorsType = ReturnType<typeof SettingsDialog>;
