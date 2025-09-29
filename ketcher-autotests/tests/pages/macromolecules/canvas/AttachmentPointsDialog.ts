import { Page, Locator } from '@playwright/test';
import {
  LeftMonomerConnectionPointButton,
  MonomerOverview,
  RightMonomerConnectionPointButton,
} from '../constants/connectionPointsDialog/Constants';
import { AttachmentPoint } from '@utils/macromolecules/monomer';

type AttachmentPointsDialogLocators = {
  ConnectionPointsDialogWindow: Locator;
  closeButton: Locator;
  expandWindowButton: Locator;
  leftMonomerOverview: Locator;
  rightMonomerOverview: Locator;
  connectButton: Locator;
  reconnectButton: Locator;
  cancelButton: Locator;
};

export const AttachmentPointsDialog = (page: Page) => {
  const locators: AttachmentPointsDialogLocators = {
    ConnectionPointsDialogWindow: page.getByTestId('monomer-connection-modal'),
    closeButton: page.getByTestId('close-window-button'),
    expandWindowButton: page.getByTestId('expand-window-button'),
    leftMonomerOverview: page.getByTestId(MonomerOverview.LeftMonomer),
    rightMonomerOverview: page.getByTestId(MonomerOverview.RightMonomer),
    connectButton: page.getByTestId('Connect-button'),
    reconnectButton: page.getByTestId('Reconnect-button'),
    cancelButton: page.getByTestId('cancel-button'),
  };

  return {
    ...locators,

    async isVisible() {
      return await locators.ConnectionPointsDialogWindow.isVisible();
    },

    async close() {
      await locators.closeButton.click();
      await locators.closeButton.waitFor({ state: 'detached' });
    },

    async expandWindow() {
      await locators.expandWindowButton.click();
    },

    async selectAttachmentPoints(buttons: {
      leftMonomer?: AttachmentPoint;
      rightMonomer?: AttachmentPoint;
    }) {
      await this.ConnectionPointsDialogWindow.waitFor({ state: 'visible' });
      const leftAttachmentPointButton = buttons.leftMonomer
        ? LeftMonomerConnectionPointButton[buttons.leftMonomer]
        : null;
      const rightAttachmentPointButton = buttons.rightMonomer
        ? RightMonomerConnectionPointButton[buttons.rightMonomer]
        : null;

      if (
        leftAttachmentPointButton &&
        !(await this.isActive(leftAttachmentPointButton))
      ) {
        await page.getByTestId(leftAttachmentPointButton).click();
      }
      if (
        rightAttachmentPointButton &&
        !(await this.isActive(rightAttachmentPointButton))
      ) {
        await page.getByTestId(rightAttachmentPointButton).click();
      }
    },

    async isActive(button: string): Promise<boolean> {
      return (
        (await page.getByTestId(button).getAttribute('data-isActive')) ===
        'true'
      );
    },

    async reconnect() {
      await locators.reconnectButton.click();
    },

    async connect() {
      await locators.connectButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },
  };
};

export type ConnectionPointsDialogLocatorsType = ReturnType<
  typeof AttachmentPointsDialog
>;
