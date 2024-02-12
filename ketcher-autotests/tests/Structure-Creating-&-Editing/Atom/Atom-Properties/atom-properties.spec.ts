import { expect, test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  selectAtomInToolbar,
  AtomButton,
  receiveFileComparisonData,
  saveToFile,
  pressButton,
  resetCurrentTool,
  getControlModifier,
  TopPanelButton,
  selectTopPanelButton,
  selectBond,
  BondTypeName,
  selectLeftPanelButton,
  LeftPanelButton,
  copyAndPaste,
  doubleClickOnAtom,
  moveOnAtom,
  clickOnAtom,
  waitForPageInit,
  waitForRender,
  waitForAtomPropsModal,
  drawBenzeneRing,
} from '@utils';
import { getMolfile, getRxn } from '@utils/formats';
import {
  selectAtomLabel,
  fillAliasForAtom,
  fillChargeForAtom,
  fillIsotopeForAtom,
  selectValenceForAtom,
  selectRadical,
  selectRingBondCount,
  selectHCount,
  selectSubstitutionCount,
  selectUnsaturated,
  selectReactionFlagsInversion,
  selectExactChange,
  selectThreeAtomsFromPeriodicTable,
  selectElementFromExtendedTable,
  selectRingBondCountOption,
  selectHCountOption,
  selectSubstitutionCountOption,
  selectUnsaturatedOption,
  selectImplicitHCountOption,
  selectAromaticityOption,
  selectRingMembershipOption,
  selectRingSizeOption,
  selectConnectivityOption,
} from './utils';

const CANVAS_CLICK_X = 200;
const CANVAS_CLICK_Y = 200;

