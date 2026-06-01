import { RxnArrowMode } from 'domain/entities/rxnArrow';

export const REACTION_ARROW_ITEM_ID_TO_MODE: Record<string, RxnArrowMode> = {
  'reaction-arrow-open-angle': RxnArrowMode.OpenAngle,
  'reaction-arrow-filled-triangle': RxnArrowMode.FilledTriangle,
  'reaction-arrow-filled-bow': RxnArrowMode.FilledBow,
  'reaction-arrow-dashed-open-angle': RxnArrowMode.DashedOpenAngle,
  'reaction-arrow-failed': RxnArrowMode.Failed,
  'reaction-arrow-retrosynthetic': RxnArrowMode.Retrosynthetic,
  'reaction-arrow-both-ends-filled-triangle':
    RxnArrowMode.BothEndsFilledTriangle,
  'reaction-arrow-equilibrium-filled-half-bow':
    RxnArrowMode.EquilibriumFilledHalfBow,
  'reaction-arrow-equilibrium-filled-triangle':
    RxnArrowMode.EquilibriumFilledTriangle,
  'reaction-arrow-equilibrium-open-angle': RxnArrowMode.EquilibriumOpenAngle,
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow':
    RxnArrowMode.UnbalancedEquilibriumFilledHalfBow,
  'reaction-arrow-unbalanced-equilibrium-open-half-angle':
    RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle,
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow':
    RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow,
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle':
    RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle,
  'reaction-arrow-elliptical-arc-arrow-filled-bow':
    RxnArrowMode.EllipticalArcFilledBow,
  'reaction-arrow-elliptical-arc-arrow-filled-triangle':
    RxnArrowMode.EllipticalArcFilledTriangle,
  'reaction-arrow-elliptical-arc-arrow-open-angle':
    RxnArrowMode.EllipticalArcOpenAngle,
  'reaction-arrow-elliptical-arc-arrow-open-half-angle':
    RxnArrowMode.EllipticalArcOpenHalfAngle,
};

export const REACTION_ARROW_MENU_ITEMS = Object.entries(
  REACTION_ARROW_ITEM_ID_TO_MODE,
).map(([itemId, mode]) => ({ itemId, mode }));

export function isReactionArrowItemId(
  itemId: string,
): itemId is keyof typeof REACTION_ARROW_ITEM_ID_TO_MODE {
  return itemId in REACTION_ARROW_ITEM_ID_TO_MODE;
}
