import { Page } from '@playwright/test';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { waitForModeSwitch } from './waitForModeSwitch';

export const waitForLayoutModeSwitch = async (
  page: Page,
  callback: () => Promise<void>,
  mode: LayoutMode,
  ketcherId: string,
  timeout?: number,
) =>
  waitForModeSwitch(
    page,
    callback,
    'layoutModeSwitchComplete',
    mode,
    ketcherId,
    timeout,
  );
