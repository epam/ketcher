/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { Page, test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { bondMonomerPointToMoleculeAtom } from '@tests/utils/macromolecules/polymerBond';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { setAttachmentPoints } from '@tests/pages/molecules/canvas/AttachmentPointsDialog';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import {
  Arrows,
  copyToClipboardByKeyboard,
  getCoordinatesOfTheMiddleOfTheScreen,
  pasteFromClipboardByKeyboard,
  openFileAndAddToCanvasAsNewProject,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  pasteFromClipboardAndAddToCanvas,
  takeElementScreenshot,
  takeEditorScreenshot,
  dragMouseTo,
  clickInTheMiddleOfTheCanvas,
  takeTopToolbarScreenshot,
  setMolecule,
} from '@utils';
import {
  pasteFromClipboardAndOpenAsNewProject,
  readFileContent,
} from '@utils/files/readFile';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { getArrowLocator } from '@utils/canvas/arrow-signes/getArrow';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  AttachmentPoint,
  createRNAAntisenseChain,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import {
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { collapseMonomers } from '@utils/canvas/monomer/helpers';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { AbbreviationPreviewTooltip } from '@tests/pages/molecules/canvas/AbbreviationPreviewTooltip';

let page: Page;

test.describe('Bugs: ketcher-3.12.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 — Right-click copy option does not work for microstructures on macro canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9125
     * Bug: https://github.com/epam/ketcher/issues/7325
     * Description: Right-click copy option does not work for microstructures on macro canvas
     * Scenario:
     * 1. Add Benzene ring in Micro mode
     * 2. Switch to Macro mode
     * 3. Check that copy button is enabled
     *
     * Version 3.12.0
     */
    await drawBenzeneRing(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();
    expect(
      await ContextMenu(page, targetAtom).isOptionEnabled(MonomerOption.Copy),
    ).toBeTruthy();
  });

  test('Case 2 — Ketcher wrongly considers R3-R1 connection between unknown sugar and/or unknown base as side chain connection', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/Indigo/issues/2836
     * Bug: https://github.com/epam/ketcher/issues/7255
     * Description: Ketcher wrongly considers R3-R1 connection between unknown sugar and/or unknown base as side chain connection
     * Scenario:
     * 1. Go to Macromolecules mode - Snake mode (empty canvas!)
     * 2. Load from HELM: RNA1{[Unknown sugar](A)P.R([Unknown base])P.[Unknown sugar]([Unknown base])P.[Unknown sugar](A)[Unknown phosphate].R([Unknown base])[Unknown phosphate].[Unknown sugar]C.([Unknown base])[Unknown phosphate].[Unknown sugar](A)}|RNA2{R([Unknown base])}|RNA3{[Unknown sugar]([Unknown base])}$RNA1,RNA2,19:R2-1:R1|RNA2,RNA3,1:R2-1:R1$$$V2.0
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Unknown sugar](A)P.R([Unknown base])P.[Unknown sugar]([Unknown base])P.[Unknown sugar]C.(A)[Unknown phosphate].R([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A)}|RNA2{R([Unknown base])}|RNA3{[Unknown sugar]([Unknown base])}$RNA1,RNA2,19:R2-1:R1|RNA2,RNA3,1:R2-1:R1$$$V2.0',
    );
    await clickInTheMiddleOfTheCanvas(page);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'C' }),
      { padding: 180 },
    );
  });

  test('Case 3 — Unknown peptide looks like chem', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/Indigo/issues/2836
     * Bug: https://github.com/epam/ketcher/issues/7190
     * Description: Ketcher wrongly considers R3-R1 connection between unknown sugar and/or unknown base as side chain connection
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode (empty canvas)
     * 2. Load from HELM: PEPTIDE1{Aaaa}$$$$V2.0
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Aaaa}$$$$V2.0',
    );
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Aaaa' }),
    );
  });

  test('Case 4 — Unknown sugar, unknown base and unknown phosphate looks like chems', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/Indigo/issues/2836
     * Bug: https://github.com/epam/ketcher/issues/7188
     * Description: Ketcher wrongly considers R3-R1 connection between unknown sugar and/or unknown base as side chain connection
     * Scenario:
     * 1. Go to Macromolecules mode - Library
     * 2. Load from HELM: RNA1{Raaa(Aaaa)Paaa}$$$$V2.0
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{Raaa(Aaaa)Paaa}$$$$V2.0',
    );
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Raaa' }),
      { padding: 70 },
    );
  });

  test('Case 5 — Deleting one of multiple monomers does not trigger recalculation in Calculate Properties window', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5727
     * Bug: https://github.com/epam/ketcher/issues/7123
     * Description: Ketcher wrongly considers R3-R1 connection between unknown sugar and/or unknown base as side chain connection
     * Scenario:
     * 1. Place two peptide monomers on the canvas (e.g., A and 1Nal).
     * 2. Open the Calculate Properties window.
     * 3. Select one of the monomers (e.g., A) and press Delete.
     * 4. Observe the data in the Calculate Properties window.
     *
     * Version 3.12.0
     */
    await Library(page).switchToPeptidesTab();
    await Library(page).clickMonomerAutochain(Peptide.A);
    await Library(page).clickMonomerAutochain(Peptide._1Nal);
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).isVisible();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    await getMonomerLocator(page, { monomerAlias: 'A' }).click();
    await CommonLeftToolbar(page).erase();
    await page.waitForTimeout(1000);
    await expect(
      await CalculateVariablesPanel(page).getMolecularMassValue(),
    ).toBe('215.252');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 6 — Sense chain monomers remain selected FOREVER after antisense chain creation', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6317
     * Bug: https://github.com/epam/ketcher/issues/6847
     * Description: Sense chain monomers remain selected FOREVER after antisense chain creation
     * Scenario:
     * 1. Go to Macromolecules and Switch to Flex layout mode (clean canvas)
     * 2. Paste the following HELM string to the clean canvas: RNA1{[dR](T)P.[dR](A)P.[dR](T)P.[dR](A)P.[dR](A,T)P.[dR](A)P.[dR](A,T)P}$$$$V2.0
     * 3. Select all monomers by holding the left mouse button and dragging a selection box around them until they all become highlighted in green.
     * 4. Open the context menu by right-clicking (RMB) on the selected monomers and choose “Create Antisense RNA Strand”.
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](T)P.[dR](A)P.[dR](T)P.[dR](A)P.[dR](A,T)P.[dR](A)P.[dR](A,T)P}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const monomer = getMonomerLocator(page, { monomerAlias: 'W' }).first();
    await createRNAAntisenseChain(page, monomer);
    await CommonLeftToolbar(page).handTool();
    await takeElementScreenshot(page, monomer, { padding: 300 });
  });

  test('Case 7 — Long bond for antisense layouted wrong', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6284
     * Bug: https://github.com/epam/ketcher/issues/6614
     * Description: Sense chain monomers remain selected FOREVER after antisense chain creation
     * Scenario:
     * 1. Go to Macromolecules and Switch to Flex layout mode (clean canvas)
     * 2. Paste the following HELM string to the clean canvas: RNA1{[dR](T)P.[dR](A)P.[dR](T)P.[dR](A)P.[dR](A,T)P.[dR](A)P.[dR](A,T)P}$$$$V2.0
     * 3. Select all monomers by holding the left mouse button and dragging a selection box around them until they all become highlighted in green.
     * 4. Open the context menu by right-clicking (RMB) on the selected monomers and choose “Create Antisense RNA Strand”.
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)[bnn]}|RNA2{R(C)P.R(A)}|RNA3{R(U)P.R(U)}|PEPTIDE1{E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E}|PEPTIDE2{E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E.E}$RNA2,RNA3,5:pair-2:pair|RNA1,RNA3,2:pair-5:pair|RNA3,PEPTIDE1,4:R2-1:R1|RNA2,PEPTIDE2,1:R1-21:R2|PEPTIDE2,RNA1,1:R1-3:R2$$$V2.0',
    );
    await clickOnCanvas(page, 300, 300);
    await page.mouse.wheel(0, 1000);
    const monomer = getMonomerLocator(page, { monomerAlias: 'bnn' });
    await takeElementScreenshot(page, monomer, {
      padding: 100,
    });
  });

  test('Case 8 — Bonds overlap atoms after clearing the canvas and using Undo in Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6027
     * Bug: https://github.com/epam/ketcher/issues/6238
     * Description: Bonds overlap atoms after clearing the canvas and using Undo in Macro mode
     * Scenario:
     * 1. Open a structure in Micro mode ketcher - bonds_overlap_atoms_bugfix.ket
     * 2. Switch to Macro mode
     * 3. Clear canvas using the Erase tool
     * 4. Press the Undo button to restore the previous state
     * 5. Observe the alignment of bonds and atoms in restored structure
     *
     * Version 3.12.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/bonds_overlap_atoms_bugfix.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopLeftToolbar(page).undo();
    await takeElementScreenshot(
      page,
      getAtomLocator(page, { atomIsotopeAtomicMass: 2 }),
      { padding: 220 },
    );
  });

  test('Case 9 — Cycled aromatic bond looks wrong on Macro canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6028
     * Bug: https://github.com/epam/ketcher/issues/6236
     * Description: Cycled aromatic bond looks wrong on Macro canvas
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from Extended SMILES: c1ccccc1.C1=CC=CC=C1
     * 3. Go to Macro mode - Flex
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndAddToCanvas(page, 'c1ccccc1.C1=CC=CC=C1');
    await clickInTheMiddleOfTheCanvas(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeElementScreenshot(
      page,
      getAtomLocator(page, { atomId: 1 }).first(),
      { padding: 150 },
    );
  });

  test('Case 10 — It is possible to connect all APs to same atom', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5359
     * Bug: https://github.com/epam/ketcher/issues/5701
     * Description: It is possible to connect all APs to same atom
     * Scenario:
     * 1. Go to Micromolecules mode
     * 2. Put on the canvas O symbol (oxygen)
     * 3. Go to Macro - Flex
     * 4. Put on the canvas CHEM (Test-6-Ch in my case)
     * 5. Drag each connection point and connect it to atom
     *
     * Version 3.12.0
     */
    await RightToolbar(page).clickAtom(Atom.Oxygen);
    await clickOnCanvas(page, 100, 50);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await Library(page).switchToCHEMTab();
    await Library(page).clickMonomerAutochain(Chem.Test_6_Ch);
    for (let i = 1; i <= 6; i++) {
      await bondMonomerPointToMoleculeAtom(
        page,
        getMonomerLocator(page, Chem.Test_6_Ch),
        getAtomLocator(page, { atomId: 0 }),
        (Object.values(AttachmentPoint) as AttachmentPoint[])[i - 1],
      );
    }
    await getMonomerLocator(page, { monomerAlias: 'Test-6-Ch' }).hover({
      force: true,
    });
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Test-6-Ch' }),
    );
  });

  test('Case 11 — Bond properties are not implemented', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5359
     * Bug: https://github.com/epam/ketcher/issues/5656

     * Description: Bond properties are not implemented
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from file: Bond properties are not implemented 2.ket
     * 3. Switch to Macro mode
     *
     * Version 3.12.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Bond properties are not implemented 2.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Case 12 — "Process is not defined" error is displayed in console after Clearing Canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/4897
     * Bug: https://github.com/epam/ketcher/issues/5170

     * Description: "Process is not defined" error is displayed in console after Clearing Canvas 
     * in Macro Mode with the element with an attachment point and switching to Micro
     * Scenario:
     * 1. Add any element to Canvas
     * 2. Click on Attachment Point Tool
     * 3. Then click on any unit of element
     * 4. Add primary and secondary attachment points
     * 5. Switch to Macro mode
     * 6. Click on Clear Canvas
     * 7. Switch back to Micro mode
     *
     * Version 3.12.0
     */
    await drawBenzeneRing(page);
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await setAttachmentPoints(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 10 }),
      { primary: true, secondary: true },
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeTopToolbarScreenshot(page);
  });

  test('Case 13 — After copying and pasting, structure under cursor causes Uncaught TypeErrors', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5359
     * Bug: https://github.com/epam/ketcher/issues/5656

     * Description: After copying and pasting, structure under cursor causes Uncaught TypeErrors 
     * in DevTool console when approaching the edges of canvas
     * Scenario:
     * 1. Add Benzene ring in Micro mode
     * 2. Copy and paste it under mouse cursor
     * 3. Move to edges of canvas
     *
     * Version 3.12.0
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await page.mouse.move(300, 650, { steps: 30 });
    await page.mouse.move(800, 650, { steps: 30 });
    await page.mouse.move(300, 650, { steps: 30 });
    await page.mouse.move(950, 650, { steps: 30 });
    await page.mouse.move(950, 200, { steps: 30 });
    await page.mouse.move(950, 650, { steps: 30 });
  });

  test('Case 14 — Inconsistent display of hotkeys next to the “Zoom out” button in the Micro and Macro modes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/4701
     * Bug: https://github.com/epam/ketcher/issues/4959

     * Description: Inconsistent display of hotkeys next to the “Zoom out” button in the Micro and Macro modes
     * Scenario:
     * 1. Click on the Zoom drop-down
     * 2. Switch to the Macro mode
     * 3. Click on the Zoom drop-down
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).zoomSelector.click();
    await CommonTopRightToolbar(page).zoomOutButton.waitFor({
      state: 'visible',
    });
    await expect(CommonTopRightToolbar(page).zoomOutButton).toContainText(
      'Ctrl+Minus',
    );
    await clickInTheMiddleOfTheCanvas(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopRightToolbar(page).zoomSelector.click();
    await CommonTopRightToolbar(page).zoomOutButton.waitFor({
      state: 'visible',
    });
    await expect(CommonTopRightToolbar(page).zoomOutButton).toContainText(
      'Ctrl+Minus',
    );
    await clickInTheMiddleOfTheCanvas(page);
  });

  test('Case 15 — After clicking the "Clear Canvas" button multiple times, a user has to click the "Undo" button multiple times to return the structure', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/4543
     * Bug: https://github.com/epam/ketcher/issues/4724

     * Description: After clicking the "Clear Canvas" button multiple times, a user has to click the "Undo" button multiple times to return the structure
     * Scenario:
     * 1. Select Macromolecules mode
     * 2. Draw any structure on the canvas (for example click any structure in macromolecules library)
     * 3. Click on the "Clear Canvas" button 5 times
     * 4. Click on the "Undo" button
     *
     * Version 3.12.0
     */

    await Library(page).clickMonomerAutochain(Preset.A);
    for (let i = 1; i <= 5; i++) {
      await CommonTopLeftToolbar(page).clearCanvas();
    }
    await CommonTopLeftToolbar(page).undo();
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'R' }),
      { padding: 70 },
    );
  });

  test('Case 16 — Change event does not trigger after switching to Micro mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5618
     * Bug: https://github.com/epam/ketcher/issues/6071

     * Description: When switching to Micro mode in Ketcher, the change event stops triggering. 
     * This behavior disrupts workflows that rely on change event subscriptions to monitor updates on the canvas.
     * Scenario:
     * 1. Open Ketcher and subscribe to the change event window['ketcher'].editor.subscribe("change", () => { console.log('in change event'); }); 
     * 2. Perform actions in Macro mode and observe that the change event triggers as expected.
     * 3. Switch to Micro mode.
     * 4. Perform actions in Micro mode (e.g., adding or modifying elements) and observe if the change event is triggered.
     *
     * Version 3.12.0
     */
    const changeEventTriggered = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let eventFired = false;
        window.ketcher.editor.subscribe('change', () => {
          console.log('in change event');
          eventFired = true;
        });
        (window as any).__changeEventTriggered = () => eventFired;
        resolve(true);
      });
    });

    expect(changeEventTriggered).toBeTruthy();

    await Library(page).switchToPeptidesTab();
    await Library(page).clickMonomerAutochain(Peptide.A);

    const eventFired = await page.evaluate(() => {
      return (window as any).__changeEventTriggered?.() ?? false;
    });
    expect(eventFired).toBeTruthy();

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await drawBenzeneRing(page);
    expect(eventFired).toBeTruthy();
  });

  test('Case 17 — CIP labels are not added correctly when loading from a cdxml file with no CIP labels', async () => {
    /*
     * Test case: https://github.com/epam/Indigo/issues/3360
     * Bug: https://github.com/epam/Indigo/issues/3360

     * Description: CIP labels are not added correctly when loading from a cdxml file with no CIP labels
     * Scenario:
     * 1. Open a structure in Micro mode ketcher - noCIPLabels.cdxml.txt
     * 2. Calculate CIP labels
     *
     * Version 3.12.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/Chromium-popup/Bugs/noCIPLabels.cdxml.txt',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeElementScreenshot(
      page,
      getAtomLocator(page, { atomLabel: 'O' }),
      { padding: 200 },
    );
  });

  test('Case 18 — Leaving group atom position is incorrect for nucleotides created in monomer wizard', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/9047
     * Bug: https://github.com/epam/ketcher/issues/9047

     * Description: Leaving group atom position is incorrect for nucleotides created in monomer wizard
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Open structure demo.ket.zip
     * 3. Create Nucleotide(preset) in monomer creation wizard
     * 4. Collapse created monomers
     * 5. Hover over monomers to check the structure
     *
     * Version 3.12.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Atom position nucleotide.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('N1');

    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

    await presetSection.setupBase({
      atomIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      bondIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      symbol: Base.Base.alias,
      name: 'B1',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
      HELMAlias: 'BaseAlias',
    });

    await presetSection.setupSugar({
      atomIds: [16, 17, 18, 19, 20, 21, 22, 23],
      bondIds: [18, 19, 20, 21, 22, 23, 24, 25],
      symbol: Sugar.Sugar.alias,
      name: 'S1',
      HELMAlias: 'SugAlias',
    });

    await presetSection.setupPhosphate({
      atomIds: [11, 12, 13, 14, 15],
      bondIds: [13, 14, 15, 16],
      symbol: Phosphate.Phosphate.alias,
      name: 'P1',
      HELMAlias: 'PhosAlias',
    });

    await dialog.submit();
    await selectAllStructuresOnCanvas(page);
    const atom = getAtomLocator(page, { atomId: 15 });
    await collapseMonomers(page, atom);

    await getAbbreviationLocator(page, { name: 'Base' }).hover({ force: true });
    await AbbreviationPreviewTooltip(page).waitForBecomeVisible();
    await takeElementScreenshot(page, AbbreviationPreviewTooltip(page).window);
    await clickInTheMiddleOfTheCanvas(page);

    await getAbbreviationLocator(page, { name: 'Sugar' }).hover({
      force: true,
    });
    await AbbreviationPreviewTooltip(page).waitForBecomeVisible();
    await takeElementScreenshot(page, AbbreviationPreviewTooltip(page).window);
    await clickInTheMiddleOfTheCanvas(page);

    await getAbbreviationLocator(page, { name: 'Phosphate' }).hover({
      force: true,
    });
    await AbbreviationPreviewTooltip(page).waitForBecomeVisible();
    await takeElementScreenshot(page, AbbreviationPreviewTooltip(page).window);
  });

  test('Case 19 — Undo/redo moves arrow after position change in Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8954
     * Bug: https://github.com/epam/ketcher/issues/8954
     
     * Description: Arrow should return to its original position after Undo and then move back after Redo.
     * Scenario:
     * 1. Open Molecules canvas
     * 2. Select Open Angle Arrow tool
     * 3. Place arrow in the middle of the screen
     * 4. Switch to Macromolecules mode
     * 5. Move the arrow to a new position
     * 6. Press Undo
     * 7. Press Redo
     *
     * Version 3.12.0
     */

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    const screenCenter = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(screenCenter.x, screenCenter.y);
    await dragMouseTo(page, screenCenter.x + 100, screenCenter.y + 20);

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionTool();

    const arrow = getArrowLocator(page, {
      arrowType: Arrows.OpenAngle,
    }).first();
    await arrow.waitFor({ state: 'visible' });

    await page.mouse.move(screenCenter.x, screenCenter.y);
    await dragMouseTo(page, screenCenter.x + 120, screenCenter.y + 70);

    const arrowMovedBox = await arrow.boundingBox();
    expect(arrowMovedBox).not.toBeNull();
    const arrowMovedX = arrowMovedBox!.x + arrowMovedBox!.width / 2;
    expect(arrowMovedX).toBeGreaterThan(screenCenter.x + 40);

    await CommonTopLeftToolbar(page).undo();
    const arrowAfterUndoBox = await arrow.boundingBox();
    expect(arrowAfterUndoBox).not.toBeNull();
    const arrowAfterUndoX = arrowAfterUndoBox!.x + arrowAfterUndoBox!.width / 2;
    expect(Math.abs(arrowAfterUndoX - screenCenter.x)).toBeLessThan(10);

    await CommonTopLeftToolbar(page).redo();
    const arrowAfterRedoBox = await arrow.boundingBox();
    expect(arrowAfterRedoBox).not.toBeNull();
    const arrowAfterRedoX = arrowAfterRedoBox!.x + arrowAfterRedoBox!.width / 2;
    expect(Math.abs(arrowAfterRedoX - arrowMovedX)).toBeLessThan(10);
  });

  test('Case 20: setMolecule and addFragment API should preserve selections from KET files', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/8898
     * Bug: https://github.com/epam/ketcher/issues/8898
     *
     * Description: When calling setMolecule or addFragment API with a KET file
     * containing selected atoms and bonds, they are not selected on the canvas.
     *
     * Steps:
     * 1. Create a KET string with selected atoms
     * 2. Call setMolecule with the KET string
     * 3. Check that atoms are selected in the editor
     * 4. Call addFragment with another KET string containing selected atoms
     * 5. Check that atoms are selected after addFragment
     *
     * Version 3.12.0
     */

    const ketWithSelectedAtom = await readFileContent('KET/selected-atoms.ket');

    // Test setMolecule preserves selections
    await setMolecule(page, ketWithSelectedAtom);

    const selectionAfterSetMolecule = await page.evaluate(() => {
      return window.ketcher.editor.selection();
    });

    expect(selectionAfterSetMolecule).toBeDefined();
    expect(selectionAfterSetMolecule?.atoms).toEqual([0, 1]);
    expect(selectionAfterSetMolecule?.bonds).toEqual([0]);

    // Test addFragment preserves selections
    const ketWithSelectedFragment = JSON.stringify({
      ket_version: '2.0.0',
      root: {
        nodes: [
          {
            $ref: 'mol1',
          },
        ],
        connections: [],
        templates: [],
      },
      mol1: {
        type: 'molecule',
        atoms: [
          {
            label: 'N',
            location: [3, 0, 0],
            selected: true,
          },
        ],
      },
    });

    await page.evaluate((ketString) => {
      return window.ketcher.addFragment(ketString);
    }, ketWithSelectedFragment);

    const selectionAfterAddFragment = await page.evaluate(() => {
      return window.ketcher.editor.selection();
    });

    expect(selectionAfterAddFragment).toBeDefined();
    expect(selectionAfterAddFragment?.atoms).toContain(2);
  });

  test('Case 21 — Pt bad valence indication is preserved on Macromolecules canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/8837
     * Bug: https://github.com/epam/ketcher/issues/8837
     *
     * Description: Pt bad valence underline must be shown in Macromolecules mode
     * as it is shown in Molecules mode.
     *
     * Steps:
     * 1. Open Molecules mode (clean canvas)
     * 2. Paste SMILES: [Pt](C)(C)(C)(C)C
     * 3. Verify bad valence underline is shown on the Pt atom
     * 4. Switch to Macromolecules mode
     * 5. Verify the bad valence underline is still shown on the Pt atom
     *
     * Version 3.12.0
     */

    await pasteFromClipboardAndOpenAsNewProject(page, '[Pt](C)(C)(C)(C)C');

    const ptAtom = getAtomLocator(page, { atomLabel: 'Pt' }).first();
    await ptAtom.waitFor({ state: 'visible' });

    const ptBadValenceLine = ptAtom.locator('line');
    await expect(ptBadValenceLine).toHaveCount(1);
    const strokeBeforeSwitch = await ptBadValenceLine
      .first()
      .getAttribute('stroke');
    expect(strokeBeforeSwitch?.toLowerCase()).toBe('#f00');

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    const ptAtomMacro = getAtomLocator(page, { atomLabel: 'Pt' }).first();
    await ptAtomMacro.waitFor({ state: 'visible' });

    const ptBadValenceLineMacro = ptAtomMacro.locator('line');
    await expect(ptBadValenceLineMacro).toHaveCount(1);
    const strokeAfterSwitch = await ptBadValenceLineMacro
      .first()
      .getAttribute('stroke');
    expect(strokeAfterSwitch?.toLowerCase()).toBe('#f00');
  });

  test('Case 22 — Hover on a selected atom differs in micro mode and in macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8800
     * Bug: https://github.com/epam/ketcher/issues/8800
     *
     * Description: The hover on a selected atom has different color in Molecules mode
     * and in Macromolecules mode.
     *
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Load from file: carbon-label-doesnt-appear-in-180-degree-angle-on-macro-mode.ket
     * 3. Click and hover mouse over any atom
     *
     * Version 3.12.0
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/carbon-label-doesnt-appear-in-180-degree-angle-on-macro-mode.ket',
    );

    const atom = getAtomLocator(page, { atomLabel: 'C' }).first();
    await atom.waitFor({ state: 'visible' });
    await atom.hover();

    const hoverColorMicro = await atom.evaluate((element) => {
      const target = (element as Element).querySelector(
        'text, path, circle, ellipse, line, polyline, polygon',
      ) as Element | null;
      const node = target || element;
      const style = window.getComputedStyle(node as Element);
      return {
        stroke: style.stroke,
        fill: style.fill,
        color: style.color,
      };
    });

    await takeElementScreenshot(page, atom, { padding: 80 });

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });

    const atomMacro = getAtomLocator(page, { atomLabel: 'C' }).first();
    await atomMacro.waitFor({ state: 'visible' });
    await atomMacro.hover();

    const hoverColorMacro = await atomMacro.evaluate((element) => {
      const target = (element as Element).querySelector(
        'text, path, circle, ellipse, line, polyline, polygon',
      ) as Element | null;
      const node = target || element;
      const style = window.getComputedStyle(node as Element);
      return {
        stroke: style.stroke,
        fill: style.fill,
        color: style.color,
      };
    });

    expect(hoverColorMacro).toEqual(hoverColorMicro);
    await takeElementScreenshot(page, atomMacro, { padding: 80 });
  });
});
