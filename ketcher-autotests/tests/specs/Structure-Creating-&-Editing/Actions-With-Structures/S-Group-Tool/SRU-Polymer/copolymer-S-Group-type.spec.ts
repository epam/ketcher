/* eslint-disable no-magic-numbers */
import { expect, Page, test } from '@fixtures';
import { openFileAndAddToCanvas, takeElementScreenshot } from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  RepeatPatternOption,
  SubtypeOption,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

let page: Page;

test.describe('Copolymer S-Group type', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Verify that a new option added to the S-group type menu - Copolymer', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Verify that a new option added to the S-group type menu - Copolymer,
     * and it become active if there are at least two structure repeating units (SRU) defined in the selected structure.
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Click on Type drop-down menu and check that Copolymer option is active.
     * Version 3.12.0
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).typeDropdown.click();
    await expect(page.getByTestId(TypeOption.Copolymer)).toBeEnabled();
  });

  test('Check that two new drop-down menus added below the type drop-down menu', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Check that when a user after selecting the structure chooses Copolymer type,
     * two new drop-down menus added below the type drop-down menu,
     * the first one titled Subtype and the second one, that comes below it, titled Repeat Pattern.
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Click on Type drop-down menu and select Copolymer option.
     * 6. Check that two new drop-down menus added below the type drop-down menu,
     * the first one titled Subtype and the second one, that comes below it, titled Repeat Pattern.
     * Version 3.12.0
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).typeDropdown.click();
    await page.getByTestId(TypeOption.Copolymer).click();
    await expect(SGroupPropertiesDialog(page).subtypeDropdown).toBeVisible();
    await expect(
      SGroupPropertiesDialog(page).repeatPatternDropdown,
    ).toBeVisible();
  });

  test.fail('Verify that Subtype drop-down menu contain options Random, Alternating and Block', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Verify that Subtype drop-down menu contain options Random, Alternating and Block
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Click on Type drop-down menu and select Copolymer option.
     * 6. Check that Subtype drop-down menu contain options Random, Alternating and Block.
     * Version 3.12.0
     * Currently this test is failed because of issue: https://github.com/epam/ketcher/issues/9559
     * There is unexpected option "Not Specified" for Subtype dropdown menu.
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).typeDropdown.click();
    await page.getByTestId(TypeOption.Copolymer).click();
    await SGroupPropertiesDialog(page).subtypeDropdown.click();

    const listbox = page.getByRole('listbox');
    const options = await listbox.locator('> [role="option"]').all();

    await expect(page.getByTestId(SubtypeOption.Random)).toBeVisible();
    await expect(page.getByTestId(SubtypeOption.Block)).toBeVisible();
    await expect(page.getByTestId(SubtypeOption.Alternating)).toBeVisible();
    await expect(options).toHaveLength(3);
  });

  test('Check that Repeat Pattern drop-down menu contain options Head-to-Tail, Head-to-Head and Either/Unknown.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Check that Repeat Pattern drop-down menu contain options Head-to-Tail, Head-to-Head and Either/Unknown.
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Click on Type drop-down menu and select Copolymer option.
     * 6. Check that Repeat Pattern drop-down menu contain options Head-to-Tail, Head-to-Head and Either/Unknown.
     * Version 3.12.0
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).typeDropdown.click();
    await page.getByTestId(TypeOption.Copolymer).click();
    await SGroupPropertiesDialog(page).repeatPatternDropdown.click();

    const listbox = page.getByRole('listbox');
    const options = await listbox.locator('> [role="option"]').all();

    await expect(
      page.getByTestId(RepeatPatternOption.HeadToTail),
    ).toBeVisible();
    await expect(
      page.getByTestId(RepeatPatternOption.HeadToHead),
    ).toBeVisible();
    await expect(
      page.getByTestId(RepeatPatternOption.EitherUnknown),
    ).toBeVisible();
    await expect(options).toHaveLength(3);
  });

  test('Verify that after the user chooses the subtype and the repeating pattern, the Apply button become active.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Verify that after the user chooses the subtype and the repeating pattern, the Apply button become active.
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Click on Type drop-down menu and select Copolymer option.
     * 6. Choose any options in Subtype and Repeat Pattern drop-down menus.
     * 7. Check that Apply button become active.
     * Version 3.12.0
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).typeDropdown.click();
    await page.getByTestId(TypeOption.Copolymer).click();
    await SGroupPropertiesDialog(page).subtypeDropdown.click();
    await page.getByTestId(SubtypeOption.Random).click();
    await SGroupPropertiesDialog(page).repeatPatternDropdown.click();
    await page.getByTestId(RepeatPatternOption.HeadToTail).click();
    await expect(SGroupPropertiesDialog(page).applyButton).toBeEnabled();
  });

  test('Check that when Apply is selected, the selected structure encompassed with large brackets.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Check that when Apply is selected, the selected structure encompassed with large brackets.
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Select Subtype and Repeat Pattern for copolymer and click Apply button.
     * 6. Check that when Apply is selected, the selected structure encompassed with large brackets.
     * Version 3.12.0
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Copolymer,
      Subtype: SubtypeOption.Alternating,
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await takeElementScreenshot(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 10 }),
      { padding: 200 },
    );
  });

  test('Check that the chosen Subtype and Repeat Pattern areshown next to the right bracket as an abbreviation.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9695
     * Description: Check that the chosen Subtype and Repeat Pattern areshown next to the right bracket as an abbreviation.
     * Scenario:
     * 1. Put simple chain structure on canvas.
     * 2. Add SRU polymer via selecting one atom.
     * 3. Add another SRU polymer via selecting two atoms.
     * 4. Select the whole structure and open S-group properties dialog.
     * 5. Select Subtype and Repeat Pattern for copolymer and click Apply button.
     * 6. Check that the chosen Subtype and Repeat Pattern areshown next to the right bracket as an abbreviation.
     * 7. Clear canvas and repeat steps 1-6, but choose another options in Subtype and Repeat Pattern drop-down menus.
     * Version 3.12.0
     */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Copolymer,
      Subtype: SubtypeOption.Random,
      RepeatPattern: RepeatPatternOption.EitherUnknown,
    });

    await takeElementScreenshot(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 10 }),
      { padding: 200 },
    );

    await CommonTopLeftToolbar(page).clearCanvas();
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 12 }).hover({
      force: true,
    });
    await page.mouse.down();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 13 }).hover({
      force: true,
    });
    await page.mouse.up();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'B',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Copolymer,
      Subtype: SubtypeOption.Block,
      RepeatPattern: RepeatPatternOption.HeadToHead,
    });

    await takeElementScreenshot(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 10 }),
      { padding: 200 },
    );
  });
});
