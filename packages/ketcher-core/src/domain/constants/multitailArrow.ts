import {
  MultitailArrowReferenceLinesNames,
  MultitailArrowReferencePositionsNames,
} from 'domain/entities';

export const MULTITAIL_ARROW_KEY = 'multitailArrows';

export const MULTITAIL_ARROW_TOOL_NAME = 'reaction-arrow-multitail';

export const MULTITAIL_ARROW_SERIALIZE_KEY = 'multi-tailed-arrow';

const MOVE = 'move';
const CURSOR_RESIZE_VERTICAL = 'ns-resize';
const CURSOR_RESIZE_HORIZONTAL = 'ew-resize';

export const multitailReferencePositionToCursor: Record<
  MultitailArrowReferencePositionsNames,
  string
> = {
  topTail: CURSOR_RESIZE_HORIZONTAL,
  tails: CURSOR_RESIZE_HORIZONTAL,
  bottomTail: CURSOR_RESIZE_HORIZONTAL,
  topSpine: MOVE,
  bottomSpine: MOVE,
  head: CURSOR_RESIZE_HORIZONTAL,
};

export const multitailArrowReferenceLinesToCursor: Record<
  MultitailArrowReferenceLinesNames,
  string
> = {
  topTail: CURSOR_RESIZE_VERTICAL,
  bottomTail: CURSOR_RESIZE_VERTICAL,
  tails: CURSOR_RESIZE_VERTICAL,
  head: CURSOR_RESIZE_VERTICAL,
  spine: MOVE,
};
