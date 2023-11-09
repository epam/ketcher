import { Page, test } from '@playwright/test';
import { STRUCTURE_LIBRARY_BUTTON_TEST_ID } from '@tests/Templates/templates.costants';
import {
  clickInTheMiddleOfTheScreen,
  pressButton,
  resetCurrentTool,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  TopPanelButton,
  selectTopPanelButton,
  pasteFromClipboardAndAddToCanvas,
  TemplateLibrary,
  selectUserTemplatesAndPlaceInTheMiddle,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  waitForSpinnerFinishedWork,
  waitForPageInit,
  copyAndPaste,
  cutAndPaste,
  waitForRender,
  drawBenzeneRing,
  clickOnAtom,
  getEditorScreenshot,
} from '@utils';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function openStructureLibrary(page: Page) {
  await page.getByTestId(STRUCTURE_LIBRARY_BUTTON_TEST_ID).click();
}

async function saveToTemplates(page: Page, shouldSave = true) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'Save to Templates' }).click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill('My Template');
  if (shouldSave) {
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }
}

test.describe('Click User Templates on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open template from the library', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-13158
      Description: open template
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Spaces at the beginning and end of the entered line are truncated', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-10073(3)
      Description: spaces in Molecule name field validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill(' name ');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await openStructureLibrary(page);
    await pressButton(page, 'User Templates (1)');
    await page.getByPlaceholder('Search by elements...').fill('name');
    await page.getByPlaceholder('Search by elements...').press('Enter');
  });

  test('Delete user template', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-39948
      Description: delete user template validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(
      TemplateLibrary.Naphtalene,
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('to_delete');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await openStructureLibrary(page);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page.getByTitle('to_delete').getByRole('button').first().click();

    await openStructureLibrary(page);
    await page.getByPlaceholder('Search by elements...').fill('to_delete');
    await page.getByPlaceholder('Search by elements...').press('Enter');
  });

  test('Create Template with Simple Objects', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2941
    Description: Creating Template with Simple Objects validation
    */
    await openFileAndAddToCanvas(
      'Create Template with Simple Objects.mol',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('simple_object_template');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await openStructureLibrary(page);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page
      .getByPlaceholder('Search by elements...')
      .fill('simple_object_template');
    await page.getByPlaceholder('Search by elements...').press('Enter');
  });

  test('Create Template with with Reaction arrow', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-12942
    Description: Creating Template with Reaction arrow validation.
    */
    await openFileAndAddToCanvas(
      'Create Template with Reaction arrow.rxn',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('reaction_arrow_template');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await selectTopPanelButton(TopPanelButton.Clear, page);

    await openStructureLibrary(page);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page
      .getByPlaceholder('Search by elements...')
      .fill('reaction_arrow_template');
    await page.getByPlaceholder('Search by elements...').press('Enter');
  });

  test('Copy/Paste action with templates', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13158(3)
    Description: Template is copied and pasted as expected.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/templates.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste action with expanded functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13158(4)
    Description: Template is cut and pasted as expected.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/templates.mol', page);
    await cutAndPaste(page);
    await waitForRender(page, async () => {
      await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    });
  });
});

// These two tests affect other tests or by other tests, so they were moved to a separate describe group
test.describe('Click User Templates on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('User Templates - Create Template - UI', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-13158(2)
      Description: create and save complex template
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C12(C(C3CN4CN5C6(CCN78CCC(C9CCCN9)C7CNN68)CCC5C4N3)CC3N1NCC3)CCCN2',
    );
    await clickInTheMiddleOfTheScreen(page);
    await saveToTemplates(page);

    await selectTopPanelButton(TopPanelButton.Clear, page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page.getByText('0NNNNHNHNNHNNHNH').click();
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Create Template - saving', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1722
      Description: saving user template validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(
      TemplateLibrary.Naphtalene,
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('user_template_1');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await waitForSpinnerFinishedWork(page, async () => {
      await selectTopPanelButton(TopPanelButton.Clean, page);
    });

    await openStructureLibrary(page);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page.getByText('user_template_1').click();
  });

  test('Attach created template to atom of structure on canvas', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1729
      Description: Template attached to structure on canvas.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas('Molfiles-V2000/long-structure.mol', page);
    await saveToTemplates(page);

    await selectTopPanelButton(TopPanelButton.Clear, page);
    await drawBenzeneRing(page);
    await openStructureLibrary(page);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page.getByText('My Template').click();
    await clickOnAtom(page, 'C', anyAtom);
  });
});

test.describe('Click User Templates on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await getEditorScreenshot(page);
  });

  test('Check a warning message about localStorage to template window', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-11852
      Description: warning message validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('button', { name: 'Save to Templates' }).click();
  });

  test('Molecule Name field length validation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10073(1)
      Description: no mote than 128 symbols error validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();

    const tooLongValueLength = 130;
    await page
      .getByPlaceholder('template')
      .fill('a'.repeat(tooLongValueLength));
  });

  test('Empty Molecule name field validation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-10073(2)
      Description: empty field validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('name');
    await page.getByPlaceholder('template').fill('');
  });

  test('Check a warning message about unique name', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-39948
      Description: warning message validation
    */
    await selectUserTemplatesAndPlaceInTheMiddle(
      TemplateLibrary.Naphtalene,
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('user_template_1');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'Save to Templates');
    await page.getByPlaceholder('template').click();
    await page.getByPlaceholder('template').fill('user_template_1');
  });

  test('Check scrollbar in the structure field is present for long structures', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1721
      Description: The scrollbar in the structure field is present.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/long-structure.mol', page);
    await saveToTemplates(page, false);
  });
});
