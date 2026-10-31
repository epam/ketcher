import ReObject from 'application/render/restruct/reobject';
import type { RenderOptions } from 'application/render/render.types';
import type { RaphaelSet } from 'raphael';

it('should change selection style correctly for simple objects when selected', () => {
  const reObject = new ReObject('simpleObject');
  reObject.selected = true;
  const options = {
    hoverStyle: {
      stroke: '#0097A8',
      fill: '#CCFFDD',
      'stroke-width': 20,
    },
  } as unknown as RenderOptions;
  reObject.hovering = {
    attr: jest.fn((style) =>
      expect(style.fill).not.toEqual(options.hoverStyle.fill),
    ),
  } as unknown as RaphaelSet;

  reObject.changeSelectionStyle(options);
});

it('should change selection style correctly for other objects when selected', () => {
  const reObject = new ReObject('frag');
  reObject.selected = true;
  const options = {
    hoverStyle: {
      fill: '#CCFFDD',
    },
  } as unknown as RenderOptions;
  reObject.hovering = {
    attr: jest.fn((style) =>
      expect(style.fill).toEqual(options.hoverStyle.fill),
    ),
  } as unknown as RaphaelSet;

  reObject.changeSelectionStyle(options);
});
