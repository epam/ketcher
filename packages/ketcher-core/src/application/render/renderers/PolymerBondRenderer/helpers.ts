import { SVGPathDAttributeUtil } from 'application/render/renderers/PolymerBondRenderer/SVGPathDAttributeUtil';

export const SMOOTH_CORNER_SIZE = 5;

export const generateBend = (
  dx1: number,
  dy1: number,
  dx: number,
  dy: number,
): string => {
  const size = SMOOTH_CORNER_SIZE;
  return SVGPathDAttributeUtil.generateQuadraticRelativeCurve(
    size * dx1,
    size * dy1,
    size * dx,
    size * dy,
  );
};

export const CORNER_LENGTH = 4;
export const DOUBLE_CORNER_LENGTH = CORNER_LENGTH * 2;

export const generateCornerFromTopToRight = () => {
  return `c 0,4.418 3.582,${CORNER_LENGTH} ${CORNER_LENGTH},${CORNER_LENGTH}`;
};

export const generateCornerFromLeftToTop = () => {
  return `c 4.418,0 ${CORNER_LENGTH},-3.582 ${CORNER_LENGTH},-${CORNER_LENGTH}`;
};

export const generateCornerFromBottomToRight = () => {
  return `c 0,-4.418 3.582,-${CORNER_LENGTH} ${CORNER_LENGTH},-${CORNER_LENGTH}`;
};

export const generateCornerFromBottomToLeft = () => {
  return `c 0,-4.418 -3.582,-${CORNER_LENGTH} -${CORNER_LENGTH},-${CORNER_LENGTH}`;
};

export const generateCornerFromLeftToBottom = () => {
  return `c 4.418,0 ${CORNER_LENGTH},3.582 ${CORNER_LENGTH},${CORNER_LENGTH}`;
};

export const generateCornerFromTopToLeft = () => {
  return `c 0,4.418 -3.582,${CORNER_LENGTH} -${CORNER_LENGTH},${CORNER_LENGTH}`;
};

export const generateCornerFromRightToTop = () => {
  return `c -4.418,0 -${CORNER_LENGTH},-3.582 -${CORNER_LENGTH},-${CORNER_LENGTH}`;
};

export const generateCornerFromRightToBottom = () => {
  return `c -4.418,0 -${CORNER_LENGTH},3.582 -${CORNER_LENGTH},${CORNER_LENGTH}`;
};
