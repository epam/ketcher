/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  clickOnCanvas,
  delay,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  MolFileFormat,
  openFileAndAddToCanvas,
  RxnFileFormat,
  takeEditorScreenshot,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import {
  BondTypeOption,
  BondTopologyOption,
  BondReactingCenterOption,
} from '@tests/pages/constants/bondProperties/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

test.describe('Bond Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Bond properties dialog: verification', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1457
      Description: The modal 'Bond Properties' dialog is opened and contains drop-down lists: Type, Topology and Reacting Center.
      Cancel and OK buttons are active.
      By default the dialog fields are filled with data:
      Type - 'type of the selected bond',
      Topology - 'Either',
      Reacting Center - 'Unmarked'.
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');
    await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
    await BondPropertiesDialog(page).bondTypeDropdown.click();
    let i = 0;
    while (i < 5) {
      await page.keyboard.press('ArrowDown');
      await delay(0.1);
      i++;
    }

    while (i < 7) {
      await page.keyboard.press('ArrowUp');
      await delay(0.1);
      i++;
    }
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
    await BondPropertiesDialog(page).bondTypeDropdown.click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('s');
      i++;
    }
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
    await BondPropertiesDialog(page).bondTypeDropdown.click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('t');
      i++;
    }
    await takeEditorScreenshot(page);
  });

  const types = [
    ['Single', BondTypeOption.Single],
    ['Single Up', BondTypeOption.SingleUp],
    ['Single Down', BondTypeOption.SingleDown],
    ['Single Up/Down', BondTypeOption.SingleUpDown],
    ['Double Cis/Trans', BondTypeOption.DoubleCisTrans],
    ['Triple', BondTypeOption.Triple],
    ['Aromatic', BondTypeOption.Aromatic],
    ['Any', BondTypeOption.Any],
    ['Hydrogen', BondTypeOption.Hydrogen],
    ['Single/Double', BondTypeOption.SingleDouble],
    ['Single/Aromatic', BondTypeOption.SingleAromatic],
    ['Double/Aromatic', BondTypeOption.DoubleAromatic],
    ['Dative', BondTypeOption.Dative],
  ];

  for (const type of types) {
    test(`Change 'Type' field value to ${type[0]} type`, async ({ page }) => {
      /*
            Test case: EPMLSOPKET-1459
            Description: Any bond can be changed with any bond type selected in the 'Type' list.
            *.mol file is correctly opened in Ketcher, applied bond property is correctly represented.
          */
      await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
      await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
      await BondPropertiesDialog(page).setOptions({
        type: type[1] as BondTypeOption,
      });
      await takeEditorScreenshot(page);
    });
  }
  test(`Change 'Type' field value to Double type`, async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1459
          Description: Any bond can be changed with any bond type selected in the 'Type' list.
          *.mol file is correctly opened in Ketcher, applied bond property is correctly represented.
        */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 8 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Double,
    });
    await takeEditorScreenshot(page);
  });

  test(`Change 'Type' field value - save`, async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1459
     * Description: The saved structure is correctly rendered on the canvas
     * */

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 8 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Double,
    });
    await verifyFileExport(
      page,
      'Molfiles-V2000/mol_1459_to_open-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
    await BondPropertiesDialog(page).bondTopologyDropdown.click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('ArrowDown');
      i++;
    }

    while (i < 3) {
      await page.keyboard.press('ArrowUp');
      i++;
    }
    await takeEditorScreenshot(page);
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
      await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
      await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
      await BondPropertiesDialog(page).bondTopologyDropdown.click();
      await page.keyboard.press(letter);
      await takeEditorScreenshot(page);
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

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 8 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Ring,
    });
    await getBondLocator(page, { bondId: 6 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Chain,
    });

    await getBondLocator(page, { bondId: 11 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Chain,
    });

    await verifyFileExport(
      page,
      'Molfiles-V2000/mol_1461_to_open-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test(`Change 'Topology' field value - 2/2 open`, async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1861(2)
     * Description: The saved structure is correctly rendered on the canvas
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/mol_1461_to_open-expected.mol',
    );

    await getBondLocator(page, { bondId: 6 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Either,
    });
    await takeEditorScreenshot(page);
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

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
    await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
    await BondPropertiesDialog(page).bondReactingCenterDropdown.click();
    let i = 0;
    while (i < 2) {
      await page.keyboard.press('ArrowDown');
      i++;
    }

    while (i < 3) {
      await page.keyboard.press('ArrowUp');
      i++;
    }
    await takeEditorScreenshot(page);
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
      await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene.mol');
      await getBondLocator(page, { bondId: 7 }).dblclick({ force: true });
      await BondPropertiesDialog(page).bondReactingCenterDropdown.click();
      await page.keyboard.press(letter);
      await takeEditorScreenshot(page);
    });
  }

  const rCOptions = [
    BondReactingCenterOption.NotCenter,
    BondReactingCenterOption.Center,
    BondReactingCenterOption.NoChange,
    BondReactingCenterOption.MadeBroken,
    BondReactingCenterOption.OrderChanges,
    BondReactingCenterOption.MadeBrokenAndChanges,
    BondReactingCenterOption.Unmarked,
  ];

  const bondIds = [22, 18, 19, 24, 25, 26, 20];

  test(`Change 'Reacting Center' field value - 1/2 edit and save`, async ({
    page,
  }) => {
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

    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');

    for (let i = 0; i < bondIds.length; i++) {
      await getBondLocator(page, { bondId: bondIds[i] }).dblclick({
        force: true,
      });
      await BondPropertiesDialog(page).setOptions({
        reactingCenter: rCOptions[i],
      });
    }
    await getBondLocator(page, { bondId: 29 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      reactingCenter: BondReactingCenterOption.Center,
    });

    await getBondLocator(page, { bondId: 29 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      reactingCenter: BondReactingCenterOption.Unmarked,
    });

    await verifyFileExport(
      page,
      'Rxn-V2000/rxn-1463-to-open-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test(`Change 'Reacting Center' field value - 2/2 open and edit`, async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1463(2)
        Description: Open and edit
    */

    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/rxn-1463-to-open-expected.rxn',
    );
    await getBondLocator(page, { bondId: 29 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      reactingCenter: BondReactingCenterOption.Center,
    });
    await takeEditorScreenshot(page);
  });

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

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/mol_2926_to_open.mol');
    await selectAllStructuresOnCanvas(page);
    await getBondLocator(page, { bondId: 10 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Double,
    });

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const offset = 100;

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.mouse.move(x - offset, y - offset);
    await dragMouseTo(x + offset, y + offset, page);

    await getBondLocator(page, { bondId: 12 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Single,
    });

    await getBondLocator(page, { bondId: 12 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      topology: BondTopologyOption.Chain,
    });

    await getBondLocator(page, { bondId: 12 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      reactingCenter: BondReactingCenterOption.Center,
    });
    await takeEditorScreenshot(page);
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

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/mol_2926_to_open.mol');

    await getBondLocator(page, { bondId: 11 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Double,
      topology: BondTopologyOption.Chain,
      reactingCenter: BondReactingCenterOption.Center,
    });

    await getBondLocator(page, { bondId: 13 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleUp,
      topology: BondTopologyOption.Ring,
      reactingCenter: BondReactingCenterOption.NoChange,
    });

    await getBondLocator(page, { bondId: 15 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleUp,
      topology: BondTopologyOption.Chain,
      reactingCenter: BondReactingCenterOption.MadeBroken,
    });
    await verifyFileExport(
      page,
      'Molfiles-V2000/mol_1465_to_open-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test(`Different combinations - 2/3 open the saved .mol file`, async ({
    page,
  }) => {
    /*
     * Test case: EPMLSOPKET-1465
     * Description: User is able to change the bond properties at a time.
     * All selected properties are assigned to the selected bond.
     * *.mol and *.rxn files correctly opened, applied atom property correctly represented.
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/mol_1465_to_open-expected.mol',
    );
    await getBondLocator(page, { bondId: 16 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.SingleUp,
      topology: BondTopologyOption.Chain,
      reactingCenter: BondReactingCenterOption.NoChange,
    });

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(x, y + 30);
    dragMouseTo(x + 100, y + 100, page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, x + 150, y + 150, { from: 'pageTopLeft' });

    await verifyFileExport(
      page,
      'Rxn-V2000/rxn-1465-to-open-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
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
      page,
      'Rxn-V2000/rxn-1465-to-open-expected.rxn',
    );
    await getBondLocator(page, { bondId: 31 }).dblclick({ force: true });
    await BondPropertiesDialog(page).setOptions({
      type: BondTypeOption.Double,
    });
    await takeEditorScreenshot(page);
  });
});
