import {
  Action,
  getItemsToFuse,
  IMAGE_KEY,
  ImageReferencePositionInfo,
  Vec2,
} from 'ketcher-core';
import { ClosestItemWithMap } from '../../shared/closest.types';
import {
  CommonArrowDragContext,
  MultitailArrowClosestItem,
  ReactionArrowClosestItem,
} from '../arrow/arrow.types';

export type SelectMode = 'lasso' | 'fragment' | 'rectangle';

type MergeItems = ReturnType<typeof getItemsToFuse>;

type SharedDragContext = {
  copyAction?: Action;
  mergeItems?: MergeItems;
  stopTapping?: () => void;
};

export type SelectionMoveDragContext = SharedDragContext & {
  action?: Action | null;
  item: ClosestItemWithMap<unknown>;
  xy0: Vec2;
};

export type SimpleObjectSelectionDragContext = SelectionMoveDragContext & {
  item: ClosestItemWithMap<Vec2, 'simpleObjects'> & {
    ref: Vec2;
  };
};

export type ImageSelectionDragContext = SelectionMoveDragContext & {
  item: ClosestItemWithMap<ImageReferencePositionInfo, typeof IMAGE_KEY> & {
    ref: ImageReferencePositionInfo;
  };
};

export type ArrowDragContext = CommonArrowDragContext<
  ReactionArrowClosestItem | MultitailArrowClosestItem
> &
  SharedDragContext;

export type DragContext = SelectionMoveDragContext | ArrowDragContext | null;

export function isSelectionMoveDragContext(
  dragCtx: DragContext,
): dragCtx is SelectionMoveDragContext {
  return !!dragCtx && 'item' in dragCtx && 'xy0' in dragCtx;
}

export function isArrowDragContext(
  dragCtx: DragContext,
): dragCtx is ArrowDragContext {
  return !!dragCtx && 'closestItem' in dragCtx && 'originalPosition' in dragCtx;
}

export function isImageSelectionDragContext(
  dragCtx: SelectionMoveDragContext,
): dragCtx is ImageSelectionDragContext {
  return dragCtx.item.map === IMAGE_KEY && !!dragCtx.item.ref;
}

export function isSimpleObjectSelectionDragContext(
  dragCtx: SelectionMoveDragContext,
): dragCtx is SimpleObjectSelectionDragContext {
  return dragCtx.item.map === 'simpleObjects' && !!dragCtx.item.ref;
}
