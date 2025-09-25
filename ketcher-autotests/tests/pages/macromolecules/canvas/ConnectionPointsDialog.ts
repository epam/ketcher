import { Page, Locator } from '@playwright/test';
import {
  LeftMonomerConnectionPoint,
  MonomerOverview,
  RightMonomerConnectionPoint,
} from '../constants/connectionPointsDialog/Constants';

type ConnectionPointsLocators = {
  closeButton: Locator;
  expandWindowButton: Locator;
  leftMonomerOverview: Locator;
  rightMonomerOverview: Locator;
  connectButton: Locator;
  reconnectButton: Locator;
  cancelButton: Locator;
};

export const ConnectionPointsDialog = (page: Page) => {
  const locators: ConnectionPointsLocators = {
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

    async close() {
      await locators.closeButton.click();
      await locators.closeButton.waitFor({ state: 'detached' });
    },

    async expandWindow() {
      await locators.expandWindowButton.click();
    },

    async selectConnectionPoint(
      button: LeftMonomerConnectionPoint | RightMonomerConnectionPoint,
    ) {
      if (!(await this.isActive(button))) {
        await page.getByTestId(button).click();
      }
    },

    async selectConnectionPoints(
      buttons: [LeftMonomerConnectionPoint, RightMonomerConnectionPoint],
    ) {
      for (const button of buttons) {
        await this.selectConnectionPoint(button);
      }
    },

    async isActive(
      button: LeftMonomerConnectionPoint | RightMonomerConnectionPoint,
    ): Promise<boolean> {
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
