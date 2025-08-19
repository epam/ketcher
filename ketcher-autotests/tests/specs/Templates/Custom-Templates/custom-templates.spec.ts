import { test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  clickOnAtom,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  AromaticsTemplate,
  FunctionalGroupsTabItems,
  TabSection,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { TemplateEditDialog } from '@tests/pages/molecules/canvas/TemplateEditDialog';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Custom Templates - Template Library folders', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1697
    Description:
    The 'Template Library' tab is opened by default.
    */
    await BottomToolbar(page).StructureLibrary();
    await takeEditorScreenshot(page);
  });

  test('Custom Templates - Template Library folders content', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1698 - Any structure is saved by the user as a template.
    Description:
    Check any structures
    Open the 'User Templates' folder'
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Custom Templates - Window UI', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2887 
    Description:
    Click on the 'Salts and Solvents' tab
    Click the 'X' button.
    Click on the 'Custom Templates' button.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openTab(TabSection.FunctionalGroupsTab);
    await StructureLibraryDialog(page).openTab(TabSection.SaltsAndSolventsTab);
    await PasteFromClipboardDialog(page).closeWindowButton.click();
    await BottomToolbar(page).StructureLibrary();
    await takeEditorScreenshot(page);
  });

  test('When switching between tabs-the focus is active', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-8908 
    Description:
    Open 'Custom Templates'
    Switch between tabs
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openTab(TabSection.FunctionalGroupsTab);
    await StructureLibraryDialog(page).openTab(TabSection.TemplateLibraryTab);
    await StructureLibraryDialog(page).openTab(TabSection.SaltsAndSolventsTab);
    await takeEditorScreenshot(page);
  });

  test('Thumbnail images are readable in Template Dialog', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-8932 
    Description:
    Switch to "Functional Groups" tab
    Observe some large structure
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Tf,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check automatically reset the search filter', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-8906 
    Description:
    Close 'Custom Templates' window
    Open 'Custom Templates' window
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).setSearchValue('DMF');
    await takeEditorScreenshot(page);
    await PasteFromClipboardDialog(page).closeWindowButton.click();
    await BottomToolbar(page).StructureLibrary();
    await takeEditorScreenshot(page);
  });

  test('Adding template to canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1667 
    Description:
    Click the 'Custom Templates' button.
    Click to add the selected template on the canvas.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Anthracene,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('The scroll should not be displayed in the edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4736 
    Description:
    Click on Edit button in right down corner of template (e.g. alpha-D-Arabinofuranose)
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await takeEditorScreenshot(page);
  });

  test('Edit templates - Close window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1700 
    Description:
    Make any change(s) in the window. Click the 'Apply' button.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).close();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).cancel();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).edit();
    await takeEditorScreenshot(page);
  });

  test('Edit templates - Template Name', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1701 
    Description:
    Click the 'Custom Template' button.
    Paste in the 'Molecule name' field text (more than 128 symbols).
    */
    const inputText =
      'My new template for everyone who want to create new table with more than 128 symbols of elements like Azulene with merged Cyclopentadiene';
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).setMoleculeName(inputText);
    await page.getByTestId('name-input').hover();
    await takeEditorScreenshot(page);
  });

  test('Edit templates -  Greek symbols in Template Name', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1707 
    Description: The edited template has the 'γ-template name' (Greek symbol) name in the Template Library.
    */
    const inputText = 'γ-template name';
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).setMoleculeName(inputText);
    await takeEditorScreenshot(page);
  });

  test('Edit templates -  Attachment atom and bond', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1708
    Description: The info text 'Atom Id: xx; Bond Id: yy' contains the ids of the new attachment atom and bond.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).clickMoleculeName();
    await TemplateEditDialog(page).clickCanvas();
    await takeEditorScreenshot(page);
  });

  test('Templates Library - Template attachment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1720
    Description: The template is attached to the structure by the defined attachment bond.
    */
    const atomToolbar = RightToolbar(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await TemplateEditDialog(page).clickMoleculeName();
    await TemplateEditDialog(page).clickCanvas();
    await takeEditorScreenshot(page);
    await TemplateEditDialog(page).edit();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickOnCanvas(page, 0, 1, { from: 'pageCenter' });
    const point = { x: -50, y: 0 };
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageCenter' });
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'C', 0);
    await takeEditorScreenshot(page);
  });
});

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test('Custom Templates - Button and tooltip', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2886
    Description:
    'Structure Library (Shift + T)' tooltip appears when Hover over the 'SL'.
    */
    const structureLibraryButton = BottomToolbar(page).structureLibraryButton;
    await expect(structureLibraryButton).toHaveAttribute(
      'title',
      'Structure Library (Shift+T)',
    );
  });
});
