/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  BondsSetting,
  MeasurementUnit,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  setACSSettings,
  setSettingsOptions,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  SdfFileFormat,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('CDF files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test('Open SDF v2000 file and save it', async ({ page }) => {
    await waitForPageInit(page);

    await openFileAndAddToCanvas(page, 'SDF/sdf-v2000-to-open.sdf');
    await verifyFileExport(
      page,
      'SDF/sdf-v2000-to-open-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Open SDF v3000 file and save it', async ({ page }) => {
    await openFileAndAddToCanvas(page, 'SDF/sdf-v3000-to-open.sdf');
    await verifyFileExport(
      page,
      'SDF/sdf-v3000-to-open-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Open SDF V2000 file and place it on canvas', async ({ page }) => {
    await openFileAndAddToCanvas(page, 'SDF/sdf-v2000-to-open.sdf');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open SDF V3000 file and place it on canvas', async ({ page }) => {
    await waitForPageInit(page);

    await openFileAndAddToCanvas(page, 'SDF/sdf-v3000-to-open.sdf');
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 3000 file and loaded back
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-nucleotides-v3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-nucleotides-v3000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with chems could be saved to sdf 3000 file and loaded back
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-chems-v3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-chems-v3000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with sugars could be saved to sdf 3000 file and loaded back
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-sugars-v3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-sugars-v3000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with bases could be saved to sdf 3000 file and loaded back
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-bases-v3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-bases-v3000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with phosphates could be saved to sdf 3000 file and loaded back
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-phosphates-v3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-phosphates-v3000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with peptides could be saved to sdf 3000 file and loaded back
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-peptides-v3000.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-peptides-v3000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 2000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-nucleotides-v2000.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-nucleotides-v2000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to sdf 2000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with chems could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-chems-v2000.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-chems-v2000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to sdf 2000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with sugars could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-sugars-v2000.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-sugars-v2000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to sdf 2000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with bases could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-bases-v2000.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-bases-v2000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to sdf 2000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with phosphates could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-phosphates-v2000.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-phosphates-v2000.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to sdf 2000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with peptides could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */

    await openFileAndAddToCanvas(
      page,
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
    );
    await verifyFileExport(
      page,
      'SDF/unsplit-nucleotides-connected-with-peptides-v2000.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/unsplit-nucleotides-connected-with-peptides-v2000.sdf',
    );
    await takeEditorScreenshot(page);
  });
});

test('The Bond length setting with px option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Px },
    { option: BondsSetting.BondLength, value: '79.8' },
  ]);

  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-px-bond-lengh-v2000.sdf',
    FileType.SDF,
    SdfFileFormat.v2000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-px-bond-lengh-v2000.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Hash spacing setting with px option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Change Hash spacing for ACS styles settings
  The Hash spacing setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    {
      option: BondsSetting.HashSpacingUnits,
      value: MeasurementUnit.Px,
    },
    { option: BondsSetting.HashSpacing, value: '79.8' },
  ]);
  await takeEditorScreenshot(page);
  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-px-hash-spacing-v2000-expected.sdf',
    FileType.SDF,
    SdfFileFormat.v2000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-px-hash-spacing-v2000-expected.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Hash spacing setting with px option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Change Hash spacing for ACS styles settings
  The Hash spacing setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    {
      option: BondsSetting.HashSpacingUnits,
      value: MeasurementUnit.Px,
    },
    { option: BondsSetting.HashSpacing, value: '79.8' },
  ]);
  await takeEditorScreenshot(page);
  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-px-hash-spacing-v3000-expected.sdf',
    FileType.SDF,
    SdfFileFormat.v3000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-px-hash-spacing-v3000-expected.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Hash spacing setting with cm option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Change Hash spacing for ACS styles settings
  The Hash spacing setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    {
      option: BondsSetting.HashSpacingUnits,
      value: MeasurementUnit.Cm,
    },
    { option: BondsSetting.HashSpacing, value: '79.8' },
  ]);
  await takeEditorScreenshot(page);
  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-cm-hash-spacing-v2000-expected.sdf',
    FileType.SDF,
    SdfFileFormat.v2000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-cm-hash-spacing-v2000-expected.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Hash spacing setting with cm option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Change Hash spacing for ACS styles settings
  The Hash spacing setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    {
      option: BondsSetting.HashSpacingUnits,
      value: MeasurementUnit.Cm,
    },
    { option: BondsSetting.HashSpacing, value: '79.8' },
  ]);
  await takeEditorScreenshot(page);
  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-cm-hash-spacing-v3000-expected.sdf',
    FileType.SDF,
    SdfFileFormat.v3000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-cm-hash-spacing-v3000-expected.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Hash spacing setting with inch option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Change Hash spacing for ACS styles settings
  The Hash spacing setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    {
      option: BondsSetting.HashSpacingUnits,
      value: MeasurementUnit.Inch,
    },
    { option: BondsSetting.HashSpacing, value: '79.8' },
  ]);
  await takeEditorScreenshot(page);
  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-inch-hash-spacing-v2000-expected.sdf',
    FileType.SDF,
    SdfFileFormat.v2000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-inch-hash-spacing-v2000-expected.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Hash spacing setting with inch option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Change Hash spacing for ACS styles settings
  The Hash spacing setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);
  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    {
      option: BondsSetting.HashSpacingUnits,
      value: MeasurementUnit.Inch,
    },
    { option: BondsSetting.HashSpacing, value: '79.8' },
  ]);

  await takeEditorScreenshot(page);
  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-inch-hash-spacing-v3000-expected.sdf',
    FileType.SDF,
    SdfFileFormat.v3000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-inch-hash-spacing-v3000-expected.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The Bond length setting with pt option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setSettingsOptions(page, [
    { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
    { option: BondsSetting.BondLength, value: '29.8' },
  ]);

  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-pt-bond-lengh-v2000.sdf',
    FileType.SDF,
    SdfFileFormat.v2000,
  );

  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-pt-bond-lengh-v2000.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The ACS setting is applied, click on layout and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option AVS style and check saving to different format
  Need to update file after implementing https://github.com/epam/ketcher/issues/5652
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setACSSettings(page);
  await IndigoFunctionsToolbar(page).layout();
  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-acs-style-v3000.sdf',
    FileType.SDF,
    SdfFileFormat.v3000,
  );

  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-acs-style-v3000.sdf',
  );
  await takeEditorScreenshot(page);
});

test('The ACS setting is applied, click on layout and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option AVS style and check saving to different format
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(page, 'KET/adenosine-triphosphate.ket');
  await setACSSettings(page);
  await IndigoFunctionsToolbar(page).layout();
  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'SDF/adenosine-triphosphate-acs-style-v2000.sdf',
    FileType.SDF,
    SdfFileFormat.v2000,
  );

  await openFileAndAddToCanvasAsNewProject(
    page,
    'SDF/adenosine-triphosphate-acs-style-v2000.sdf',
  );
  await takeEditorScreenshot(page);
});
