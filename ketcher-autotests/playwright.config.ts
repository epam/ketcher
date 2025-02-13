import * as dotenv from 'dotenv';
import * as os from 'os';
import { PlaywrightTestConfig, devices } from '@playwright/test';
import {
  REMOTE_URL,
  STANDALONE_URL,
  DEFAULT_KETCHER_STANDALONE_URL,
  MODES,
  STANDALONE_REACT_MUI_MATERIAL_DIALOG_857X648_URL,
  REMOTE_REACT_MUI_MATERIAL_DIALOG_857X648_URL,
} from './constants';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const ignoredTests = [
  // 'API/**',
  // 'File-Management/Smile-Files/smile-files.spec.ts',
  // 'Examples/**',
  // 'Indigo-Tools/**',
  // 'R-group-tool/**',
  // 'Reagents/**',
  // 'Structure-Creating-&-Editing/**',
  // 'Templates/Functional-Groups/functional-groups.spec.ts',
  // 'Templates/Functional-Groups/Functional-Group-Tools/functional-group-tools.spec.ts',
  // 'Templates/Salts-and-Solvents/**',
  // 'Templates/User-Templates/**',
  'utils/**',
];

const testDir = './tests';

function baseURLFullScale(): string {
  if (!process.env.MODE || !process.env.KETCHER_URL) {
    return DEFAULT_KETCHER_STANDALONE_URL;
  }

  if (process.env.MODE === MODES.STANDALONE) {
    return `${process.env.KETCHER_URL}${STANDALONE_URL}`;
  }

  return `${process.env.KETCHER_URL}${REMOTE_URL}`;
}

function baseURLReactMUI857x648(): string {
  if (!process.env.MODE || !process.env.KETCHER_URL) {
    return DEFAULT_KETCHER_STANDALONE_URL;
  }

  if (process.env.MODE === MODES.STANDALONE) {
    return `${process.env.KETCHER_URL}${STANDALONE_REACT_MUI_MATERIAL_DIALOG_857X648_URL}`;
  }
  return `${process.env.KETCHER_URL}${REMOTE_REACT_MUI_MATERIAL_DIALOG_857X648_URL}`;
}

const MAX_NUMBER_OF_RETRIES = 2;
// const MAX_NUMBER_OF_FAILURES = 3;
const isCI = process.env.CI_ENVIRONMENT === 'true';
let numWorkers = os.cpus().length;
if (process.env.NUM_WORKERS) {
  numWorkers = Number(process.env.NUM_WORKERS);
}

function getIgnoredFiles(): string[] {
  let ignored = [] as string[];
  if (process.env.IGNORE_UNSTABLE_TESTS) {
    ignored = ignoredTests;
  }

  return ignored;
}

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./setup.ts'),
  testDir,
  /* Maximum time one test can run for. */
  timeout: 60_000,
  testIgnore: getIgnoredFiles(),
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
  // maxFailures: isCI ? MAX_NUMBER_OF_FAILURES : 0,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? MAX_NUMBER_OF_RETRIES : 0,
  /* Opt out of parallel tests on CI. */
  // eslint-disable-next-line no-magic-numbers
  workers: numWorkers,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        open: process.env.DOCKER ? 'never' : 'on-failure',
      },
    ],
    // [isCI ? 'dot' : 'line'],
    ['line'],
    [
      'json',
      {
        outputFile: 'results.json',
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: isCI ? 'off' : 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-fullscale',
      use: {
        ...devices['Desktop Chrome'],
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: baseURLFullScale(),
        launchOptions: {
          headless: true,
        },
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
        // Screenshots will be stored in default dir - `.spec.ts-snapshots/`
      },
    },
    {
      name: 'chromium-ReactMUI857x648',
      use: {
        ...devices['Desktop Chrome'],
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: baseURLReactMUI857x648(),
        launchOptions: {
          headless: true,
        },
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
        // Screenshots will be stored in the directory defined at setup.ts
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
};

// eslint-disable-next-line no-restricted-exports
export default config;
