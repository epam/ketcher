import { Page, test } from '@playwright/test';
import {
  delay,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  selectRingButton,
  RingButton,
  selectNestedTool,
  RgroupTool,
  DELAY_IN_SECONDS,
  AttachmentPoint,
  openFileAndAddToCanvas,
  SelectTool,
  pressButton,
  clickOnAtom,
  TopPanelButton,
  selectTopPanelButton,
  LeftPanelButton,
  selectLeftPanelButton,
} from '@utils';

async function openRGroupModalForTopAtom(page: Page) {
  await selectRingButton(RingButton.Benzene, page);
  await clickInTheMiddleOfTheScreen(page);

  await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
  const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
  await page.mouse.click(x, y);

  return { x, y };
}

const rGroupFromFile = 'R8';
const atomIndex = 3;
async function selectRGroups(page: Page, rGroups: string[]) {
  await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
  await page.getByText(rGroupFromFile).click();
  for (const rgroup of rGroups) {
    await pressButton(page, rgroup);
  }
  await pressButton(page, 'Apply');
}

async function selectRGroup(page: Page, rgroup: string) {
  await page.locator('button', { hasText: rgroup }).click();
}

async function clickModalButton(page: Page, button: 'Apply' | 'Cancel') {
  await page.locator(`input[type="button"][value="${button}"]`).click();
}

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('R-Fragment-Group dialog opening', async ({ page }) => {
    /* Test case: EPMLSOPKET-1582 and EPMLSOPKET-1610
    Description:  R-Fragment-Group dialog opening
    */
    await openRGroupModalForTopAtom(page);
    await selectRGroup(page, 'R5');
  });

  test('R-Fragment-Group UI Verification', async ({ page }) => {
    /* Test case: EPMLSOPKET-1583
      Description: R-Fragment-Group UI Verification
    */
    await openRGroupModalForTopAtom(page);
  });

  test('R-Fragment-Group dialog cancelling', async ({ page }) => {
    /* Test case: EPMLSOPKET-1584
      Description:  R-Fragment-Group dialog cancelling
    */
    await openRGroupModalForTopAtom(page);
    await selectRGroup(page, 'R5');
    await clickModalButton(page, 'Cancel');
  });

  test('Create Single R-Fragment-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1585
      Description: Create Single R-Fragment-Group member
    */
    await openRGroupModalForTopAtom(page);
    await page.getByText('R5').click();
    await clickModalButton(page, 'Apply');
  });

  test('Change R-Group definition for single R-Group member', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1587
      Description: Change R-Group definition for single R-Group member
    */
    const { x, y } = await openRGroupModalForTopAtom(page);
    await page.getByText('R5').click();
    await clickModalButton(page, 'Apply');

    await page.mouse.click(x, y);
    await selectRGroup(page, rGroupFromFile);
    await clickModalButton(page, 'Apply');
  });

  test('Add attachment point to the R-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1598
      Description: Change R-Group definition for single R-Group member
    */
    const { x, y } = await openRGroupModalForTopAtom(page);
    await page.getByText('R5').click();
    await clickModalButton(page, 'Apply');

    await delay(DELAY_IN_SECONDS.THREE);
    await page.keyboard.press('Control+r');
    await page.mouse.click(x, y);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await clickModalButton(page, 'Apply');
  });

  test('Brackets rendering for whole r-group structure', async ({ page }) => {
    await openFileAndAddToCanvas('simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByText(rGroupFromFile).click();
    await clickModalButton(page, 'Apply');
  });

  test('Brackets rendering for whole r-group structure even with attachment points', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await clickModalButton(page, 'Apply');
    await selectNestedTool(
      page,
      RgroupTool.R_GROUP_FRAGMENT,
      RgroupTool.ATTACHMENT_POINTS,
    );
    await clickOnAtom(page, 'C', atomIndex);
    await page.getByText(rGroupFromFile).click();
    await clickModalButton(page, 'Apply');
  });

  test('Remove R-Group member from R-Group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1589
      Description: Remove R-Group member from R-Group. File used for test - R-fragment-structure.mol
    */
    await openFileAndAddToCanvas('R-fragment-structure.mol', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectRGroups(page, ['R5']);
  });

  test('Change R-Group definition for multiple R-Group members', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1588
      Description: Change R-Group definition for multiple R-Group members. File used for test - R-fragment-structure.mol
    */
    await openFileAndAddToCanvas('R-fragment-structure.mol', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectRGroups(page, ['R7']);
  });

  test('Create several R-Group members', async ({ page }) => {
    /* Test case: EPMLSOPKET-1586
      Description: Create several R-Group members
    */
    await openFileAndAddToCanvas('3structeres.mol', page);

    await selectRGroups(page, ['R7']);

    await page.getByText('R16').click();
    await selectRGroup(page, 'R8');
    await clickModalButton(page, 'Apply');

    await page.getByText('R14').click();
    await selectRGroup(page, 'R15');
    await clickModalButton(page, 'Apply');
  });

  test('Define a structure with attachment points as R-Group member', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1599
      Description: Define a structure with attachment points as R-Group member
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await delay(DELAY_IN_SECONDS.THREE);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await clickModalButton(page, 'Apply');

    await page.keyboard.press('Control+r');
    await page.keyboard.press('Control+r');
    await page.mouse.click(x, y);
    await selectRGroup(page, 'R5');
    await clickModalButton(page, 'Apply');
  });

  test('R-Group definition is not deleted when root structure was deleted', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1591
      Description: R-Group definition is not deleted when root structure was deleted
    */
    await openFileAndAddToCanvas('R-fragment-structure.mol', page);
    await page.getByText('R8').click();
    await page.keyboard.press('Delete');
  });

  test.fixme('Delete R-Group member', async ({ page }) => {
    /* Test case: EPMLSOPKET-1590
  Description: Delete R-Group member
  */
    await openFileAndAddToCanvas('R-fragment-structure.mol', page);

    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await page.getByText('R8').click();
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await delay(DELAY_IN_SECONDS.THREE);

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await selectRGroup(page, rGroupFromFile);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await delay(DELAY_IN_SECONDS.THREE);

    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+Delete');
  });
});
