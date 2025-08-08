import * as dotenv from 'dotenv';
import * as os from 'os';
import { PlaywrightTestConfig, devices } from '@playwright/test';
import {
  REMOTE_URL,
  STANDALONE_URL,
  DEFAULT_KETCHER_STANDALONE_URL,
  MODES,
  STANDALONE_POPUP_URL,
  REMOTE_POPUP_URL,
} from './constants';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
// Addign global beforeEach from testSetup
// import './tests/testSetup';

function baseURLFullScale(): string {
  if (!process.env.MODE || !process.env.KETCHER_URL) {
    return DEFAULT_KETCHER_STANDALONE_URL;
  }

  if (process.env.MODE === MODES.STANDALONE) {
    return `${process.env.KETCHER_URL}${STANDALONE_URL}`;
  }

  return `${process.env.KETCHER_URL}${REMOTE_URL}`;
}

function baseURLPopup(): string {
  if (!process.env.MODE || !process.env.KETCHER_URL) {
    return DEFAULT_KETCHER_STANDALONE_URL;
  }

  if (process.env.MODE === MODES.STANDALONE) {
    return `${process.env.KETCHER_URL}${STANDALONE_POPUP_URL}`;
  }
  return `${process.env.KETCHER_URL}${REMOTE_POPUP_URL}`;
}

const MAX_NUMBER_OF_RETRIES = 2;
const isCI = process.env.CI_ENVIRONMENT === 'true';
let numWorkers = os.cpus().length;
if (process.env.NUM_WORKERS) {
  numWorkers = Number(process.env.NUM_WORKERS);
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}',

  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? MAX_NUMBER_OF_RETRIES : 0,
  workers: numWorkers,
  reporter: [
    ['html', { open: process.env.DOCKER ? 'never' : 'on-failure' }],
    ['line'],
    ['json', { outputFile: './playwright-report/results.json' }],
  ],
  use: {
    actionTimeout: 0,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    trace: isCI ? 'off' : 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: baseURLFullScale(),
        launchOptions: { headless: true },
        contextOptions: { permissions: ['clipboard-read', 'clipboard-write'] },
      },
    },
    {
      // former chromium-ReactMUI857x648
      name: 'chromium-popup',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: baseURLPopup(),
        launchOptions: { headless: true },
        contextOptions: { permissions: ['clipboard-read', 'clipboard-write'] },
      },
    },
  ],
};

// eslint-disable-next-line no-restricted-exports
export default config;
