import * as dotenv from 'dotenv';
import { PlaywrightTestConfig, devices } from '@playwright/test';
import {
  REMOTE_URL,
  STANDALONE_URL,
  DEFAULT_KETCHER_STANDALONE_URL,
  MODES,
} from './constants';

dotenv.config();
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const ignoredTests = [
  'clean-tools.spec.ts',
  '**/Open-And-Save-Files/**',
  'Examples/**',
  'File-Management/**',
  'Indigo-Tools/**',
  'R-group-tool/**',
  'Reagents/**',
  'Structure-Creating-&-Editing/**',
  'Templates/**',
  'User-Interface/**',
];

function baseURL(): string {
  if (!process.env.MODE || !process.env.KETCHER_URL) {
    return DEFAULT_KETCHER_STANDALONE_URL;
  }

  if (process.env.MODE === MODES.STANDALONE) {
    return `${process.env.KETCHER_URL}${STANDALONE_URL}`;
  }

  return `${process.env.KETCHER_URL}${REMOTE_URL}`;
}

const MAX_NUMBER_OF_RETRIES = 2;

const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 120_000,
  testIgnore: process.env.IGNORE_UNSTABLE_TESTS ? ignoredTests : undefined,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */

    // toHaveScreenshot: {
    //   /* An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1. */
    //   maxDiffPixelRatio: 0.01,
    // },
    timeout: 10_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  retries: process.env.CI ? MAX_NUMBER_OF_RETRIES : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        open: process.env.DOCKER ? 'never' : 'on-failure',
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    viewport: { width: 1920, height: 1080 },
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: baseURL(),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          headless: true,
        },
      },
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     launchOptions: {
    //       headless: true,
    //     },
    //   },
    // },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
};

export default config;
