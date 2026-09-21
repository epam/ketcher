import { test, expect, Page, Locator } from '@fixtures';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Library } from '@tests/pages/macromolecules/Library';
import { getVisibleCanvas } from '@utils/canvas';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

let page: Page;

/**
 * TEMPORARY SPIKE — Phase 0 of the drag-and-drop replacement test plan
 * (e2e-test-plan-7455-drag-drop-replacement.md).
 *
 * Goal: confirm that dropping a library monomer onto an existing canvas
 * monomer's center replaces it headless, and that dropping outside the
 * 10 px radius simply adds a new monomer. Delete this file after Phase 0.
 */
test.describe('Spike: drag-and-drop monomer replacement (issue #7455)', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  const FIRST_MONOMER_X = 300;
  const FIRST_MONOMER_Y = 300;
  // Must be greater than the 10 px replacement radius.
  const OUT_OF_RADIUS_OFFSET = 40;

  /** Canvas-relative coordinates of a canvas monomer's center. */
  async function getMonomerCenterInCanvasCoords(target: Locator) {
    const canvasBB = await (await getVisibleCanvas(page)).boundingBox();
    const targetBB = await target.boundingBox();
    if (!canvasBB || !targetBB) {
      throw new Error('Canvas or target monomer bounding box is not available');
    }
    return {
      x: targetBB.x + targetBB.width / 2 - canvasBB.x,
      y: targetBB.y + targetBB.height / 2 - canvasBB.y,
    };
  }

  test('Spike 1: dropping a monomer on another monomer center replaces it', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: FIRST_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);

    const targetCenter = await getMonomerCenterInCanvasCoords(
      getMonomerLocator(page, Peptide.A),
    );
    await Library(page).dragMonomerOnCanvas(Peptide.C, targetCenter);

    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(0);
    expect(await getMonomerLocator(page, Peptide.C).count()).toBe(1);
  });

  test('Spike 2: dropping outside the 10 px radius adds a new monomer', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: FIRST_MONOMER_X,
      y: FIRST_MONOMER_Y,
    });

    const targetCenter = await getMonomerCenterInCanvasCoords(
      getMonomerLocator(page, Peptide.A),
    );
    await Library(page).dragMonomerOnCanvas(Peptide.C, {
      x: targetCenter.x + OUT_OF_RADIUS_OFFSET,
      y: targetCenter.y,
    });

    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
    expect(await getMonomerLocator(page, Peptide.C).count()).toBe(1);
  });
});
