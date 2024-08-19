import {
  generateMenuShortcuts,
  hotkeysConfiguration,
  ZoomTool,
} from 'ketcher-core';

export const shortcuts =
  generateMenuShortcuts<typeof hotkeysConfiguration>(hotkeysConfiguration);

export const getIntegerFromString = (zoomInput: string | undefined): number => {
  const zoomNumber = parseInt(zoomInput || '');
  if (isNaN(zoomNumber)) {
    return 0;
  }
  return zoomNumber;
};

export const getValidZoom = (zoom: number, currentZoom: number): number => {
  if (zoom === 0) {
    return currentZoom;
  }

  const minAllowed = ZoomTool.instance.MINZOOMSCALE * 100;
  const maxAllowed = ZoomTool.instance.MAXZOOMSCALE * 100;

  if (zoom < minAllowed) {
    return minAllowed;
  }
  if (zoom > maxAllowed) {
    return maxAllowed;
  }
  return zoom;
};

export const updateInputString = (
  zoom: number,
  inputElement: HTMLInputElement | null,
) => {
  if (!inputElement) return;
  inputElement.value = `${Math.round(zoom)}%`;
};
