import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  clickOnCanvas,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  AromaticityOption,
  MicroAtomOption,
  QueryAtomOption,
  RingBondCountOption,
  RingSizeOption,
  SubstitutionCountOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  AtomsSetting,
  SettingsSection,
  ShowHydrogenLabelsOption,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import {
  setSettingsOption,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';

async function selectExtendedTableElements(page: Page, element: string) {
  const extendedTableButton = RightToolbar(page).extendedTableButton;

  await extendedTableButton.click();
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

test.describe('Atom Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Set "on" for Show hydrogen labels', async ({ page }) => {
    // Test case: EPMLSOPKET-10080
    // Verify appear of hydrogen labels on the molecules after changing setting to 'on'
    await drawBenzeneRing(page);
    await setSettingsOption(
      page,
      AtomsSetting.ShowHydrogenLabels,
      ShowHydrogenLabelsOption.On,
    );
    await takeEditorScreenshot(page);
  });

  test('Display Special nodes "Deuterium", "Tritium" when "Show hydrogen labels" = "Terminal and Hetero"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-10081
    // Verify if hydrogen labels appear on 'D' and 'T' -> (DH, TH) when default settings are set
    const pointX = 250;
    const pointY = 250;
    await selectExtendedTableElements(page, 'D');
    await clickOnCanvas(page, pointX, pointY, { from: 'pageTopLeft' });
    await selectExtendedTableElements(page, 'T');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('”Terminal and Hetero” is set for default for “Show hydrogen labels”', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-10076 and EPMLSOPKET-10079
    // Verify the default setting for “Show hydrogen labels”
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Atoms);
    await takeEditorScreenshot(page);
  });

  test('Non-terminal hetero atom when "Show hydrogen labels" = Terminal and Hetero', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-10083
    // Verify if the non-terminal atom will Show hydrogen labels when set on Terminal and Hetero
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Atoms);
    await SettingsDialog(page).apply();
    await openFileAndAddToCanvas(page, 'KET/chain-with-atoms.ket');
    await takeEditorScreenshot(page);
  });

  test(' Add simple atom query primitives to the query specific properties', async ({
    page,
  }) => {
    const pointX = 200;
    const pointY = 200;

    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    const point = await getAtomByIndex(page, { label: 'C' }, 1);

    await ContextMenu(page, point).click([
      MicroAtomOption.QueryProperties,
      QueryAtomOption.RingBondCount,
      RingBondCountOption.Three,
    ]);
    await ContextMenu(page, point).click([
      MicroAtomOption.QueryProperties,
      QueryAtomOption.SubstitutionCount,
      SubstitutionCountOption.AsDrawn,
    ]);
    await ContextMenu(page, point).click([
      MicroAtomOption.QueryProperties,
      QueryAtomOption.Aromaticity,
      AromaticityOption.Aromatic,
    ]);
    await ContextMenu(page, point).click([
      MicroAtomOption.QueryProperties,
      QueryAtomOption.RingSize,
      RingSizeOption.Eight,
    ]);
    await clickOnCanvas(page, pointX, pointY, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });
});
