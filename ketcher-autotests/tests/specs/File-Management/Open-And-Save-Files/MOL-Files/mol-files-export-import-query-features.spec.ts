/* eslint-disable no-magic-numbers */
import { test, Page } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  moveMouseAway,
  SdfFileFormat,
  MolFileFormat,
  RxnFileFormat,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {
  // this empty function is needed
});

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('1. Aromaticity: User can export and load back molecules with Aromaticity query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 1
        Description: User can export and load back molecules with "Aromaticity" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Aromaticity.ket (could be obtained from here: Aromaticity.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Aromaticity.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Aromaticity-expected.mol',
      FileType.MOL,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Aromaticity-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2. Aromaticity: User can export and load back molecules with Aromaticity query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 2
        Description: User can export and load back molecules with "Aromaticity" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Aromaticity.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Aromaticity.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Aromaticity-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Aromaticity-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3. Aromaticity: User can export and load back molecules with Aromaticity query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 3
        Description: User can export and load back molecules with "Aromaticity" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Aromaticity2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Aromaticity2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Aromaticity2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Aromaticity2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4. Chirality: User can export and load back molecules with Chirality query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Chirality" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Chirality.ket (could be obtained from here: Chirality.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Chirality.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Chirality-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Chirality-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('5. Chirality: User can export and load back molecules with Chirality query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Chirality" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Chirality.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        Expected result: No Chirality since SDF doesn't support it - https://github.com/epam/Indigo/issues/1507
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Chirality.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Chirality-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Chirality-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('6. Chirality: User can export and load back molecules with "Chirality" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Chirality" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Chirality2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        Expected result: No Chirality since RXN doesn't support it - https://github.com/epam/Indigo/issues/1508
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Chirality2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Chirality2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Chirality2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test(
    '7. Connectivity: User can export and load back molecules with Connectivity query feature to Mol file. Feature values remain in place.',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Connectivity" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Connectivity.ket (could be obtained from here: Connectivity.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Doesn't show labels for first ring because of the bug: https://github.com/epam/ketcher/issues/3529
        Will require to update screens after fix
        */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Query-Features/Connectivity.ket',
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        'Molfiles-V2000/Query-Feature/Connectivity-expected.mol',
        FileType.MOL,
      );

      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Query-Feature/Connectivity-expected.mol',
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '8. Connectivity: User can export and load back molecules with Connectivity query feature to SDF V2000 file. Feature values remain in place.',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Connectivity" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Connectivity.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        IMPORTANT: Doesn't show labels for first ring because of the bug: https://github.com/epam/ketcher/issues/3529
        Will require to update screens after fix
        */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Query-Features/Connectivity.ket',
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        'SDF/Query-Feature/Connectivity-expected.sdf',
        FileType.SDF,
        SdfFileFormat.v2000,
      );

      await openFileAndAddToCanvasAsNewProject(
        page,
        'SDF/Query-Feature/Connectivity-expected.sdf',
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '9. Connectivity: User can export and load back molecules with "Connectivity" query feature to RXN V2000 file. Feature values remain in place.',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Connectivity" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Connectivity.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        IMPORTANT: Doesn't show labels for first ring because of the bug: https://github.com/epam/ketcher/issues/3529
        Will require to update screens after fix
        */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Query-Features/Connectivity2.ket',
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        'Rxn-V2000/Query-Feature/Connectivity2-expected.rxn',
        FileType.RXN,
        RxnFileFormat.v2000,
      );

      await openFileAndAddToCanvasAsNewProject(
        page,
        'Rxn-V2000/Query-Feature/Connectivity2-expected.rxn',
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test('10. H count: User can export and load back molecules with H count query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "H count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load H count.ket (could be obtained from here: H count.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/H count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/H count-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/H count-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('11. H count: User can export and load back molecules with H count query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "H count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load H count.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/H count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/H count-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/H count-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('12. H count: User can export and load back molecules with "H count" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "H count" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load H count.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/H count2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/H count2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/H count2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('13. Implicit H count: User can export and load back molecules with Implicit H count query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Implicit H count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Implicit H count.ket (could be obtained from here: Implicit H count.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/Indigo/issues/1665, https://github.com/epam/Indigo/issues/1497
        and https://github.com/epam/Indigo/issues/1496 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Implicit H count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Implicit H count-expected.mol',
      FileType.MOL,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Implicit H count-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('14. Implicit H count: User can export and load back molecules with Implicit H count query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Implicit H count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Implicit H count.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/Indigo/issues/1665, https://github.com/epam/Indigo/issues/1497
        and https://github.com/epam/Indigo/issues/1496 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Implicit H count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Implicit H count-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Implicit H count-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('15. Implicit H count: User can export and load back molecules with "Implicit H count" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Implicit H count" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Implicit H count2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/Indigo/issues/1665, https://github.com/epam/Indigo/issues/1497
        and https://github.com/epam/Indigo/issues/1496 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Implicit H count2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Implicit H count2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Implicit H count2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('16. Ring bond count: User can export and load back molecules with Ring bond count query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Ring bond count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring bond count.ket (could be obtained from here: Ring bond count.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3958 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring bond count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Ring bond count-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Ring bond count-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('17. Ring bond count: User can export and load back molecules with Ring bond count query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Ring bond count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring bond count.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring bond count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Ring bond count-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Ring bond count-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('18. Ring bond count: User can export and load back molecules with "Ring bond count" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Ring bond count" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring bond count2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring bond count2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Ring bond count2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Ring bond count2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('19. Ring membership: User can export and load back molecules with Ring membership query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Ring membership" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring membership.ket (could be obtained from here: Ring membership.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3529 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring membership.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Ring membership-expected.mol',
      FileType.MOL,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Ring membership-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('20. Ring membership: User can export and load back molecules with Ring membership query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Ring membership" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring membership.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3529 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring membership.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Ring membership-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Ring membership-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('21. Ring membership: User can export and load back molecules with "Ring membership" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Ring membership" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring membership2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3529 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring membership2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Ring membership2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Ring membership2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('22. Ring size: User can export and load back molecules with Ring size query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Ring size" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring size.ket (could be obtained from here: Ring size.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3529 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring size.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Ring size-expected.mol',
      FileType.MOL,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Ring size-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('23. Ring size: User can export and load back molecules with Ring size query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Ring size" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring size.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3529 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring size.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Ring size-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Ring size-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('24. Ring size: User can export and load back molecules with "Ring size" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Ring size" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Ring size2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3529 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Ring size2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Ring size2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Ring size2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('25. Substitution count: User can export and load back molecules with Substitution count query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Substitution count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Substitution.ket (could be obtained from here: Substitution count.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/ketcher/issues/3957 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Substitution count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Substitution count-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Substitution count-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('26. Substitution count: User can export and load back molecules with Substitution count query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Substitution count" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Substitution count.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/Indigo/issues/1493 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Substitution count.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Substitution count-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Substitution count-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('27. Substitution count: User can export and load back molecules with "Substitution count" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Substitution count" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Substitution2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        IMPORTANT: Screens are incorrect due to https://github.com/epam/Indigo/issues/1494 bug
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Substitution count2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Substitution count2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Substitution count2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('28. Unsaturated: User can export and load back molecules with Unsaturated query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Unsaturated" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Unsaturated.ket (could be obtained from here: Unsaturated.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Unsaturated.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Unsaturated-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/Unsaturated-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('29. Unsaturated: User can export and load back molecules with Unsaturated query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Unsaturated" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Unsaturated.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Unsaturated.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/Unsaturated-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/Unsaturated-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('30. Unsaturated: User can export and load back molecules with "Unsaturated" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Unsaturated" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Unsaturated2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Unsaturated2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Unsaturated2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/Unsaturated2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('31. Custom: User can export and load back molecules with Custom query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "Custom" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Custom.ket (could be obtained from here: Custom.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        IMPORTANT: Test case is not functional due to https://github.com/epam/ketcher/issues/4197, 
        https://github.com/epam/Indigo/issues/1778, https://github.com/epam/Indigo/issues/1779 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Custom.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    /*
        await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/Custom-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

        await openFileAndAddToCanvasAsNewProject(page, 'Molfiles-V2000/Query-Feature/Custom-expected.mol', page);
        await moveMouseAway(page);
        await takeEditorScreenshot(page);
        */
  });

  test('32. Custom: User can export and load back molecules with Custom query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "Custom" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load Custom.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        IMPORTANT: Test case is not functional due to https://github.com/epam/ketcher/issues/4197, 
        https://github.com/epam/Indigo/issues/1778, https://github.com/epam/Indigo/issues/1779 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Custom.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    /*
        await verifyFileExport(
      page,
      'SDF/Query-Feature/Custom-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

        await openFileAndAddToCanvasAsNewProject(page, 'SDF/Query-Feature/Custom-expected.sdf', page);
        await moveMouseAway(page);
        await takeEditorScreenshot(page);
        */
  });

  test('33. Custom: User can export and load back molecules with "Custom" query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "Custom" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load Custom2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        IMPORTANT: Test case is not functional due to https://github.com/epam/ketcher/issues/4197, 
        https://github.com/epam/Indigo/issues/1778, https://github.com/epam/Indigo/issues/1779 bugs
        Will require to update screens after fix
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/Custom2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    /*
        await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/Custom2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

        await openFileAndAddToCanvasAsNewProject(page, 'Rxn-V2000/Query-Feature/Custom2-expected.rxn', page);
        await moveMouseAway(page);
        await takeEditorScreenshot(page);
        */
  });

  test('34. All Atom Query features together: User can export and load back molecules with query feature to Mol file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 4
        Description: User can export and load back molecules with "All Atom Query features together" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load All Atom Query features together.ket (could be obtained from here: All Atom Query features together.zip (unzip first))
        3. Validate canvas
        4. Export canvas to Mol file
        5. Clear canvas
        6. Load Mol file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/All Atom Query features together.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V2000/Query-Feature/All Atom Query features together-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Query-Feature/All Atom Query features together-expected.mol',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('35. All Atom Query features together: User can export and load back molecules with query feature to SDF V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 5
        Description: User can export and load back molecules with "All Atom Query features together" query feature to Mol file. Feature values remain in place.
        1. Clear canvas
        2. Load All Atom Query features together.ket
        3. Validate canvas
        4. Export canvas to SDF V2000 file
        5. Clear canvas
        6. Load SDF V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/All Atom Query features together.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'SDF/Query-Feature/All Atom Query features together-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Query-Feature/All Atom Query features together-expected.sdf',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('36. All Atom Query features together: User can export and load back molecules with query feature to RXN V2000 file. Feature values remain in place.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3860 - Case 6
        Description: User can export and load back molecules with "All Atom Query features together" query feature to RXN V2000 file. Feature values remain in place.
        1. Clear canvas
        2. Load All Atom Query features together2.ket
        3. Validate canvas
        4. Export canvas to RXN V2000 file
        5. Clear canvas
        6. Load RXN V2000 file
        7. Validate canvas
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Query-Features/All Atom Query features together2.ket',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Rxn-V2000/Query-Feature/All Atom Query features together2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Query-Feature/All Atom Query features together2-expected.rxn',
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });
});
