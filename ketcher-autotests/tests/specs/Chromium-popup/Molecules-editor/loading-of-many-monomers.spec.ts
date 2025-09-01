/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { openFileAndAddToCanvasAsNewProject } from '@utils';

const countByDataSgroupName = (page: Page): Promise<number> =>
  page.evaluate(() => document.querySelectorAll('[data-sgroup-name]').length);

let page: Page;

test.describe('Loading of many monomers to Micro', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test(
    'Case 1: Check that we can open a chain of 500 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 500 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 500 monomers
       */
      const expected = 500;
      await openFileAndAddToCanvasAsNewProject(page, 'KET/500-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );

  test(
    'Case 2: Check that we can open a chain of 1000 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 1000 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 1000 monomers
       */
      const expected = 1000;
      test.slow();
      await openFileAndAddToCanvasAsNewProject(page, 'KET/1000-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );

  test(
    'Case 3: Check that we can open a chain of 1500 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 1500 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 1500 monomers
       */
      const expected = 1500;
      test.slow();
      await openFileAndAddToCanvasAsNewProject(page, 'KET/1500-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );

  test(
    'Case 4: Check that we can open a chain of 2000 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 2000 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 2000 monomers
       */
      const expected = 2000;
      test.slow();
      await openFileAndAddToCanvasAsNewProject(page, 'KET/2000-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );

  test(
    'Case 5: Check that we can open a chain of 2500 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 2500 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 2500 monomers
       */
      const expected = 2500;
      test.slow();
      await openFileAndAddToCanvasAsNewProject(page, 'KET/2500-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );

  test(
    'Case 6: Check that we can open a chain of 3000 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 3000 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 3000 monomers
       */
      const expected = 3000;
      test.slow();
      await openFileAndAddToCanvasAsNewProject(page, 'KET/3000-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );

  test(
    'Case 7: Check that we can open a chain of 3500 monomers in Micro mode',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7351
       * Description: Check that we can open a chain of 3500 monomers in Micro mode
       * Scenario:
       * 1. Go to Micro mode
       * 2. Open file with a chain of 3500 monomers
       */
      const expected = 3500;
      test.slow();
      await openFileAndAddToCanvasAsNewProject(page, 'KET/3500-peptides.ket');
      const actual = await countByDataSgroupName(page);
      expect(actual).toBe(expected);
    },
  );
});
