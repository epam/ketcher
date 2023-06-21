export const TYPE_BOND = 'bond';
export const TYPE_SELECT = 'select';
export const TYPE_TRANSFORM = 'transform';
export const TYPE_REACTION_ARROW = 'reactionarrow';
export const TYPE_REACTION = 'reaction';
export const TYPE_R_GROUP = 'rgroup';
export const TYPE_SHAPE = 'shape';

// each field define number of presses and DOM element id
type toolField = [presses: number, domElementId: string];

type toolType = {
  [key: string]: toolField;
};

export const BondTool: toolType = {
  SINGLE: [1, 'bond-single'],
  DOUBLE: [2, 'bond-double'],
  TRIPPLE: [3, 'bond-triple'],
  ANY: [4, 'bond-any'],
  AROMATIC: [5, 'bond-aromatic'],
  SINGLE_DOUBLE: [6, 'bond-singledouble'],
  SINGLE_AROMATIC: [7, 'bond-singlearomatic'],
  DOUBLE_AROMATIC: [8, 'bond-doublearomatic'],
  DATIVE: [9, 'bond-dative'],
  HYDROGEN: [10, 'bond-hydrogen'],
  UP: [11, 'bond-up'],
  DOWN: [12, 'bond-down'],
  UP_DOWN: [13, 'bond-updown'],
  CROSSED: [14, 'bond-crossed'],
};

export const SelectTool: toolType = {
  RECTANGLE_SELECTION: [1, 'select-rectangle'],
  LASSO_SELECTION: [2, 'select-lasso'],
  FRAGMENT_SELECTION: [3, 'select-fragment'],
};

// Rotate tool do not change image after selecting
export const RotateTool: toolType = {
  TRANSFORM_ROTATE: [1, 'transform-rotate'],
  HORIZONTAL_FLIP: [2, 'transform-flip-h'],
  VERTICAL_FLIP: [3, 'transform-flip-v'],
};

export const ArrowTool: toolType = {
  ARROW_OPEN_ANGLE: [1, 'reaction-arrow-open-angle'],
  ARROW_FILLED_TRIANGLE: [2, 'reaction-arrow-filled-triangle'],
  ARROW_FILLED_BOW: [3, 'reaction-arrow-filled-bow'],
  ARROW_DASHED_OPEN_ANGLE: [4, 'reaction-arrow-dashed-open-angle'],
  ARROW_FAILED: [5, 'reaction-arrow-failed'],
  ARROW_BOTH_ENDS_FILLED_TRIANGLE: [
    6,
    'reaction-arrow-both-ends-filled-triangle',
  ],
  ARROW_EQUILIBRIUM_FILLED_HALF_BOW: [
    7,
    'reaction-arrow-equilibrium-filled-half-bow',
  ],
  ARROW_EQUILIBRIUM_FILLED_TRIANGLE: [
    8,
    'reaction-arrow-equilibrium-filled-triangle',
  ],
  ARROW_EQUILIBRIUM_OPEN_ANGLE: [9, 'reaction-arrow-equilibrium-open-angle'],
  ARROW_UNBALANCED_EQUILIBRIUM_FILLED_HALF_BOW: [
    10,
    'reaction-arrow-unbalanced-equilibrium-filled-half-bow',
  ],
  ARROW_UNBALANCED_EQUILIBRIUM_OPEN_HALF_ANGLE: [
    11,
    'reaction-arrow-unbalanced-equilibrium-open-half-angle',
  ],
  ARROW_UNBALANCED_EQUILIBRIUM_LARGE_FILLED_HALF_BOW: [
    12,
    'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow',
  ],
  ARROW_UNBALANCED_EQUILIBRIUM_FILLED_HALF_TRIANGLE: [
    13,
    'reaction-arrow-unbalanced-equilibrium-filled-half-triangle',
  ],
  ARROW_ELLIPTICAL_ARC_FILLED_BOW: [
    14,
    'reaction-arrow-elliptical-arc-arrow-filled-bow',
  ],
  ARROW_ELLIPTICAL_ARC_FILLED_TRIANGLE: [
    15,
    'reaction-arrow-elliptical-arc-arrow-filled-triangle',
  ],
  ARROW_ELLIPTICAL_ARC_OPEN_ANGLE: [
    16,
    'reaction-arrow-elliptical-arc-arrow-open-angle',
  ],
  ARROW_ELLIPTICAL_ARC_OPEN_HALF_ANGLE: [
    17,
    'reaction-arrow-elliptical-arc-arrow-open-half-angle',
  ],
};

export const ReactionMappingTool: toolType = {
  MAP: [1, 'reaction-map'],
  UNMAP: [2, 'reaction-unmap'],
  AUTOMAP: [3, 'reaction-automap'],
};

export const RgroupTool: toolType = {
  R_GROUP_LABEL: [1, 'rgroup-label'],
  R_GROUP_FRAGMENT: [2, 'rgroup-fragment'],
  ATTACHMENT_POINTS: [3, 'rgroup-attpoints'],
};

export const ShapeTool: toolType = {
  SHAPE_ELLIPSE: [1, 'shape-ellipse'],
  SHAPE_RECTANGLE: [2, 'shape-rectangle'],
  SHAPE_LINE: [3, 'shape-line'],
};
