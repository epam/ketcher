import { test, expect } from '@playwright/test';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import {
  BondType,
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  getCoordinatesOfTheMiddleOfTheScreen,
  getEditorScreenshot,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { TemplateEditDialog } from '@tests/pages/molecules/canvas/TemplateEditDialog';
import {
  LabelDisplayAtStereogenicCentersOption,
  StereochemistrySetting,
} from '@tests/pages/constants/settingsDialog/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  AromaticsTemplate,
  BetaDSugarsTemplate,
  FunctionalGroupsTabItems,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Template with chiral flag 0 with ignoreChiralFlag enabled/disabled', async ({
    page,
  }) => {
    // Phenylalanine mustard was chosen, because it has chiral flag 0, which allows us
    // to test ignoreChiralFlag, which has an effect on the structure only in this case
    const offsetX = 300;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    // Using "On" label style, to always show the stereo labels, so we can see the difference
    await setSettingsOption(
      page,
      StereochemistrySetting.LabelDisplayAtStereogenicCenters,
      LabelDisplayAtStereogenicCentersOption.On,
    );

    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.PhenylalanineMustard,
    );
    await clickOnCanvas(page, x - offsetX, y);
    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.PhenylalanineMustard,
    );
    await clickOnCanvas(page, x + offsetX, y);
    await takeEditorScreenshot(page);
  });

  test('Structure Library UI', async ({ page }) => {
    // Test case: EPMLSOPKET-4265
    // Overview Templates Library structure

    await BottomToolbar(page).StructureLibrary();
    await takeEditorScreenshot(page);
  });

  test('Open Structure Library tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-4265
    // Verify Structure LIbrary tooltip
    const { structureLibraryButton } = BottomToolbar(page);
    await expect(structureLibraryButton).toHaveAttribute(
      'title',
      'Structure Library (Shift+T)',
    );
    await takeEditorScreenshot(page);
  });

  test('Template Library', async ({ page }) => {
    // Test case: EPMLSOPKET-4266
    // Verify correct display of Template Library
    const deltaX = 0;
    const deltaY = 220;
    const anyX = 638;
    const anyY = 524;
    await BottomToolbar(page).StructureLibrary();
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.mouse.move(anyX, anyY);
      await page.mouse.wheel(deltaX, deltaY);
    });
    await takeEditorScreenshot(page);
  });

  test('Functional groups tab', async ({ page }) => {
    // Test case: EPMLSOPKET-4267
    // Verify Functional Group tab
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).switchToFunctionalGroupTab();
    await takeEditorScreenshot(page);
  });

  test('Functional groups - adding structure', async ({ page }) => {
    // Test case: EPMLSOPKET-4267
    // Add structure from Functional Group into canvas
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.FMOC,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Edit templates - name with just spaces', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify if structure name won't change if field will contain just spaces
    const inputText = '   ';
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.BetaDSugars,
      BetaDSugarsTemplate.BetaDAllopyranose,
    );
    await TemplateEditDialog(page).setMoleculName(inputText);
    await TemplateEditDialog(page).edit();
    await StructureLibraryDialog(page).openTemplateLibrarySection(
      TemplateLibraryTab.BetaDSugars,
    );
    await takeEditorScreenshot(page);
  });
});

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Edit templates', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify correct display of Template Edit window
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.BetaDSugars,
      BetaDSugarsTemplate.BetaDAllopyranose,
    );
    await getEditorScreenshot(page);
  });

  test('Edit templates - name field with no character', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify validation if name field not contain any characters
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.BetaDSugars,
      BetaDSugarsTemplate.BetaDAllopyranose,
    );
    await getEditorScreenshot(page);
  });

  test('Text field 128 characters limit test', async ({ page }) => {
    // Verify maximum character validation on the name field
    const textField = page.getByTestId('name-input');
    const number = 129;
    const inputText = 'A'.repeat(number);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.BetaDSugars,
      BetaDSugarsTemplate.BetaDAllopyranose,
    );
    await waitForRender(page, async () => {
      await textField.type(inputText);
    });
    await getEditorScreenshot(page);
  });

  test('My test2', async ({ page }) => {
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Naphtalene,
    );
    await TemplateEditDialog(page).getMoleculeName();
    await TemplateEditDialog(page).selectBond({ type: BondType.DOUBLE }, 0);
    await TemplateEditDialog(page).selectAtom({ label: 'O' }, 1);
    await TemplateEditDialog(page).getSelectedAttachmentPoints();
    await takeEditorScreenshot(page);

    test('My test4', async ({ page }) => {
      const atomId = 1;
      await TemplateEditDialog(page).selectAtomById(atomId);
    });

    test('My test5', async ({ page }) => {
      const _bondId = 2;
      await TemplateEditDialog(page).selectBondById(_bondId);
    });
  });
});
