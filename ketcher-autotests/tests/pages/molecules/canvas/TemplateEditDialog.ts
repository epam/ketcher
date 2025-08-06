/* eslint-disable prettier/prettier */
/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { AtomAttributes, BondAttributes } from '@utils/canvas';
import { getBondByIndex } from '@utils/canvas/bonds';
import { clickOnAtomById, clickOnBondById } from '@utils/clicks';

type TemplateEditDialogLocators = {
  dialog: Locator;
  closeWindowButton: Locator;
  moleculeNameInput: Locator;
  selectedAttachmentPoints: Locator;
  cancelButton: Locator;
  editButton: Locator;
  canvas: Locator;
};
export const TemplateEditDialog = (page: Page) => {
  const locators: TemplateEditDialogLocators = {
    dialog: page.getByTestId('attach-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    moleculeNameInput: page.getByTestId('name-input'),
    selectedAttachmentPoints: page.getByTestId('attach-output'),
    cancelButton: page.getByTestId('template-cancel-button'),
    editButton: page.getByTestId('template-edit-button'),
    canvas: page.getByTestId('canvas'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },
    async edit() {
      await waitForRender(page, async () => {
        await locators.editButton.click({ force: true });
      });
    },
    async cancel() {
      await locators.cancelButton.click({ force: true });
    },
    async setMoleculName(name: string) {
      await locators.moleculeNameInput.fill(name);
    },
    async getMoleculeName(): Promise<string> {
      return await locators.moleculeNameInput.inputValue();
    },
    async selectAtom(attrs: AtomAttributes, index: number) {
      const { x, y } = await getAtomByIndex(page, attrs, index);
      await page.getByTestId('attach-dialog').getByTestId('canvas').click();
      await page.mouse.click(x, y);
    },
    async selectBond(attrs: BondAttributes, index: number) {
      const { x, y } = await getBondByIndex(page, attrs, index);
      await page.getByTestId('attach-dialog').getByTestId('canvas').click();
      await page.mouse.click(x, y);
    },
    async getSelectedAttachmentPoints(): Promise<{
      atomId: number | null;
      bondId: number | null;
      raw: string;
    }> {
      const raw = (await locators.selectedAttachmentPoints.inputValue()).trim();
      const m = /Atom ID:\s*(\d+)\s+Bond ID:\s*(\d+)/i.exec(raw);
      return {
        atomId: m?.[1] ? Number(m[1]) : null,
        bondId: m?.[2] ? Number(m[2]) : null,
        raw,
      };
    },
    async clickOnCanvas(x: number, y: number) {
      await locators.canvas.click({ position: { x, y } });
    },
    async selectAtomById(atomId: number) {
      await page.getByTestId('attach-dialog').getByTestId('canvas').click();
      await clickOnAtomById(page, atomId);
    },
    async selectBondById(_bondId: number) {
      await page.getByTestId('attach-dialog').getByTestId('canvas').click();
      await clickOnBondById(page, _bondId);
    },
  };
};

export type TemplateEditDialogType = ReturnType<typeof TemplateEditDialog>;
