import ReObject from 'application/render/restruct/reobject';

it('should change selection style correctly for simple objects when selected', () => {
  const reObject = new ReObject('simpleObject');
  reObject.selected = true;
  const options = {
    hoverStyle: {
      stroke: '#0097A8',
      fill: '#CCFFDD',
      'stroke-width': 20,
    },
  };
  reObject.hovering = {
    attr: jest.fn((style) =>
      expect(style.fill).not.toEqual(options.hoverStyle.fill),
    ),
  };

  reObject.changeSelectionStyle(options);
});

it('should change selection style correctly for other objects when selected', () => {
  const reObject = new ReObject('frag');
  reObject.selected = true;
  const options = {
    hoverStyle: {
      fill: '#CCFFDD',
    },
  };
  reObject.hovering = {
    attr: jest.fn((style) =>
      expect(style.fill).toEqual(options.hoverStyle.fill),
    ),
  };

  reObject.changeSelectionStyle(options);
});
