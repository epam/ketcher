import type { RenderOptions } from '../render.types';

const SCALE_FACTOR = 0.5;

/**
 * To make scrollbar provide better UX, this function can help to achieve
 * moving scrollbar `x` offsets leads to moving viewBox `2 * x` offsets
 * */
export const getUserFriendlyScrollOffset = (offset: number) => {
  return offset * SCALE_FACTOR;
};

export const getUserFriendlyViewBoxDelta = (delta: number) => {
  return delta / SCALE_FACTOR;
};

export const getZoomedValue = (value: number, renderOptions: RenderOptions) => {
  return value / renderOptions.zoom;
};
