import { Page } from '@playwright/test';
import { waitForModeSwitch } from './waitForModeSwitch';

export type CanvasMode = 'molecules' | 'macromolecules';

export const waitForCanvasModeSwitch = async (
  page: Page,
  callback: () => Promise<void>,
  mode: CanvasMode,
  ketcherId: string,
  timeout?: number,
) =>
  waitForModeSwitch(
    page,
    callback,
    'canvasModeSwitchComplete',
    mode,
    ketcherId,
    timeout,
  );
