import { Locator, Page } from '@playwright/test';

async function getBounds(brackets: Locator) {
  const bounds = await Promise.all(
    (await brackets.all()).map((bracket) => bracket.boundingBox()),
  );
  if (bounds.some((box) => box === null)) {
    throw new Error('An S-group bracket is not visible');
  }
  return bounds.filter((box) => box !== null);
}

export const SGroupCanvas = (page: Page) => {
  const brackets = page.getByTestId('canvas').locator('path[stroke="#a9a9a9"]');
  const macroBrackets = page
    .getByTestId('s-group')
    .locator('path[stroke="#a9a9a9"]');
  const phosphateIcon = page
    .getByTestId('canvas')
    .locator('circle[stroke="#b4b9d6" i]');

  return {
    brackets,
    macroBrackets,
    phosphateIcon,

    async bracketBounds() {
      return getBounds(brackets);
    },

    async macroBracketBounds() {
      return getBounds(macroBrackets);
    },

    async drawAroundSingleGroup() {
      const bounds = await this.bracketBounds();
      if (bounds.length !== 2) {
        throw new Error(
          `Expected two S-group brackets, found ${bounds.length}`,
        );
      }
      const left = Math.min(...bounds.map((box) => box.x)) - 40;
      const top = Math.min(...bounds.map((box) => box.y)) - 40;
      const right = Math.max(...bounds.map((box) => box.x + box.width)) + 40;
      const bottom = Math.max(...bounds.map((box) => box.y + box.height)) + 40;
      await page.mouse.move(left, top);
      await page.mouse.down();
      await page.mouse.move(right, bottom, { steps: 10 });
      await page.mouse.up();
    },

    macroHoverOutline(type: 'SRU' | 'SUP') {
      return page
        .getByTestId('s-group')
        .and(page.locator(`[data-sgroup-type="${type}"]`))
        .locator('rect[stroke="#0097A8"]');
    },

    async leftBracketPoint(position: 'outer' | 'inner') {
      const bounds = (await this.bracketBounds()).sort((a, b) => a.x - b.x);
      if (bounds.length !== 4) {
        throw new Error(
          `Expected four S-group brackets, found ${bounds.length}`,
        );
      }
      const bracket = bounds[position === 'outer' ? 0 : 1];
      return { x: bracket.x + 1, y: bracket.y + bracket.height / 2 };
    },

    async openLeftBracket(position: 'outer' | 'inner') {
      const { x, y } = await this.leftBracketPoint(position);
      await page.mouse.dblclick(x, y);
    },

    async clickLeftBracket(position: 'outer' | 'inner') {
      const { x, y } = await this.leftBracketPoint(position);
      await page.mouse.click(x, y);
    },

    async dragLeftBracket(
      position: 'outer' | 'inner',
      offset: { x: number; y: number },
    ) {
      const { x, y } = await this.leftBracketPoint(position);
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + offset.x, y + offset.y, { steps: 10 });
      await page.mouse.up();
    },

    async hoverMacroLeftBracket(position: 'outer' | 'inner') {
      const bounds = (await this.macroBracketBounds()).sort(
        (a, b) => a.x - b.x,
      );
      if (bounds.length !== 4) {
        throw new Error(
          `Expected four S-group brackets, found ${bounds.length}`,
        );
      }
      const bracket = bounds[position === 'outer' ? 0 : 1];
      await page.mouse.move(bracket.x + 1, bracket.y + bracket.height / 2);
    },
  };
};
