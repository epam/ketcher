/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import {
  MacroFileType,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProjectMacro,
  takeEditorScreenshot,
} from '@utils';
import {
  FileType,
  verifyFileExport,
  verifyIDTExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.afterEach(async ({ FlexCanvas: _ }) => {});

test.describe('Import-Saving .idt Files', () => {
  const fileNames = [
    '/56-FAM/rArA/3Dig_N/',
    '/5DigN/rArA/36-FAM/',
    '/5ATTO647NN/rArA/3ATTO647NN/',
    '/5ATTO700N/rArArA',
    '/5SUN/rArArA',
    '/56-FAM/A',
    '/52-Bio/A',
    '/5BiotinTEG/A',
    '/5Hexynyl/A',
    '/56-ROXN/A',
    '/5SUN/A',
    '/56-TAMN/A',
    '/5ATTO425N/A',
    '/5ATTO488N/A',
    '/5ATTO532N/A',
    '/5ATTO550N/A',
    '/5ATTO565N/A',
    '/5ATTO590N/A',
    '/5ATTO633N/A',
    '/5ATTO647NN/A',
    '/5ATTO700N/A',
    '/5Acryd/A',
    '/5Alex405N/A',
    '/5Alex488N/A',
    '/5Alex532N/A',
    '/5Alex546N/A',
    '/5Alex594N/A',
    '/5Alex647N/A',
    '/5RHO101N/A',
    '/5AzideN/A',
    '/55-TAMK/A',
    '/5BHQ_1/A',
    '/5BHQ_2/A',
    '/5BioK/A',
    '/5Biosg/A',
    '/5DBCOTEG/A',
    '/5DigN/A',
    '/5Dy750N/A',
    '/56-FAMK/A',
    '/56-FAMN/A',
    '/5HEX/A',
    '/5IRD700/A',
    '/5IRD800/A',
    '/5IRD800CWN/A',
    '/56-JOEN/A',
    '/5PCBio/A',
    '/5RhoG-XN/A',
    '/5RhoR-XN/A',
    '/5TET/A',
    '/5TexRd-XN/A',
  ];

  const toExpectedName = (s: string) =>
    s.replace(/(?:^\/+)|(?:\/+$)/g, '').replace(/\//g, '-');

  for (const fileName of fileNames) {
    const expectedFile = `IDT/${toExpectedName(fileName)}-expected.idt`;

    test(`Case 1: Load ${fileName} save to IDT and load back`, async () => {
      /*
       * Version 3.8
       * Test case: https://github.com/epam/Indigo/issues/3136
       * Description: Check the possibility to save and load back the structure in IDT format
       * Scenario:
       * 1. Go to Macro mode
       * 2. Load IDT
       * 3. Save to IDT file format and load back
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.IDT,
        fileName,
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await verifyFileExport(page, expectedFile, FileType.IDT);
      await openFileAndAddToCanvasAsNewProject(page, expectedFile);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }
});

test(`Case 2: Verify that system uses custom preset IDT code instead of base one`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8712
   * Description: Verify that system uses custom preset IDT code instead of base one
   * Scenario:
   * 1. Go to Macro mode
   * 2. Load HELM
   * 3. Save to IDT file format and load back
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.HELM,
    'RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0',
  );
  await verifyIDTExport(page, '/5deoxyI/rA/ideoxyI/rA/3deoxyI/');
});

test(`Case 3: Check that for Preset R(In)P only has the "special" code at the internal position so for 5' it should be rI, for internal /iRiboI/, and for 3' rI`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8712
   * Description: Check that for Preset R(In)P only has the "special" code at the internal position so for 5' it should be rI, for internal /iRiboI/, and for 3' rI
   * Scenario:
   * 1. Go to Macro mode
   * 2. Load HELM
   * 3. Save to IDT file format and load back
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.HELM,
    'RNA1{r([Hyp])p.r([Hyp])p.r([Hyp])}$$$$V2.0',
  );
  await verifyIDTExport(page, 'rI/iRiboI/rI');
});

test(`Case 4: Check that for preset R(G)P, similar story so for 5' and internal it should be rG, but for 3' it should be /3RiboG/`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8712
   * Description: Check that for preset R(G)P, similar story so for 5' and internal it should be rG, but for 3' it should be /3RiboG/
   * Scenario:
   * 1. Go to Macro mode
   * 2. Load HELM
   * 3. Save to IDT file format and load back
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.HELM,
    'RNA1{r(G)p.r(G)p.r(G)}$$$$V2.0',
  );
  await verifyIDTExport(page, 'rGrG/3RiboG/');
});
