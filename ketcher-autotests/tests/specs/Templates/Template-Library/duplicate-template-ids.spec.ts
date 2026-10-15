import { test, expect } from '@fixtures';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { waitForPageInit } from '@utils';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  BicyclesTemplate,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';

/**
 * Regression test for issue #7434.
 *
 * Three SDF entries all named "Bicyclo[4-2-1]nonane" have different atom
 * coordinates and should render distinct previews. This verifies:
 *   1. Each card is reachable by its distinct data-testid (_0 / _1 / _2).
 *   2. The full set of bond-path geometries (all [data-testid="bond"] paths)
 *      differs between every pair of cards, confirming the WeakMap-keyed
 *      cache does not collapse them into one shared preview.
 */
test.describe('Template-Library — duplicate name disambiguation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Bicyclo[4-2-1]nonane cards have distinct IDs and distinct SVG bond geometry', async ({
    page,
  }) => {
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).openSection(TemplateLibraryTab.Bicycles);

    const ids = [
      BicyclesTemplate.Bicyclo421NonaneI,
      BicyclesTemplate.Bicyclo421NonaneII,
      BicyclesTemplate.Bicyclo421NonaneIII,
    ] as const;

    // Progressive rendering: cards at group-positions 10-12 are loaded after
    // the initial 4 + at least two idle/rAF batches.  Wait for the first
    // [data-testid="bond"] element inside each card's SVG rather than waiting
    // only for the SVG container, so we know actual geometry is present.
    for (const id of ids) {
      await page
        .getByTestId(id)
        .locator('[data-testid="bond"]')
        .first()
        .waitFor({ state: 'attached', timeout: 15_000 });
    }

    /**
     * Returns a canonical string representing the complete bond-path geometry
     * for one template card.  Every [data-testid="bond"] element's full 'd'
     * attribute is collected, sorted alphabetically (to be independent of
     * rendering order), and joined with a pipe separator.
     */
    const getBondGeometry = async (testId: string): Promise<string> => {
      const bondLocator = page
        .getByTestId(testId)
        .locator('[data-testid="bond"]');

      const count = await bondLocator.count();
      expect(count).toBeGreaterThan(0);

      const dAttrs = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          bondLocator.nth(i).getAttribute('d'),
        ),
      );

      return dAttrs
        .filter((d): d is string => d !== null)
        .sort()
        .join('|');
    };

    const [geom0, geom1, geom2] = await Promise.all(ids.map(getBondGeometry));

    // All three variants must carry distinct complete bond geometries.
    expect(geom0).not.toBe(geom1);
    expect(geom1).not.toBe(geom2);
    expect(geom0).not.toBe(geom2);
  });
});
