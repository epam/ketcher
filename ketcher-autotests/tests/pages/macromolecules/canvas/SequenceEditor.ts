import { Page } from '@playwright/test';

export const SequenceEditor = (page: Page) => {
  const sequenceStartArrow = page.getByTestId('sequence-start-arrow');

  return {
    async waitForEditModeToExit() {
      await sequenceStartArrow.first().waitFor({ state: 'hidden' });
    },
  };
};
