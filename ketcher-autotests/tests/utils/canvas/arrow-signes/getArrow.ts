import { Page } from '@playwright/test/types/test';
import { EntityType, getDrawingEntitiesByIndex } from '../getDrawingEntities';

export async function clickOnArrow(page: Page, index: number) {
  const { x, y } = await getDrawingEntitiesByIndex(
    page,
    index,
    EntityType.arrow,
  );
  await page.mouse.click(x, y);
}
// import { getLeftTopBarSize } from '../common/getLeftTopBarSize';
// import { sortItems } from '../common/sortItems';
// import { NO_STRUCTURE_AT_THE_CANVAS_ERROR } from '../constants';
// import { ArrowXy, SORT_TYPE } from '../types';

// export async function getArrowsByIndex(
//   page: Page,
//   index: number,
//   sortBy: SORT_TYPE = SORT_TYPE.ASC_X,
// ): Promise<ArrowXy> {
//   const { arrows, scale, offset } = await page.evaluate(() => {
//     return {
//       // eslint-disable-next-line no-unsafe-optional-chaining
//       arrows: [...window.ketcher?.editor?.struct()?.rxnArrows?.values()],
//       scale: window.ketcher?.editor?.options()?.scale,
//       offset: window.ketcher?.editor?.options()?.offset,
//     };
//   });

//   if (arrows.length === 0) {
//     throw new Error(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
//   }
//   const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
//   const coords = arrows.map((arrow) => {
//     return {
//       ...arrow,
//       x: arrow.pp.x * scale + offset.x + leftBarWidth,
//       y: arrow.pp.y * scale + offset.y + topBarHeight,
//     };
//   });

//   return sortItems(sortBy, coords)[index];
// }