test.describe('Atom Properties', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Check Atom Properties modal window by double click on atom', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1592
      Description: The 'Atom Properties' dialog is opened, it contains the menu:
      'General' tab (opened by default) with:
      Label type-in field, filled with the data for the clicked atom;
      information 'Number' field with a number of atoms in the Periodic table, filled with the data for the clicked atom;
      Alias type-in field;
      Charge type-in field;
      Isotope type-in field;
      Valence drop-down list (with the following values: blank, I, II, III, IV, V, VI, VII, VIII);
      Radical drop-down list (with the following values: blank, Monoradical, Diradical (singlet), Diradical (triplet)).
      'Query specific' tab with:
      'Ring bond count' drop-down list (with the following values: blank, 0, 2, 3, 4);
      'H count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4);
      'Substitution count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4, 5, 6).
      checkbox 'Unsaturated';
      'Cancel', 'Apply' and 'X' buttons;
      The 'Atom Properties' header.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'N', 0);
    await waitForAtomPropsModal(page);
  });

  test('Check Atom Properties modal window by hovering and press hotkey /', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1592
      Description: The 'Atom Properties' dialog is opened, it contains the menu:
      'General' tab (opened by default) with:
      Label type-in field, filled with the data for the clicked atom;
      information 'Number' field with a number of atoms in the Periodic table, filled with the data for the clicked atom;
      Alias type-in field;
      Charge type-in field;
      Isotope type-in field;
      Valence drop-down list (with the following values: blank, I, II, III, IV, V, VI, VII, VIII);
      Radical drop-down list (with the following values: blank, Monoradical, Diradical (singlet), Diradical (triplet)).
      'Query specific' tab with:
      'Ring bond count' drop-down list (with the following values: blank, 0, 2, 3, 4);
      'H count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4);
      'Substitution count' drop-down list (with the following values: blank, 0, 1, 2, 3, 4, 5, 6).
      checkbox 'Unsaturated';
      'Cancel', 'Apply' and 'X' buttons;
      The 'Atom Properties' header.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await moveOnAtom(page, 'O', 0);
    await waitForRender(page, async () => {
      await page.keyboard.press('/');
    });
  });

  test('Change Atom Label on structure and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: The 'Label' field contains the correct typed atom symbol.
      The selected carbon atom isn`t changed with 'Na' atom symbol.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'C', 0);

    await selectAtomLabel(page, 'Na', 'Cancel');
  });

  test('Change Atom Label on structure and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: The 'Label' field contains the correct typed atom symbol.
      The selected carbon atom is changed with 'Sb' atom symbol.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'C', 0);

    await waitForRender(page, async () => {
      await selectAtomLabel(page, 'Sb', 'Apply');
    });
  });

  test('Change Atom Label on structure to incorrect', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: In the opened dialog the 'Label' field contains 'N'.
      The 'Label' field has a red frame. The 'Error: Wrong label' tooltip appears
      when the cursor is over the field. The Apply button becomes disabled.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'N', 0);

    await page.getByLabel('Label').fill('J%');
  });

  test('Change Atom Label on structure to incorrect and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1593
      Description: In the opened dialog the 'Label' field contains 'N'.
      The 'Label' field has a red frame. The 'Error: Wrong label' tooltip appears
      when the cursor is over the field. The Apply button becomes disabled.
      The 'N' atom symbol isn`t changed with an incorrect symbol.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'N', 0);

    await selectAtomLabel(page, 'J%', 'Cancel');
  });

  test('Typing atom symbols - single selected atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1594
      Description: The appeared symbol is colored with the same color as in the Periodic Table.
    */
    const anyAtom = 2;
    const secondAnyAtom = 3;
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await doubleClickOnAtom(page, 'C', 1);

    await selectAtomLabel(page, 'N', 'Apply');

    await doubleClickOnAtom(page, 'C', anyAtom);

    await selectAtomLabel(page, 'O', 'Apply');

    await doubleClickOnAtom(page, 'C', secondAnyAtom);

    await selectAtomLabel(page, 'Cl', 'Apply');
  });

  test('Open saved structure and edit atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1594
      Description: The saved *.mol file is opened and can be edited.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-with-three-atoms.mol',
      page,
    );

    await doubleClickOnAtom(page, 'N', 0);

    await selectAtomLabel(page, 'Br', 'Apply');

    await doubleClickOnAtom(page, 'O', 0);

    await selectAtomLabel(page, 'F', 'Apply');

    await doubleClickOnAtom(page, 'Cl', 0);

    await selectAtomLabel(page, 'Zn', 'Apply');
  });

  test('Save the structure as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1594
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-with-three-atoms.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/benzene-with-three-atoms-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/benzene-with-three-atoms-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Typing atom symbols - several selected atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1595
      Description: The appeared symbol is colored with the same color as in the Periodic Table.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    const modifier = getControlModifier();
    await page.keyboard.press(`${modifier}+KeyA`);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
  });

  test('Typing atom symbols - atoms of different structures', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1596
      Description: The appeared symbol is colored with the same color as in Periodic Table and added to two different rings.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      page,
    );
    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'O', 0);

    await clickOnAtom(page, 'C', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'C', 0);

    await selectAtomLabel(page, 'Zn', 'Apply');
  });

  test('Save two structures the structure as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1596
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/benzene-and-cyclopentadiene-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/benzene-and-cyclopentadiene-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Change Atom Alias on structure and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1597
      Description: The 'Alias' field in 'Atom Properties' dialog is empty by default.
      The 'Alias' field contains the correct typed characters.
      The selected carbon atom does not changed.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);

    await doubleClickOnAtom(page, 'C', 0);

    await fillAliasForAtom(page, 'abc123TesREasd!@', 'Cancel');
  });

  test('Change Atom Alias on structure and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1597
      Description: In the opened dialog the 'Label' field contains 'C'. The 'Alias' field is empty.
      The 'Alias' field contains the correct typed characters. (for example 'abc123TesREasd!@').
      The selected carbon atom is changed with typed text.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);

    await doubleClickOnAtom(page, 'C', 0);

    await fillAliasForAtom(page, 'abc123TesREasd!@', 'Apply');
  });

  test('Edit Atom Label and Alias on structure and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1597
      Description: In the opened dialog the 'Alias' field contains the correct text (for our example - 'abc123TesREasd!@').
      The 'Label' field is filled with 'C' atom symbol.
      The 'Alias' field contains the correct edited text.
      The correct edited alias 'TesREasd!@' and Label ('Sb' for our example) appears for the edited atom.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-ring-with-alias.mol',
      page,
    );

    await doubleClickOnAtom(page, 'C', 0);

    await fillAliasForAtom(page, 'TesREasd!@', 'Apply');
  });

  test('Dialog - Number of Atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1605
      Description: In the opened dialog the 'Number' field contains the correct text (for our example - Carbon = 6).
      Nitrogen = 7, Oxygen = 8
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');

    await doubleClickOnAtom(page, 'N', 0);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');

    await doubleClickOnAtom(page, 'O', 0);
  });

  test('Dialog - Atom type - List', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3340
      Description: if 'Atom type' is set to 'List' then dialog should change:
      - Label and Number should be hided
      - new items "List" (input field) and "edit" icon should be added
      - "Not list (checkbox)" should be added
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'C', 0);
    await page.locator('label').filter({ hasText: 'Atom Type' }).click();
    await page.getByRole('option', { name: 'List', exact: true }).click();
  });

  test('Dialog - Atom type - Special', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3340
      Description: if 'Atom type' is set to 'Special' then dialog should change:
      - Label and Number should be hidden
      - new item "Special" (input field) and "edit" icon should be added
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnAtom(page, 'C', 0);
    await page.locator('label').filter({ hasText: 'Atom Type' }).click();
    await page.getByRole('option', { name: 'Special', exact: true }).click();
  });

  test('Charge of the Atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1606
      Description: The 'Charge' field is filled with "0" by default.
      The '+' symbol appears near the selected atom on top-right side.
      The '1' is present in the 'Charge' field.
      The '2+' symbol appears near the selected atom on top-right side.
      The '2' is present in the 'Charge' field.
      The '2-' symbol appears near the selected atom on top-right side.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await fillChargeForAtom(page, '1', 'Apply');
    await takeEditorScreenshot(page);

    await doubleClickOnAtom(page, 'C', 0);
    await fillChargeForAtom(page, '2', 'Apply');
    await takeEditorScreenshot(page);

    await doubleClickOnAtom(page, 'C', 0);
    await fillChargeForAtom(page, '-2', 'Apply');
  });

  test('Type in the Charge field any incorrect data', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1606
      Description: The 'Charge' field is framed with the red frame.
      The 'Error: Invalid charge value' tooltip appears when the cursor over the field.
      The 'Apply' button becomes disabled.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await page.getByLabel('Charge').fill('A');
  });

  test('Type in the Charge field number bigger than maximum', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3339
      Description: The range for charge is from -999 to 999
      The 'Charge' field is framed with the red frame.
      The 'Error: Invalid charge value' tooltip appears when the cursor over the field.
      The 'Apply' button becomes disabled.
    */
    await openFileAndAddToCanvas('KET/benzene-ring-with-two-atoms.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await page.getByTestId('charge-input').fill('9999');
    await page.getByTestId('charge-input').hover();
  });

  test('Save structure with two Charge as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1606
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-with-charge.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/benzene-with-charge-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/benzene-with-charge-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Change charge on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1607
      Description: The Charge are changed for three atoms (S, F, I).
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'I', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'S', 0);

    await fillChargeForAtom(page, '3', 'Apply');
  });

  test('Typing in Charge for sigle atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1608
      Description: The Charge are changed for three atoms (S, F, I).
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );

    await doubleClickOnAtom(page, 'S', 0);
    await fillChargeForAtom(page, '1', 'Apply');

    await doubleClickOnAtom(page, 'F', 0);
    await fillChargeForAtom(page, '-3', 'Apply');

    await doubleClickOnAtom(page, 'I', 0);
    await fillChargeForAtom(page, '5', 'Apply');
  });

  test('Add Isotope in modal and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The 'Isotope' field is filled with '0' by default.
      The 'Isotope' field contains the correct typed value.
      The isotope value does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await fillIsotopeForAtom(page, '18', 'Cancel');
  });

  test('Add Isotope in modal and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The 'Isotope' field is filled with '0' by default.
      The 'Isotope' field contains the correct typed value.
      '13' appears near the carbon atom in top-left side.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 1);
    await fillIsotopeForAtom(page, '13', 'Apply');
  });

  test('Add incorrect Isotope in modal', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The 'Isotope' field is filled with '0' by default.
      Field highlight with red and tooltip appears: There must be integer!
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 1);
    await page.getByLabel('Isotope').fill('b');
  });

  test('Add incorrect negative Isotope in modal', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3339
      Description: The range for 'Isotope' field is from 0 to 999
      Field highlight with red and tooltip appears: Invalid isotope value!
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 1);
    await page.getByTestId('isotope-input').fill('-88');
    await page.getByTestId('isotope-input').hover();
  });

  test('Save structure with Isotope information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1615
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/chain-with-isotope.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-isotope-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-isotope-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Change Isotope value on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1616
      Description: The typed isotope value appears near the selected atoms only.Number is colored same as atoms.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'O', 0);

    await fillIsotopeForAtom(page, '18', 'Apply');
  });

  test('Typing Isotopes in Label Edit modal', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1617
      Description: The 'Isotope' 18O added. Number colored in red as Oxygen atom.
    */
    const timeout = 2000;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await moveOnAtom(page, 'C', 1);
    await page.mouse.down();
    await page.waitForTimeout(timeout);

    await page.getByLabel('Atom').fill('18O');
    await pressButton(page, 'Apply');
  });

  test('Typing in isotope - several atoms through Label Edit modal', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1618
      Description: Only last selected atom is replaced with the typed atom symbol and isotope.
    */
    const timeout = 2000;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);
    await page.keyboard.up('Shift');

    await moveOnAtom(page, 'S', 0);
    await page.mouse.down();
    await page.waitForTimeout(timeout);

    await page.getByLabel('Atom').fill('18S');
    await pressButton(page, 'Apply');
  });

  test('Add Valence in modal and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1619
      Description: The 'Valence' field is empty by default.
      The 'Valence' drop-down list contains values: blank, 0, I, II, III, IV, V, VI, VII, VIII.
      The 'Valence' field contains the selected value.
      The valence value does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectValenceForAtom(page, 'III', 'Cancel');
  });

  test('Add Valence in modal and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1619
      Description: The 'Valence' field is filled with '0' by default.
      The 'Valence' field contains the correct typed value.
      'III' appears near the carbon atom in right side.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 1);
    await selectValenceForAtom(page, 'III', 'Apply');
  });

  test('Save structure with Valence information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1619
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/chain-with-valence.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-valence-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-valence-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Change Valence value on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1620
      Description: The typed Valence value appears near the selected atoms only.
      Number is colored same as atoms.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'O', 0);

    await selectValenceForAtom(page, 'V', 'Apply');
  });

  test('Add Radicals in modal and press Cancel', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The 'Radical' field is empty by default.
      The 'Radical' drop-down list contains parameters: blank, Monoradical, Diradical (singlet), Diradical (triplet).
      The 'Radical' field contains the selected parameter.
      The radical symbol does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectRadical(page, 'Monoradical', 'Cancel');
  });

  test('Add Radical in modal and press Apply', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The 'Radical' field is empty.
      The 'Radical' field contains the selected parameter.
      The symbol for the selected radical appears above. The selected parameter appears above the selected atom:
      Monoradical - one dot;
      Diradical (singlet) - two dots;
      Diradical (triplet) - two caret signs (^^).
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 1);
    await selectRadical(page, 'Monoradical', 'Apply');
  });

  test('Save structure with Radical information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-radicals.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-radicals-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-radicals-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Open the saved *.mol file and edit it', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1633
      Description: The saved *.mol file is opened correctly with applied atom properties and can be edited.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-radicals.mol',
      page,
    );
    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectRadical(page, 'Diradical (triplet)', 'Apply');
  });

  test('Typing in Radicals - three atoms through Label Edit modal', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1634
      Description: All selected atoms is replaced with the typed atom symbols and Radicals.
    */
    const timeout = 2000;
    const anyAtom = 2;
    const secondAnyAtom = 4;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await moveOnAtom(page, 'C', 0);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('O.');
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', anyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('N:');
    await pressButton(page, 'Apply');

    await moveOnAtom(page, 'C', secondAnyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('F^^');
    await pressButton(page, 'Apply');
  });

  test('Add Radicals value on different atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1635
      Description: The typed Valence value appears near the selected atoms only.
      Number is colored same as atoms.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/heteroatoms-structure.mol',
      page,
    );

    await page.keyboard.down('Shift');
    await clickOnAtom(page, 'S', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
    await page.keyboard.up('Shift');

    await doubleClickOnAtom(page, 'O', 0);

    await selectRadical(page, 'Diradical (triplet)', 'Apply');
  });

  test('Add Query specific - Ring bond count in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: The 'Ring bond count' drop-down list is present under 'Query specific'.
      The field is empty by default.
      The 'Ring bond count' drop-down list contains values: blank, As drawn, 0, 2, 3, 4 items.
      Blank, As drawn (solely those ring bond attachments that you see),
      0 (no ring bond attachments at the specified position),
      2 (two ring bond attachments - simple ring),
      3 (three ring bond attachments - fused rings),
      4 (at least four ring bond attachments - spiro or higher).
      The 'Ring bond count' field contains the selected value.
      The Ring bond count value does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectRingBondCount(page, 'As drawn', 'Cancel');
  });

  test('Add Query specific - Ring bond count in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: In the opened dialog verify that 'Ring bond count' field is empty.
      The 'Ring bond count' field contains the selected value.
      The selected Ring bond count - rb* - appears below the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 1);
    await selectRingBondCount(page, 'As drawn', 'Apply');
  });

  test('Save structure with Query specific - Ring bond count information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-ring-bond-count.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-ring-bond-count-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-ring-bond-count-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Open the saved *.mol file with Ring bond count and edit it', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1636
      Description: The saved *.mol file is opened correctly with applied atom properties and can be edited.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-ring-bond-count.mol',
      page,
    );
    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectRingBondCount(page, '3', 'Apply');
  });

  test('Typing the atom symbol with the different atom properties - three atoms through Label Edit modal', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1637
      Description: Several atoms are selected.
      All selected atoms are replaced with the correct atom symbol with the correct atom properties.
    */
    const timeout = 2000;
    const anyAtom = 2;
    const secondAnyAtom = 4;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await moveOnAtom(page, 'C', 0);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('15s^^2-');
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', anyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('209Pb:2+');
    await pressButton(page, 'Apply');

    await moveOnAtom(page, 'C', secondAnyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('22F.3+');
    await pressButton(page, 'Apply');
  });

  test('Ring bonds count - Representation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1638
      Description: Ring bond count atom property is displayed as specified from the menu item.
    */
    const anyAtom = 2;
    const secondAnyAtom = 3;
    const thirdAnyAtom = 4;
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await doubleClickOnAtom(page, 'C', 0);
    await selectRingBondCount(page, 'As drawn', 'Apply');

    await doubleClickOnAtom(page, 'C', 1);
    await selectRingBondCount(page, '0', 'Apply');

    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectRingBondCount(page, '2', 'Apply');

    await doubleClickOnAtom(page, 'C', secondAnyAtom);
    await selectRingBondCount(page, '3', 'Apply');

    await doubleClickOnAtom(page, 'C', thirdAnyAtom);
    await selectRingBondCount(page, '4', 'Apply');
  });

  test('Ring bonds count - Editing and Undo/Redo', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1639
      Description: Ring bond count atom property is displayed as specified from the menu item.
    */
    const anyAtom = 2;
    const secondAnyAtom = 3;
    const thirdAnyAtom = 4;
    const numberOfPress = 2;
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await doubleClickOnAtom(page, 'C', 0);
    await selectRingBondCount(page, 'As drawn', 'Apply');

    await doubleClickOnAtom(page, 'C', 1);
    await selectRingBondCount(page, '0', 'Apply');

    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectRingBondCount(page, '2', 'Apply');

    await doubleClickOnAtom(page, 'C', secondAnyAtom);
    await selectRingBondCount(page, '3', 'Apply');

    await doubleClickOnAtom(page, 'C', thirdAnyAtom);
    await selectRingBondCount(page, '4', 'Apply');

    await doubleClickOnAtom(page, 'C', 0);
    await selectRingBondCount(page, '3', 'Apply');

    for (let i = 0; i < numberOfPress; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
  });

  test('Add Query specific - Hydrogen count in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: 'Atom Properties' dialog is opened. The 'H count' drop-down list is present under
      'Query specific'. The field is empty by default.
      The 'H count' drop-down list contains values: 0, 1, 2, 3, 4.
      The value is selected. The 'H count' field contains the selected value.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectHCount(page, '0', 'Cancel');
  });

  test('Add Query specific - Hydrogen count in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: In the opened dialog the 'H count' field is empty.
      The 'H count' field contains the selected value.
      The selected hydrogen count value (H2) appears below/above the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectHCount(page, '2', 'Apply');
  });

  test('Add Query specific - Hydrogen count in modal and Edit', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: The newly selected hydrogen count is assigned to the carbon atom
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectHCount(page, '2', 'Apply');

    await doubleClickOnAtom(page, 'C', 0);
    await selectHCount(page, '4', 'Apply');
  });

  test('Save structure with Query specific - H count information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/chain-with-h-count.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-h-count-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-h-count-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Hydrogen count - Representation of blank selection', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1641
      Description: 'Atom Property' dialog is opened.
      Hydrogen count atom property is displayed as specified from the menu item.
      Nothing happens.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await page.getByText('Query specific').click();
    await page
      .locator('label')
      .filter({ hasText: 'H count', hasNotText: 'Implicit H count' })
      .getByRole('combobox', { name: '​' })
      .click();
    await page.locator('.MuiMenuItem-root').first().click();
    await pressButton(page, 'Apply');
  });

  test('Add Query specific - Substitution count in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1642
      Description: The Atom Properties dialog is opened.
      The 'Substitution count' drop-down list is present under 'Query specific'. The field is empty by default.
      The 'Substitution count' drop-down list contains values: blank, As drawn, 0, 1,  2, 3, 4, 5, 6.
      The 'Substitution count' field contains the selected value.
      The substitution count does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectSubstitutionCount(page, '0', 'Cancel');
  });

  test('Add Query specific - Substitution count in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1642
      Description: The 'Substitution count' field is empty.
      The 'Substitution count' field contains the selected value.
      The selected substitution count s* appears near the carbon
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectSubstitutionCount(page, '2', 'Apply');
  });

  test('Add Query specific - Substitution count in modal and Edit', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1642
      Description: The newly selected Substitution count is assigned to the carbon atom
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectSubstitutionCount(page, '2', 'Apply');

    await doubleClickOnAtom(page, 'C', 0);
    await selectSubstitutionCount(page, '4', 'Apply');
  });

  test('Save structure with Query specific - Substitution count information as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1640
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-substitution-count.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-substitution-count-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-substitution-count-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Substitution count - Representation of blank selection', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1643
      Description: The atom is selected.
      Number of nonhydrogen substituents is displayed as AtomSymbol(sN) where N depends on the number selected.
      Nothing is changed.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await page.getByText('Query specific').click();
    await page
      .locator('label')
      .filter({ hasText: 'Substitution count' })
      .getByRole('combobox', { name: '​' })
      .click();
    await page.locator('.MuiMenuItem-root').first().click();
    await pressButton(page, 'Apply');
  });

  test('Add Query specific - Unsaturated in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1649
      Description: The Atom Properties dialog is opened.
      The 'Unsaturated' checkbox is present in the 'Query specific' field. The checkbox is not set by default.
      The unsaturated mark does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectUnsaturated(page, 'Cancel');
  });

  test('Add Query specific - Unsaturated in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1649
      Description: In the opened dialog the 'Unsaturated' checkbox is not set.
      The 'Unsaturated' checkbox is set.
      The 'u' mark appears below the carbon atom.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectUnsaturated(page, 'Apply');
  });

  test('Add Query specific - Unsaturated in modal and Edit', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1649
      Description: The 'Unsaturated' dissapear from structure.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-unsaturated.mol',
      page,
    );

    await doubleClickOnAtom(page, 'C', anyAtom);
    await page.getByText('Query specific').click();
    await page.getByLabel('Unsaturated').uncheck();
    await pressButton(page, 'Apply');
  });

  test('Double click on the selected atom do not create error', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8931
      Description: Modal window opens without errors. All sections are displayed correctly.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', anyAtom);
  });

  test('Click Single Bond on Atom of Phosphorus', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4730
      Description: Bond attached to atom of Phosphorus.
    */
    await selectAtomInToolbar(AtomButton.Phosphorus, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectBond(BondTypeName.Single, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Typing atom symbols - Single selected atom (symbol has two letters)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-4222
      Description: "Label Edit" modal is opened, "F" symbol appeared in the "Atom" field.
      "E" symbol appeared in "Atom" field next to "F".
      Selected atom now has "Fe" label.
    */
    const timeout = 2000;
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await moveOnAtom(page, 'C', anyAtom);
    await page.mouse.down();
    await page.waitForTimeout(timeout);
    await page.getByLabel('Atom').fill('FE');
    await pressButton(page, 'Apply');
  });

  test('Colored atoms set - Mapping reaction', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1661
      Description: Mapping labels are colored with the same color as the colored atoms.
    */
    await openFileAndAddToCanvas(
      'Rxn-V2000/reaction-with-three-colored-atoms.rxn',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.ReactionMappingTool, page);

    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'F', 0);

    await clickOnAtom(page, 'O', 0);
  });

  test('Colored atoms - Applying of atom properties to colored atoms', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1657
      Description: All possible atom properties are applied to colored atoms. Displayed atom properties have the same color as the atom symbol.
      The selected atoms are copied and pasted to the canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/all-possible-atoms-properties.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('All atom properties information saved as *.mol file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1657
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/all-possible-atoms-properties.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/all-possible-atoms-properties-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/all-possible-atoms-properties-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('All atom properties information saved as *.rxn file', async ({
    page,
  }) => {
    // fails while Indigo loses valence in RxnFiles
    test.fail();
    /*
      Test case: EPMLSOPKET-1656
      Description: The structure is saved as *.rxn file.
    */
    await openFileAndAddToCanvas(
      'Rxn-V3000/all-possible-atoms-properties.rxn',
      page,
    );
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'Rxn-V3000/all-possible-atoms-properties-expected.rxn',
      expectedFile,
    );

    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEX = [2];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V3000/all-possible-atoms-properties-expected.rxn',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Add Reaction flags - Inversion (Inverts) in modal and press Cancel', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The 'Inversion' drop-down list contains stereoconfiguration parameters: blank, Inverts, Retains.
      The 'Inversion' field contains the selected value.
      The stereo mark does not appear near the carbon atom.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', 0);
    await selectReactionFlagsInversion(page, 'Inverts', 'Cancel');
  });

  test('Add Reaction flags - Inversion (Inverts) and Exact change in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The selected stereo mark appears near the carbon atom for
      Inverts - .Inv, ext.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectReactionFlagsInversion(page, 'Inverts');
    await selectExactChange(page, 'Apply');
  });

  test('Add Reaction flags - Inversion (Retains) and Exact change in modal and press Apply', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The selected stereo mark appears near the carbon atom for
      Retains - .Ret, ext.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await doubleClickOnAtom(page, 'C', anyAtom);
    await selectReactionFlagsInversion(page, 'Retains');
    await selectExactChange(page, 'Apply');
  });

  test('Reaction flags information saved as *.mol file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1650
      Description: The structure is saved as *.mol file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-rection-flags.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-rection-flags-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-rection-flags-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Add to canvas - List atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1658
      Description: The different List symbols are present on the canvas.
    */
    await selectThreeAtomsFromPeriodicTable(
      page,
      'List',
      'Ru 44',
      'Mo 42',
      'W 74',
      'Add',
    );
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Add to canvas - Not List atoms', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1658
      Description: The different Not List symbols are present on the canvas.
    */
    await selectThreeAtomsFromPeriodicTable(
      page,
      'Not List',
      'Ru 44',
      'Mo 42',
      'W 74',
      'Add',
    );
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Add to canvas - Generic Groups', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1659
      Description: The Generic Group symbol is present on the canvas.
    */
    await selectElementFromExtendedTable(page, 'G', 'Add');
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Add to canvas - Generic Groups and click on it', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1659
      Description: The Generic Group symbol is present in Atom Properties modal.
    */
    await selectElementFromExtendedTable(page, 'GH*', 'Add');
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('GH*').first().dblclick();
  });

  test('"Query properties" section with the contents of the "Query specific" drop-down list inside the "Edit" section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18033
      Description: All options match with the options from the ""Query specific"" drop-down list inside the ""Edit"" section.
    */
    const optionsToClick = [
      'Ring bond count',
      'H count',
      'Substitution count',
      'Unsaturated',
      'Implicit H count',
      'Aromaticity',
      'Ring membership',
      'Ring size',
      'Connectivity',
    ];

    const anyAtom = 2;
    await drawBenzeneRing(page);
    await clickOnAtom(page, 'C', anyAtom, 'right');
    await page.getByText('Query properties').click();

    for (const option of optionsToClick) {
      if (option === 'Unsaturated') {
        await page
          .locator('div')
          .filter({ hasText: /^Unsaturated$/ })
          .nth(0)
          .click();
      } else if (option === 'H count') {
        await page.getByText(option, { exact: true }).click();
      } else {
        await page.getByText(option).click();
      }
      await takeEditorScreenshot(page);
    }
  });

  test('The selection of an option inside the "Ring bond count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18034
      Description: All Ring bond count options added to Benzene structure.
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = ['As drawn-option', '3-option', '9-option'];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectRingBondCountOption(page, atomIndices[i], optionIndices[i]);
    }
  });

  test('The selection of an option inside the "H count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18035
      Description: All H count options added to Benzene structure.
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = [2, 5, 11];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectHCountOption(page, atomIndices[i], optionIndices[i]);
    }
  });

  test('The selection of an option inside the "Substitution count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18036
      Description: All Substitution count options added to Benzene structure.
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = [2, 5, 11];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectSubstitutionCountOption(
        page,
        atomIndices[i],
        optionIndices[i],
      );
    }
  });

  test('The selection of an option inside the "Unsaturated" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18070
      Description: All Unsaturated options added to Benzene structure.
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4];
    const selectedOption = ['Unsaturated', 'Saturated'];

    await openFileAndAddToCanvas('KET/benzene-unsaturated.ket', page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectUnsaturatedOption(page, atomIndices[i], selectedOption[i]);
    }
  });

  test('The selection of an option inside the "Implicit H count" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18067
      Description: All Implicit H count options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = [2, 5, 11];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectImplicitHCountOption(page, atomIndices[i], optionIndices[i]);
    }
  });

  test('The selection of an option inside the "Aromaticity" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18068
      Description: All Aromaticity options added to Benzene structure.
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4];
    const selectedOption = ['aromatic', 'aliphatic'];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectAromaticityOption(page, atomIndices[i], selectedOption[i]);
    }
  });

  test('The selection of an option inside the "Ring membership" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18069
      Description: All Ring membership options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = [2, 5, 11];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectRingMembershipOption(page, atomIndices[i], optionIndices[i]);
    }
  });

  test('The selection of an option inside the "Ring size" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18071
      Description: All Ring size options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = [2, 5, 11];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectRingSizeOption(page, atomIndices[i], optionIndices[i]);
    }
  });

  test('The selection of an option inside the "Connectivity" sub-section', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18075
      Description: All Connectivity options added to Benzene structure.
      Autotest working incorrect because we have bug: https://github.com/epam/ketcher/issues/3529
    */
    // eslint-disable-next-line no-magic-numbers
    const atomIndices = [2, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndices = [2, 5, 11];

    await drawBenzeneRing(page);

    for (let i = 0; i < atomIndices.length; i++) {
      await selectConnectivityOption(page, atomIndices[i], optionIndices[i]);
    }
  });

  test('Combination of different options from different sub-sections inside the "Query properties"', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-18038
      Description: All combinations options added to Benzene structure.
    */
    // eslint-disable-next-line no-magic-numbers
    const anyAtom = [0, 1, 2, 3, 4, 5];
    // eslint-disable-next-line no-magic-numbers
    const optionIndex = ['0-option', 2, 3, 'Unsaturated', 7, 'aliphatic'];

    await drawBenzeneRing(page);

    for (let i = 0; i < anyAtom.length; i++) {
      const atomIndex = anyAtom[i];
      const option = optionIndex[i];

      switch (i) {
        case 0:
          await selectRingBondCountOption(page, atomIndex, option as string);
          break;
        case 1:
          await selectHCountOption(page, atomIndex, option as number);
          break;
        // eslint-disable-next-line no-magic-numbers
        case 2:
          await selectSubstitutionCountOption(
            page,
            atomIndex,
            option as number,
          );
          break;
        // eslint-disable-next-line no-magic-numbers
        case 3:
          await selectUnsaturatedOption(page, atomIndex, option as string);
          break;
        // eslint-disable-next-line no-magic-numbers
        case 4:
          await selectImplicitHCountOption(page, atomIndex, option as number);
          break;
        // eslint-disable-next-line no-magic-numbers
        case 5:
          await selectAromaticityOption(page, atomIndex, option as string);
          break;
        default:
          break;
      }
    }
  });
});
