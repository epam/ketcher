import { Page } from '@playwright/test';
import { getKet } from '@utils/formats';
import { getImageLocator } from './getImageLocator';

export type ImagePoint = { x: number; y: number };

type KetNode = { type?: string; format?: string };

export async function getImageCenter(page: Page): Promise<ImagePoint> {
  const box = await getImageLocator(page, {}).boundingBox();
  if (!box) {
    throw new Error('Image is not visible on the canvas');
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function getDistanceFromImageTo(
  page: Page,
  point: ImagePoint,
): Promise<number> {
  const center = await getImageCenter(page);
  return Math.hypot(center.x - point.x, center.y - point.y);
}

/** Image nodes of the structure as they are saved to KET */
export async function getImageNodesFromKet(page: Page): Promise<KetNode[]> {
  const ket = JSON.parse(await getKet(page));
  return (ket.root.nodes as KetNode[]).filter((node) => node.type === 'image');
}
