// /* eslint-disable no-unsafe-optional-chaining */
// import { Page } from '@playwright/test';

// import {
//   ArrowXy,
//   AtomAttributes,
//   BondAttributes,
//   AtomXy,
//   BondXy,
//   PlusXy,
//   SORT_TYPE,
// } from './types';
// import { findIntersectionFields } from './common/findIntersectionFields';
// import { getLeftTopBarSize } from './common/getLeftTopBarSize';
// import { sortItems } from './common/sortItems';
// import { NO_STRUCTURE_AT_THE_CANVAS_ERROR } from './constants';

// export enum EntityType {
//   atom = 'atoms',
//   arrow = 'rxnArrows',
//   plus = 'rxnPluses',
//   bond = 'bonds',
// }

// const getEntityCoordsCallback = (entityType: EntityType) => {
//   const coordsReducer =
//     (pos) => (entity, scale, offset, leftBarWidth, topBarHeight) => {
//       return {
//         ...entity,
//         x: entity[pos].x * scale + offset.x + leftBarWidth,
//         y: entity[pos].y * scale + offset.y + topBarHeight,
//       };
//     };

//   switch (entityType) {
//     case EntityType.arrow:
//       return coordsReducer('pos[0]');
//     case EntityType.atom:
//       return coordsReducer('pp');
//     case EntityType.bond:
//       return coordsReducer('center');
//     case EntityType.plus:
//       return coordsReducer('pp');
//   }
// };

// type TT = ArrowXy | PlusXy | AtomXy | BondXy;
// export async function getDrawingEntitiesByIndex(
//   page: Page,
//   index: number,
//   type: EntityType,
//   sortBy: SORT_TYPE = SORT_TYPE.ASC_X,
//   attrs?: AtomAttributes | BondAttributes, // >>?
// ): Promise<TT> {
//   const { entities, scale, offset } = await page.evaluate(() => {
//     return {
//       entities: [...window.ketcher?.editor?.struct()?.[type]?.values()],
//       scale: window.ketcher?.editor?.options()?.scale,
//       offset: window.ketcher?.editor?.options()?.offset,
//     };
//   });

//   const targets = [EntityType.atom, EntityType.bond].includes(type)
//     ? findIntersectionFields(attrs, entities)
//     : entities;

//   if (targets.length === 0) {
//     throw new Error(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
//   }

//   const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);

//   const entityCb = getEntityCoordsCallback(type);

//   const coords = targets.map((entity) =>
//     entityCb(entity, scale, offset, leftBarWidth, topBarHeight),
//   );
//   //   expect(coords).toBe('');
//   const x = sortItems(sortBy, coords)[index];
//   return x;
// }
