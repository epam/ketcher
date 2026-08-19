/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  AttachmentPointOption,
  AttachmentPointAtom,
} from '@tests/pages/molecules/canvas/createMonomer/constants/editConnectionPointPopup/Constants';
import { ConnectionPointOption } from '@tests/pages/constants/contextMenu/Constants';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  clickOnCanvas,
  dragMouseTo,
  selectAllStructuresOnCanvas,
} from '@utils';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

let page: Page;

test.describe('Attachment points editing dropdown logic in monomer creation wizard', () => {
  const minimumDropdownOptionsCount = 3;
  const positionTolerancePx = 3;
  const centerDivider = 2;
  const dragStartX = 600;
  const dragStartY = 200;
  const dragEndX = 500;
  const dragEndY = 250;

  async function openCreateMonomerDialogWithChemType(smiles: string) {
    await pasteFromClipboardAndOpenAsNewProject(page, smiles);
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);

    const leftToolbar = LeftToolbar(page);
    await expect(leftToolbar.createMonomerButton).toBeVisible();
    await leftToolbar.createMonomer();

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();
    await createMonomerDialog.selectType(MonomerType.CHEM);

    // Keep structure clear of the attributes panel before atom interactions.
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(dragStartX, dragStartY);
    await dragMouseTo(page, dragEndX, dragEndY);

    return createMonomerDialog;
  }

  async function markAtomAsConnectionPoint(atomLabel: string, atomIndex = 0) {
    const atom = getAtomLocator(page, { atomLabel }).nth(atomIndex);
    await ContextMenu(page, atom).click(
      ConnectionPointOption.MarkAsConnectionPoint,
    );
    return atom;
  }

  async function markAtomAsLeavingGroup(atomLabel: string, atomIndex = 0) {
    const atom = getAtomLocator(page, { atomLabel }).nth(atomIndex);
    await ContextMenu(page, atom).click(
      ConnectionPointOption.MarkAsLeavingGroup,
    );
    return atom;
  }

  async function getVisibleAttachmentPointAtomOptionTexts() {
    await expect(page.getByTestId(AttachmentPointAtom.H).first()).toBeVisible();

    const allOptions = page.getByRole('option');
    const count = await allOptions.count();
    const optionTexts: string[] = [];

    for (let i = 0; i < count; i++) {
      const option = allOptions.nth(i);
      if (!(await option.isVisible())) {
        continue;
      }

      const text = (await option.textContent())?.replace(/\u200b/g, '').trim();
      if (text) {
        optionTexts.push(text);
      }
    }

    return optionTexts;
  }

  function getAttachmentPointAtomLabel(atom: AttachmentPointAtom) {
    switch (atom) {
      case AttachmentPointAtom.OH:
        return 'OH';
      case AttachmentPointAtom.NH2:
        return 'NH2';
      case AttachmentPointAtom.CH3:
        return 'CH3';
      default:
        return atom.replace(/-option$/, '');
    }
  }

  async function expectAttachmentPointAtomOptionSelected(
    atom: AttachmentPointAtom,
  ) {
    const option = page.getByTestId(atom).first();
    await expect(option).toBeVisible();

    const ariaSelected = await option.getAttribute('aria-selected');
    const className = (await option.getAttribute('class')) ?? '';
    expect(
      ariaSelected === 'true' ||
        className.includes('Mui-selected') ||
        className.includes('selected'),
    ).toBeTruthy();
  }

  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.afterEach(async () => {
    const createMonomerDialog = CreateMonomerDialog(page);
    if (await createMonomerDialog.window.isVisible()) {
      await createMonomerDialog.discard();
      await expect(createMonomerDialog.window).toBeHidden();
    }
  });

  test('Case 1 - Verify dropdown shows only H and OH when current LGA is H', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: When the current LGA (Leaving Group Atom) is H, the dropdown should show only "H" and "OH" options in that order
     * Scenario:
     * 1. Load a structure with an attachment point that has H as leaving atom
     * 2. Open the monomer creation wizard
     * 3. Click on the attachment point atom dropdown
     * 4. Verify only H and OH options are present
     * 5. Verify they appear in correct order (H first, then OH)
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CCCCC',
    );

    // Set up an attachment point with H as the leaving atom (should be default)
    await markAtomAsConnectionPoint('C');

    // Wait for attachment point to be created and get the atom dropdown
    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );

    // Click the dropdown to open options
    await r1AtomDropdown.click();

    // Verify current LGA is H.
    await expectAttachmentPointAtomOptionSelected(AttachmentPointAtom.H);

    // Verify only H and OH are present
    const optionTexts = await getVisibleAttachmentPointAtomOptionTexts();
    expect(optionTexts).toEqual(['H', 'OH']);

    // Verify H appears first
    expect(optionTexts[0]).toBe('H');
    expect(optionTexts[1]).toBe('OH');

    // Close dropdown
    await page.keyboard.press('Escape');
  });

  test('Case 2 - Verify dropdown shows only H and OH when current LGA is OH', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: When the current LGA is OH, the dropdown should show only "H" and "OH" options in that order
     * Scenario:
     * 1. Load a structure with an attachment point that has OH as leaving atom
     * 2. Open the monomer creation wizard
     * 3. Change an attachment point to have OH as leaving atom
     * 4. Click on the attachment point atom dropdown
     * 5. Verify only H and OH options are present in correct order
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CCCCC',
    );

    // Set up attachment point
    await markAtomAsConnectionPoint('C');

    // Change leaving atom to OH
    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );
    await createMonomerDialog.changeAttachmentPointAtom({
      attachmentPointName: AttachmentPointOption.R1,
      newAtom: AttachmentPointAtom.OH,
    });

    // Now check the dropdown again
    await r1AtomDropdown.click();

    // Verify current LGA is OH.
    await expectAttachmentPointAtomOptionSelected(AttachmentPointAtom.OH);

    const optionTexts = await getVisibleAttachmentPointAtomOptionTexts();

    // Verify only H and OH are present in correct order
    expect(optionTexts).toEqual(['H', 'OH']);
    expect(optionTexts[0]).toBe('H');
    expect(optionTexts[1]).toBe('OH');

    await page.keyboard.press('Escape');
  });

  test('Case 3 - Verify dropdown shows H, OH, then other atom when current LGA is not H or OH', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: When the current LGA is not H or OH, the dropdown should show H first, OH second, then the current atom
     * Scenario:
     * 1. Load a structure and create an attachment point
     * 2. Set the leaving atom to something other than H or OH (e.g., NH₂, CH₃)
     * 3. Open the dropdown
     * 4. Verify the order is: H, OH, then the current atom type
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CBr(C)C',
    );

    // Create attachment point where current LGA is non-H/OH.
    await markAtomAsLeavingGroup('C');

    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );

    const currentLgaText = (await r1AtomDropdown.textContent())
      ?.replace(/\u200b/g, '')
      .trim();
    expect(currentLgaText).toBeTruthy();

    await r1AtomDropdown.click();

    const optionTexts = await getVisibleAttachmentPointAtomOptionTexts();

    // Should have H, OH, and then the current non-H/OH atom.
    expect(optionTexts.length).toBeGreaterThanOrEqual(
      minimumDropdownOptionsCount,
    );
    expect(optionTexts[0]).toBe('H');
    expect(optionTexts[1]).toBe('OH');

    // The third option should be the current non-special atom.
    expect(optionTexts[2]).not.toMatch(/^(H|OH)$/);
    expect(optionTexts[2]).toBe(currentLgaText);

    await page.keyboard.press('Escape');
  });

  test('Case 4 - Verify LGA replacement works without changing position', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: When selecting a new atom from the dropdown, the LGA should be replaced without changing its position
     * Scenario:
     * 1. Create an attachment point with initial leaving atom
     * 2. Note the position of the leaving atom
     * 3. Change the leaving atom type via dropdown
     * 4. Verify the leaving atom position remains the same
     * 5. Verify the atom type has changed
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CCCCC',
    );

    // Set up attachment point with initial H leaving atom
    await markAtomAsConnectionPoint('C');

    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );

    const initialLeavingAtom = getAtomLocator(page, { atomLabel: 'H' }).first();
    await expect(initialLeavingAtom).toBeVisible();
    const initialPosition = await initialLeavingAtom.boundingBox();
    expect(initialPosition).not.toBeNull();

    // Change leaving atom from H to OH using the dialog method
    await createMonomerDialog.changeAttachmentPointAtom({
      attachmentPointName: AttachmentPointOption.R1,
      newAtom: AttachmentPointAtom.OH,
    });

    const changedLeavingAtom = getAtomLocator(page, { atomLabel: 'O' }).first();
    await expect(changedLeavingAtom).toBeVisible();
    const changedPosition = await changedLeavingAtom.boundingBox();
    expect(changedPosition).not.toBeNull();

    // Verify original H leaving group atom is replaced, not kept in parallel.
    const originalLeavingAtom = getAtomLocator(page, {
      atomLabel: 'H',
    }).first();
    await expect(originalLeavingAtom).toBeHidden();

    if (initialPosition && changedPosition) {
      const initialCenterX =
        initialPosition.x + initialPosition.width / centerDivider;
      const initialCenterY =
        initialPosition.y + initialPosition.height / centerDivider;
      const changedCenterX =
        changedPosition.x + changedPosition.width / centerDivider;
      const changedCenterY =
        changedPosition.y + changedPosition.height / centerDivider;

      expect(Math.abs(initialCenterX - changedCenterX)).toBeLessThanOrEqual(
        positionTolerancePx,
      );
      expect(Math.abs(initialCenterY - changedCenterY)).toBeLessThanOrEqual(
        positionTolerancePx,
      );
    }

    // Verify the leaving atom type has changed.
    await expect
      .poll(async () =>
        (await r1AtomDropdown.textContent())?.replace(/\u200b/g, '').trim(),
      )
      .toBe(getAttachmentPointAtomLabel(AttachmentPointAtom.OH));
  });

  test('Case 5 - Verify currently selected LGA is visually indicated in dropdown', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: The currently selected LGA should be visually indicated in the dropdown list
     * Scenario:
     * 1. Create an attachment point with a specific leaving atom
     * 2. Open the dropdown
     * 3. Verify the current selection is visually indicated (highlighted, checked, etc.)
     * 4. Change selection and verify the indication updates
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CCCCC',
    );

    await markAtomAsConnectionPoint('C');

    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );

    // Initial state - H should be selected by default
    await r1AtomDropdown.click();

    // Check which option is selected/highlighted
    await expectAttachmentPointAtomOptionSelected(AttachmentPointAtom.H);

    // Close and reopen, select OH
    await page.keyboard.press('Escape');
    await createMonomerDialog.changeAttachmentPointAtom({
      attachmentPointName: AttachmentPointOption.R1,
      newAtom: AttachmentPointAtom.OH,
    });

    // Open dropdown again and verify OH is now indicated as selected
    await r1AtomDropdown.click();
    await expectAttachmentPointAtomOptionSelected(AttachmentPointAtom.OH);

    await page.keyboard.press('Escape');
  });

  test('Case 6 - Verify dropdown behavior with multiple attachment points', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: Each attachment point should have independent dropdown behavior
     * Scenario:
     * 1. Create multiple attachment points with different leaving atoms
     * 2. Verify each dropdown shows correct options based on its current LGA
     * 3. Verify changes to one dropdown don't affect others
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CCCCCC',
    );

    // Create first and second attachment points
    await markAtomAsConnectionPoint('C', 0);
    await markAtomAsConnectionPoint('C', 1);

    // Change second attachment point to a non-H/OH LGA.
    await createMonomerDialog.changeAttachmentPointAtom({
      attachmentPointName: AttachmentPointOption.R2,
      newAtom: AttachmentPointAtom.CH3,
    });

    // Verify first attachment point dropdown still shows H, OH only
    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );
    const r2AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R2,
    );

    const r2CurrentLgaText = (await r2AtomDropdown.textContent())
      ?.replace(/\u200b/g, '')
      .trim();
    expect(r2CurrentLgaText).toBeTruthy();

    await r1AtomDropdown.click();

    let optionTexts = await getVisibleAttachmentPointAtomOptionTexts();
    expect(optionTexts).toEqual(['H', 'OH']);

    await page.keyboard.press('Escape');

    // Verify second attachment point dropdown reflects non-special current LGA
    await r2AtomDropdown.click();

    optionTexts = await getVisibleAttachmentPointAtomOptionTexts();
    expect(optionTexts.length).toBeGreaterThanOrEqual(
      minimumDropdownOptionsCount,
    );
    expect(optionTexts[0]).toBe('H');
    expect(optionTexts[1]).toBe('OH');
    expect(optionTexts[2]).toBe(r2CurrentLgaText);

    await page.keyboard.press('Escape');
  });

  test('Case 7 - Verify dropdown behavior after atom type changes', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10018
     * Description: Dropdown options should update correctly when current leaving atom selection changes
     * Scenario:
     * 1. Create attachment point with one atom type
     * 2. Change the leaving atom via dropdown to a different type
     * 3. Verify dropdown options update accordingly
     *
     * Version 3.12
     */

    const createMonomerDialog = await openCreateMonomerDialogWithChemType(
      'CBr(C)C',
    );

    // Create attachment point with non-H/OH initial atom type.
    await markAtomAsLeavingGroup('C');

    const r1AtomDropdown = createMonomerDialog.getAttachmentPointAtomCombobox(
      AttachmentPointOption.R1,
    );

    // Verify options for non-H/OH LGA.
    await r1AtomDropdown.click();
    const initialTexts = await getVisibleAttachmentPointAtomOptionTexts();

    expect(initialTexts.length).toBeGreaterThanOrEqual(
      minimumDropdownOptionsCount,
    );
    expect(initialTexts[0]).toBe('H');
    expect(initialTexts[1]).toBe('OH');
    expect(initialTexts[2]).not.toMatch(/^(H|OH)$/);

    await page.keyboard.press('Escape');

    // Modify leaving atom to OH and verify options update accordingly.
    await createMonomerDialog.changeAttachmentPointAtom({
      attachmentPointName: AttachmentPointOption.R1,
      newAtom: AttachmentPointAtom.OH,
    });

    await r1AtomDropdown.click();
    const changedTexts = await getVisibleAttachmentPointAtomOptionTexts();
    expect(changedTexts).toEqual(['H', 'OH']);

    await page.keyboard.press('Escape');
  });
});
