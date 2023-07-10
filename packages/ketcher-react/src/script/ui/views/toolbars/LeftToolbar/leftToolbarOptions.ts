import { bondCommon, bondQuery, bondSpecial, bondStereo } from './Bond/options';
import { makeItems } from '../ToolbarGroupItem/utils';
import { ToolbarItem } from '../toolbar.types';

const rGroupOptions: ToolbarItem[] = makeItems([
  'rgroup-label',
  'rgroup-fragment',
  'rgroup-attpoints',
]);

const shapeOptions: ToolbarItem[] = makeItems([
  'shape-ellipse',
  'shape-rectangle',
  'shape-line',
]);

const selectOptions: ToolbarItem[] = makeItems([
  'select-rectangle',
  'select-lasso',
  'select-fragment',
]);

const arrowsOptions: ToolbarItem[] = makeItems([
  'reaction-arrow-open-angle',
  'reaction-arrow-filled-triangle',
  'reaction-arrow-filled-bow',
  'reaction-arrow-dashed-open-angle',
  'reaction-arrow-failed',
  'reaction-arrow-both-ends-filled-triangle',
  'reaction-arrow-equilibrium-filled-half-bow',
  'reaction-arrow-equilibrium-filled-triangle',
  'reaction-arrow-equilibrium-open-angle',
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow',
  'reaction-arrow-unbalanced-equilibrium-open-half-angle',
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow',
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle',
  'reaction-arrow-elliptical-arc-arrow-filled-bow',
  'reaction-arrow-elliptical-arc-arrow-filled-triangle',
  'reaction-arrow-elliptical-arc-arrow-open-angle',
  'reaction-arrow-elliptical-arc-arrow-open-half-angle',
]);

const mappingOptions: ToolbarItem[] = makeItems([
  'reaction-map',
  'reaction-unmap',
  'reaction-automap',
]);

export {
  rGroupOptions,
  bondCommon,
  bondQuery,
  bondSpecial,
  bondStereo,
  shapeOptions,
  selectOptions,
  arrowsOptions,
  mappingOptions,
};
