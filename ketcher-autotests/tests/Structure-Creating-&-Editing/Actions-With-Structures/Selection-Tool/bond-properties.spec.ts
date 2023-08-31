/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  BondType,
  doubleClickOnBond,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  LeftPanelButton,
  openFileAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  RingButton,
  saveToFile,
  selectAllStructuresOnCanvas,
  selectLeftPanelButton,
  selectRingButton,
  takeEditorScreenshot,
} from '@utils';
import { getMolfile, getRxn } from '@utils/formats';

async function selectDoubleOption(page: Page) {
  await page.getByText('Single').click();
  await page.getByRole('option', { name: 'Double', exact: true }).click();
}

test.describe('Bond Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('ond properties dialog: verification', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1457
      Description: The modal 'Bond Properties' dialog is opened and contains drop-down lists: Type, Topology and Reacting Center.
      Cancel and OK buttons are active.
      By default the dialog fields are filled with data:
      Type - 'type of the selected bond',
      Topology - 'Either',
      Reacting Center - 'Unmarked'.
    */
    await openFileAndAddToCanvas('benzene-ring-with-two-atoms.ket', page);
    await doubleClickOnBond(page, BondType.DOUBLE, 1);
  });

  test('`Type` field: verification - 1/3 navigate with down and up', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1458(1)
        Description: 'Type' field contain the correct bond type: if you click the single bond, 
        the field should contain 'Single', 
        if you click the double bond, the field should contain 'Double', etc.
        The drop-down list contains all possible bond types (simple bonds, stereobonds, query bonds): 
        Single, Single Up, Single Down, Single Up/Down, Double, Double Cis/Trans, Triple, Aromatic, 
        Any, Single/Double, Single/Aromatic, Double/Aromatic.
        User is able to select any bond type.
        It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
        User is able to select the Type by typing the A, D, S, T letters 
        (first letters of the bond types in the list).
      */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.DOUBLE, 2);
    await page.getByText('Double').click();
    let i = 0;
    while (i < 5) {
      await page.keyboard.press('ArrowDown');
      i++;
    }

    while (i < 7) {
      await page.keyboard.press('ArrowUp');
      i++;
    }
  });

  test('`Type` field: verification - 2/3 navigate with s', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1458(2)
        Description: 'Type' field contain the correct bond type: if you click the single bond, 
        the field should contain 'Single', 
        if you click the double bond, the field should contain 'Double', etc.
        The drop-down list contains all possible bond types (simple bonds, stereobonds, query bonds): 
        Single, Single Up, Single Down, Single Up/Down, Double, Double Cis/Trans, Triple, Aromatic, 
        Any, Single/Double, Single/Aromatic, Double/Aromatic.
        User is able to select any bond type.
        It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
        User is able to select the Type by typing the A, D, S, T letters 
        (first letters of the bond types in the list).
      */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.DOUBLE, 2);
    await page.getByText('Double').click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('s');
      i++;
    }
  });

  test('`Type` field: verification - 3/3 navigate with t', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1458(2)
        Description: 'Type' field contain the correct bond type: if you click the single bond, 
        the field should contain 'Single', 
        if you click the double bond, the field should contain 'Double', etc.
        The drop-down list contains all possible bond types (simple bonds, stereobonds, query bonds): 
        Single, Single Up, Single Down, Single Up/Down, Double, Double Cis/Trans, Triple, Aromatic, 
        Any, Single/Double, Single/Aromatic, Double/Aromatic.
        User is able to select any bond type.
        It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
        User is able to select the Type by typing the A, D, S, T letters 
        (first letters of the bond types in the list).
      */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.DOUBLE, 2);
    await page.getByText('Double').click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('t');
      i++;
    }
  });

  const types = [
    'Single',
    'Single Up',
    'Single Down',
    'Single Up/Down',
    'Double Cis/Trans',
    'Triple',
    'Aromatic',
    'Any',
    'Hydrogen',
    'Single/Double',
    'Single/Aromatic',
    'Double/Aromatic',
    'Dative',
  ];

  for (const type of types) {
    test(`Change 'Type' field value to ${type} type`, async ({ page }) => {
      /*
            Test case: EPMLSOPKET-1459
            Description: Any bond can be changed with any bond type selected in the 'Type' list.
            *.mol file is correctly opened in Ketcher, applied bond property is correctly represented.
          */
      await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
      await doubleClickOnBond(page, BondType.DOUBLE, 2);
      await page.getByText('Double').click();
      await page.getByRole('option', { name: type, exact: true }).click();
      await pressButton(page, 'Apply');
    });
  }
  test(`Change 'Type' field value to Double type`, async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1459
          Description: Any bond can be changed with any bond type selected in the 'Type' list.
          *.mol file is correctly opened in Ketcher, applied bond property is correctly represented.
        */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.SINGLE, 2);
    await selectDoubleOption(page);
    await pressButton(page, 'Apply');
  });

  test(`Change 'Type' field value - save`, async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1459
     * Description: The saved structure is correctly rendered on the canvas
     * */

    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.SINGLE, 2);
    await selectDoubleOption(page);
    await pressButton(page, 'Apply');

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/mol_1459_to_open-expected.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/mol_1459_to_open-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test(`'Topology' field: verification - 1/2 navigate with down and up`, async ({
    page,
  }) => {
    /*
          Test case: EPMLSOPKET-1460(1)
          Description: 'Topology' field contains 'Either' item by default.
          The drop-down list contains: Either, Ring, Chain.
          User is able to select any bond topology parameter.
          It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
          User is able to select the Topology by typing the E, C, R letters.
        */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.DOUBLE, 2);
    await page.getByText('Either').click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('ArrowDown');
      i++;
    }

    while (i < 3) {
      await page.keyboard.press('ArrowUp');
      i++;
    }
  });

  const tLetters = ['R', 'C', 'E'];
  for (const letter of tLetters) {
    test(`'Topology' field: verification - 2/2 with letter '${letter}'`, async ({
      page,
    }) => {
      /*
          Test case: EPMLSOPKET-1460(2)
          Description: 'Topology' field contains 'Either' item by default.
          The drop-down list contains: Either, Ring, Chain.
          User is able to select any bond topology parameter.
          It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
          User is able to select the Topology by typing the E, C, R letters.
        */
      await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
      await doubleClickOnBond(page, BondType.DOUBLE, 2);
      await page.getByText('Either').click();
      await page.keyboard.press(letter);
    });
  }

  test(`Change 'Topology' field value - 1/2 save`, async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1461(1)
          Description: Any bond can be marked with any bond topology mark selected in the 'Topology' list.
          The 'rng' or 'chn' mark appears on the selected bond.
          If the 'Either' parameter is selected in the 'Topology' list, 
          no any mark
           should appear on the unmarked bond or topology mark should be removed 
          from the marked with 'rng' or 'chn' bond.
          *.mol file should be correctly opened, applied bond property should be correctly represented.
        */

    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.SINGLE, 2);
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Ring', exact: true }).click();
    await pressButton(page, 'Apply');

    await doubleClickOnBond(page, BondType.SINGLE, 1);
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Chain', exact: true }).click();
    await pressButton(page, 'Apply');

    await doubleClickOnBond(page, BondType.DOUBLE, 1);
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Chain', exact: true }).click();
    await pressButton(page, 'Apply');

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/mol_1461_to_open-expected.mol',
      expectedFile,
    );
  });

  test(`Change 'Topology' field value - 2/2 open`, async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1861(2)
     * Description: The saved structure is correctly rendered on the canvas
     */

    await openFileAndAddToCanvas(
      'Molfiles-V2000/mol_1461_to_open-expected.mol',
      page,
    );

    await doubleClickOnBond(page, BondType.SINGLE, 1);
    await page.getByText('Chain').click();
    await page.getByRole('option', { name: 'Either', exact: true }).click();
    await pressButton(page, 'Apply');
  });

  test(`'Reacting Center' field: verification - 1/2 navigate with down and up`, async ({
    page,
  }) => {
    /*
          Test case: EPMLSOPKET-1462(1)
          Description: 'Reacting Center' field contains 'Unmarked' item by default.
          The drop-down list contains: Unmarked, Not center, Center, No change, Made/broken, Order changes, Made/broken and changes.
          User able to select any mark for the reacting center from drop-down list.
          It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
          User is able to select the Reacting Center by typing the N, C, M, O, U letters.
        */

    await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
    await doubleClickOnBond(page, BondType.DOUBLE, 2);
    await page.getByText('Unmarked').click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('ArrowDown');
      i++;
    }

    while (i < 3) {
      await page.keyboard.press('ArrowUp');
      i++;
    }
  });

  const rCLetters = ['N', 'C', 'M', 'O', 'U'];
  for (const letter of rCLetters) {
    test(`'Reacting Center' field: verification - 2/2 with letter '${letter}'`, async ({
      page,
    }) => {
      /*
          Test case: EPMLSOPKET-1462(2)
          Description: 'Topology' field contains 'Either' item by default.
          The drop-down list contains: Either, Ring, Chain.
          User is able to select any bond topology parameter.
          It is possible to navigate through the list with the Arrow Down / Up keyboard buttons.
          User is able to select the Topology by typing the E, C, R letters.
        */
      await openFileAndAddToCanvas('Molfiles-V2000/benzene.mol', page);
      await doubleClickOnBond(page, BondType.DOUBLE, 2);
      await page.getByText('Unmarked').click();
      await page.keyboard.press(letter);
    });
  }

  const rCOptions = [
    'Not center',
    'Center',
    'No change',
    'Made/broken',
    'Order changes',
    'Made/broken and changes',
    'Unmarked',
  ];

  test.fixme(
    `Change 'Reacting Center' field value - 1/2 edit and save`,
    async ({ page }) => {
      /*
          Test case: EPMLSOPKET-1463(1)
          Description: * Any bond can be marked with any Reacting Center mark selected in the 'Reacting Center' list.
          The next mark should appear on the selected bond:
          Unmarked - no any mark;
          Not center - cross (X);
          Center - hash sign (#);
          No change - no mark;
          Made/broken - two lines (//);
          Order changes - one line ( / );
          Made/broken and changes - three lines (///).
          If the 'Unmarked' parameter is selected in the 'Reacting Center' list, 
          no any mark appears on the unmarked bond or mark for reacting center is removed from the marked bond.
          *.rxn file is correctly opened in Ketcher, applied bond property is correctly represented.
          Note: in some applications the 'No center' parameter has the mark - dot, so you see that mark!

          Now it doesn`t work because if we try to save bond with 'Not center' option, 
          we can`t  open the file
        */

      await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);

      for (let i = 0; i < rCOptions.length - 1; i++) {
        await doubleClickOnBond(page, BondType.SINGLE, i);
        await page.getByText('Unmarked').click();
        await page
          .getByRole('option', { name: rCOptions[i], exact: true })
          .click();
        await pressButton(page, 'Apply');
      }

      await doubleClickOnBond(page, BondType.SINGLE, 8);
      await page.getByText('Unmarked').click();
      await page.getByRole('option', { name: 'Center', exact: true }).click();
      await pressButton(page, 'Apply');

      await doubleClickOnBond(page, BondType.SINGLE, 8);
      await page.getByText('Center', { exact: true }).click();
      await page.getByRole('option', { name: 'Unmarked', exact: true }).click();
      await pressButton(page, 'Apply');

      const expectedFile = await getRxn(page, 'v2000');
      await saveToFile('Rxn-V2000/rxn-1463-to-open-expected.rxn', expectedFile);

      const METADATA_STRING_INDEX = [2, 7, 25, 40, 66];

      const { fileExpected: rxnFileExpected, file: rxnFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/Rxn-V2000/rxn-1463-to-open-expected.rxn',
          metaDataIndexes: METADATA_STRING_INDEX,
          fileFormat: 'v2000',
        });

      expect(rxnFile).toEqual(rxnFileExpected);
    },
  );

  test.fixme(
    `Change 'Reacting Center' field value - 2/2 open and edit`,
    async ({ page }) => {
      /*
        Test case: EPMLSOPKET-1463(2)
        Description: Open and edit

        Now it doesn`t work because if we try to save bond with 'Not center' option, 
        we can`t  open the file
    */

      await openFileAndAddToCanvas(
        'Rxn-V2000/rxn-1463-to-open-expected.rxn',
        page,
      );
      await doubleClickOnBond(page, BondType.SINGLE, 8);
      await page.getByText('Unmarked').click();
      await page.getByRole('option', { name: 'Center', exact: true }).click();
      await pressButton(page, 'Apply');
    },
  );

  test('Apply for all selected bonds', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-2926
        Description: All structure is highlighted green color.
        'Bond properties' window is opened.  
        All selected bonds are changed with 'Double' bond.
        'Bond properties' window is opened. 
        All selected bonds are changed. Bonds that were not selected are not changed.
        Selected bonds are highlighted green color.
        'Bond properties' window is opened. 
        All selected bonds are changed. Bonds that were not selected are not changed.
        Selected bonds are highlighted green color.
 */

    await openFileAndAddToCanvas('Molfiles-V2000/mol_2926_to_open.mol', page);
    await selectAllStructuresOnCanvas(page);
    await doubleClickOnBond(page, BondType.SINGLE, 1);
    await selectDoubleOption(page);
    await pressButton(page, 'Apply');

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const offset = 100;

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.mouse.move(x - offset, y - offset);
    await dragMouseTo(x + offset, y + offset, page);

    await doubleClickOnBond(page, BondType.DOUBLE, 3);
    await page.getByText('Double').click();
    await page.getByRole('option', { name: 'Single', exact: true }).click();
    await pressButton(page, 'Apply');

    await doubleClickOnBond(page, BondType.SINGLE, 1);
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Chain', exact: true }).click();
    await pressButton(page, 'Apply');

    await doubleClickOnBond(page, BondType.SINGLE, 1);
    await page.getByText('Unmarked').click();
    await page.getByRole('option', { name: 'Center', exact: true }).click();
    await pressButton(page, 'Apply');
  });

  test(`Different combinations - 1/3 edit a chain and save .mol file`, async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1465
        Description: User is able to change the bond properties at a time.
        All selected properties are assigned to the selected bond.
        *.mol and *.rxn files correctly opened, applied atom property correctly represented.
    */

    await openFileAndAddToCanvas('Molfiles-V2000/mol_2926_to_open.mol', page);

    await doubleClickOnBond(page, BondType.SINGLE, 1);
    await selectDoubleOption(page);
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Chain', exact: true }).click();
    await page.getByText('Unmarked').click();
    await page.getByRole('option', { name: 'Center', exact: true }).click();
    await pressButton(page, 'Apply');

    await doubleClickOnBond(page, BondType.SINGLE, 2);
    await page.getByText('Single').click();
    await page.getByRole('option', { name: 'Single Up', exact: true }).click();
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Ring', exact: true }).click();
    await page.getByText('Unmarked').click();
    await page.getByRole('option', { name: 'No change', exact: true }).click();
    await pressButton(page, 'Apply');

    await doubleClickOnBond(page, BondType.SINGLE, 4);
    await page.getByText('Single').click();
    await page.getByRole('option', { name: 'Single Up', exact: true }).click();
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Chain', exact: true }).click();
    await page.getByText('Unmarked').click();
    await page
      .getByRole('option', { name: 'Made/broken', exact: true })
      .click();
    await pressButton(page, 'Apply');

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/mol_1465_to_open-expected.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/mol_1465_to_open-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test(`Different combinations - 2/3 open the saved .mol file`, async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1465
        Description: User is able to change the bond properties at a time.
        All selected properties are assigned to the selected bond.
        *.mol and *.rxn files correctly opened, applied atom property correctly represented.
    */

    await openFileAndAddToCanvas(
      'Molfiles-V2000/mol_1465_to_open-expected.mol',
      page,
    );
    await doubleClickOnBond(page, BondType.SINGLE, 5);
    await page.getByText('Single').click();
    await page.getByRole('option', { name: 'Single Up', exact: true }).click();
    await page.getByText('Either').click();
    await page.getByRole('option', { name: 'Chain', exact: true }).click();
    await page.getByText('Unmarked').click();
    await page.getByRole('option', { name: 'No change', exact: true }).click();
    await pressButton(page, 'Apply');

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(x, y + 30);
    dragMouseTo(x + 100, y + 100, page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);

    await selectRingButton(RingButton.Benzene, page);
    await page.mouse.click(x + 150, y + 150);

    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('Rxn-V2000/rxn-1465-to-open-expected.rxn', expectedFile);

    const METADATA_STRING_INDEX = [2, 7, 34];

    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/rxn-1465-to-open-expected.rxn',
        metaDataIndexes: METADATA_STRING_INDEX,
        fileFormat: 'v2000',
      });

    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test(`Different combinations - 3/3 open the saved *.rxn and edit it`, async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1465
        Description: User is able to change the bond properties at a time.
        All selected properties are assigned to the selected bond.
        *.mol and *.rxn files correctly opened, applied atom property correctly represented.
  */
    await openFileAndAddToCanvas(
      'Rxn-V2000/rxn-1465-to-open-expected.rxn',
      page,
    );
    await doubleClickOnBond(page, BondType.SINGLE, 10);
    await selectDoubleOption(page);
    await pressButton(page, 'Apply');
  });
});
