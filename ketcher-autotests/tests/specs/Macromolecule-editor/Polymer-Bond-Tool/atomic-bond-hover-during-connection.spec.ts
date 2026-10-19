import { test, expect, Locator } from '@fixtures';
import { setMolecule, waitForPageInit } from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

async function atomPosition(atom: Locator) {
  return atom.evaluate((element) => {
    const matrix = (element as SVGGraphicsElement).getScreenCTM();
    if (!matrix) throw new Error('Atom has no screen transform');
    const point = new DOMPoint(0, 0).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  });
}

async function bondState(bond: Locator) {
  return bond.evaluate((element) => {
    const renderer = (
      element as SVGElement & {
        __data__: {
          bond: { selected: boolean };
          hoverElement?: { node(): Element | null };
        };
      }
    ).__data__;
    return {
      highlighted: Boolean(renderer.hoverElement?.node()?.isConnected),
      selected: renderer.bond.selected,
    };
  });
}

for (const mode of [LayoutMode.Flex, LayoutMode.Snake]) {
  test(`#11889 atomic bond hover and atom targeting during connection drawing in ${mode}`, async ({
    page,
  }) => {
    await waitForPageInit(page);
    await setMolecule(page, 'CC');
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(mode);
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });

    const canvas = page.locator('#polymer-editor-canvas');
    const bond = canvas.locator('g[data-fromatomid][data-toatomid]');
    await expect(bond).toHaveCount(1);
    const fromAtomId = await bond.getAttribute('data-fromatomid');
    const toAtomId = await bond.getAttribute('data-toatomid');
    const atoms = [fromAtomId, toAtomId].map((id) =>
      canvas.locator(`g[data-testid="atom"][data-atomid="${id}"]`),
    );
    const positions = await Promise.all(atoms.map(atomPosition));
    const midpoint = {
      x: (positions[0].x + positions[1].x) / 2,
      y: (positions[0].y + positions[1].y) / 2,
    };

    await CommonLeftToolbar(page).areaSelectionTool();
    await page.mouse.move(midpoint.x, midpoint.y);
    await expect
      .poll(async () => (await bondState(bond)).highlighted)
      .toBe(true);

    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    await getMonomerLocator(page, Peptide.A).hover();
    await page.mouse.down();
    await expect(canvas).toHaveAttribute('data-drawing-connection', '');
    await expect
      .poll(async () => (await bondState(bond)).highlighted)
      .toBe(false);

    // The baseline Snake preview visibility bug is outside this regression.
    await page.mouse.move(midpoint.x, midpoint.y);
    await expect
      .poll(async () => (await bondState(bond)).highlighted)
      .toBe(false);
    await expect
      .poll(() =>
        bond.evaluate((element) => getComputedStyle(element).pointerEvents),
      )
      .toBe('none');

    for (let index = 0; index < atoms.length; index++) {
      // Move slightly toward the bond to exercise overlapping atom/bond hit areas.
      const position = positions[index];
      const distance = Math.hypot(
        midpoint.x - position.x,
        midpoint.y - position.y,
      );
      const point = {
        x: position.x + (3 * (midpoint.x - position.x)) / distance,
        y: position.y + (3 * (midpoint.y - position.y)) / distance,
      };
      await page.mouse.move(point.x, point.y);
      await expect(atoms[index].locator('.dynamic-element')).toHaveAttribute(
        'opacity',
        '1',
      );
      await expect
        .poll(() =>
          page.evaluate(
            ({ x, y }) =>
              document
                .elementFromPoint(x, y)
                ?.closest('[data-atomid]')
                ?.getAttribute('data-atomid'),
            point,
          ),
        )
        .toBe(index === 0 ? fromAtomId : toAtomId);
      await expect
        .poll(async () => (await bondState(bond)).highlighted)
        .toBe(false);
    }

    await page.mouse.move(midpoint.x, midpoint.y + 80);
    await page.mouse.up();
    await expect(canvas).not.toHaveAttribute('data-drawing-connection', '');
    await CommonLeftToolbar(page).areaSelectionTool();
    await page.mouse.move(midpoint.x, midpoint.y);
    await expect
      .poll(async () => (await bondState(bond)).highlighted)
      .toBe(true);
    await page.mouse.click(midpoint.x, midpoint.y);
    await expect.poll(async () => (await bondState(bond)).selected).toBe(true);
  });
}
