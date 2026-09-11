import { RxnArrowMode } from 'domain/entities/rxnArrow';

type ReactionArrowMenuItem = {
  itemId: string;
  mode: RxnArrowMode;
  title: string;
};

export const REACTION_ARROW_MENU_ITEMS: ReactionArrowMenuItem[] = [
  {
    itemId: 'reaction-arrow-open-angle',
    mode: RxnArrowMode.OpenAngle,
    title: 'Open Angle',
  },
  {
    itemId: 'reaction-arrow-filled-triangle',
    mode: RxnArrowMode.FilledTriangle,
    title: 'Filled Triangle',
  },
  {
    itemId: 'reaction-arrow-filled-bow',
    mode: RxnArrowMode.FilledBow,
    title: 'Filled Bow',
  },
  {
    itemId: 'reaction-arrow-dashed-open-angle',
    mode: RxnArrowMode.DashedOpenAngle,
    title: 'Dashed Open Angle',
  },
  {
    itemId: 'reaction-arrow-failed',
    mode: RxnArrowMode.Failed,
    title: 'Failed',
  },
  {
    itemId: 'reaction-arrow-retrosynthetic',
    mode: RxnArrowMode.Retrosynthetic,
    title: 'Retrosynthetic',
  },
  {
    itemId: 'reaction-arrow-both-ends-filled-triangle',
    mode: RxnArrowMode.BothEndsFilledTriangle,
    title: 'Both Ends Filled Triangle',
  },
  {
    itemId: 'reaction-arrow-equilibrium-filled-half-bow',
    mode: RxnArrowMode.EquilibriumFilledHalfBow,
    title: 'Equilibrium Filled Half Bow',
  },
  {
    itemId: 'reaction-arrow-equilibrium-filled-triangle',
    mode: RxnArrowMode.EquilibriumFilledTriangle,
    title: 'Equilibrium Filled Triangle',
  },
  {
    itemId: 'reaction-arrow-equilibrium-open-angle',
    mode: RxnArrowMode.EquilibriumOpenAngle,
    title: 'Equilibrium Open Angle',
  },
  {
    itemId: 'reaction-arrow-unbalanced-equilibrium-filled-half-bow',
    mode: RxnArrowMode.UnbalancedEquilibriumFilledHalfBow,
    title: 'Unbalanced Equilibrium Filled Half Bow',
  },
  {
    itemId: 'reaction-arrow-unbalanced-equilibrium-open-half-angle',
    mode: RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle,
    title: 'Unbalanced Equilibrium Open Half Angle',
  },
  {
    itemId: 'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow',
    mode: RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow,
    title: 'Unbalanced Equilibrium Large Filled Half Bow',
  },
  {
    itemId: 'reaction-arrow-unbalanced-equilibrium-filled-half-triangle',
    mode: RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle,
    title: 'Unbalanced Equilibrium Filled Half Triangle',
  },
  {
    itemId: 'reaction-arrow-elliptical-arc-arrow-filled-bow',
    mode: RxnArrowMode.EllipticalArcFilledBow,
    title: 'Elliptical Arc Arrow Filled Bow',
  },
  {
    itemId: 'reaction-arrow-elliptical-arc-arrow-filled-triangle',
    mode: RxnArrowMode.EllipticalArcFilledTriangle,
    title: 'Elliptical Arc Arrow Filled Triangle',
  },
  {
    itemId: 'reaction-arrow-elliptical-arc-arrow-open-angle',
    mode: RxnArrowMode.EllipticalArcOpenAngle,
    title: 'Elliptical Arc Arrow Open Angle',
  },
  {
    itemId: 'reaction-arrow-elliptical-arc-arrow-open-half-angle',
    mode: RxnArrowMode.EllipticalArcOpenHalfAngle,
    title: 'Elliptical Arc Arrow Open Half Angle',
  },
];

export const REACTION_ARROW_ITEM_ID_TO_MODE: Record<string, RxnArrowMode> =
  Object.fromEntries(
    REACTION_ARROW_MENU_ITEMS.map(({ itemId, mode }) => [itemId, mode]),
  );

export function isReactionArrowItemId(
  itemId: string,
): itemId is keyof typeof REACTION_ARROW_ITEM_ID_TO_MODE {
  return itemId in REACTION_ARROW_ITEM_ID_TO_MODE;
}
