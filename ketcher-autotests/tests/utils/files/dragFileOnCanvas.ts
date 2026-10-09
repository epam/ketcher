import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getTestDataDirectory } from './readFile';

type FileDragEvent = 'dragenter' | 'dragover' | 'dragleave' | 'drop';

export type PagePoint = { x: number; y: number };

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
};

const getMoleculesCanvas = (page: Page) =>
  page.locator(
    '[data-testid="ketcher-canvas"][data-canvasmode="molecules-mode"]',
  );

export async function getCanvasCenter(page: Page): Promise<PagePoint> {
  const box = await getMoleculesCanvas(page).boundingBox();
  if (!box) {
    throw new Error('Ketcher canvas is not visible');
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export type BrowserFilePayload = {
  base64: string;
  name: string;
  type: string;
};

export async function getBrowserFilePayload(
  filename: string,
): Promise<BrowserFilePayload> {
  const filePath = path.resolve(getTestDataDirectory(), filename);
  const fileContent = await fs.promises.readFile(filePath);
  return {
    base64: fileContent.toString('base64'),
    name: path.basename(filePath),
    type: MIME_TYPES_BY_EXTENSION[path.extname(filePath).toLowerCase()] ?? '',
  };
}

async function dispatchFileDragEvent(
  page: Page,
  filename: string,
  eventType: FileDragEvent,
  point: PagePoint,
) {
  const payload = await getBrowserFilePayload(filename);

  // A drag started outside the browser cannot be performed with the mouse,
  // so the same events are dispatched with a DataTransfer that carries the file
  const dataTransfer = await page.evaluateHandle(({ base64, name, type }) => {
    const transfer = new DataTransfer();
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    transfer.items.add(new File([bytes], name, { type }));
    return transfer;
  }, payload);

  await getMoleculesCanvas(page).dispatchEvent(eventType, {
    dataTransfer,
    clientX: point.x,
    clientY: point.y,
  });
  await dataTransfer.dispose();
}

/**
 * Starts dragging a file from outside the browser over the canvas.
 * The file is not dropped.
 */
export async function dragFileOverCanvas(
  page: Page,
  filename: string,
  point?: PagePoint,
) {
  const target = point ?? (await getCanvasCenter(page));
  await dispatchFileDragEvent(page, filename, 'dragenter', target);
  await dispatchFileDragEvent(page, filename, 'dragover', target);
}

export async function dragFileOutOfCanvas(
  page: Page,
  filename: string,
  point?: PagePoint,
) {
  const target = point ?? (await getCanvasCenter(page));
  await dispatchFileDragEvent(page, filename, 'dragleave', target);
}

/**
 * Drops a file from outside the browser on the canvas
 * (drag enter, drag over and drop at the given page position)
 */
export async function dropFileOnCanvas(
  page: Page,
  filename: string,
  point?: PagePoint,
) {
  const target = point ?? (await getCanvasCenter(page));
  await dragFileOverCanvas(page, filename, target);
  await dispatchFileDragEvent(page, filename, 'drop', target);
}
