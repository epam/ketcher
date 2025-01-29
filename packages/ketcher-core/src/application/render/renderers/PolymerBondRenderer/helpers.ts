export const SMOOTH_CORNER_SIZE = 5;

export const generateBend = (
  dx1: number,
  dy1: number,
  dx: number,
  dy: number,
): string => {
  return `q ${SMOOTH_CORNER_SIZE * dx1},${SMOOTH_CORNER_SIZE * dy1} ${
    SMOOTH_CORNER_SIZE * dx
  },${SMOOTH_CORNER_SIZE * dy} `;
};
