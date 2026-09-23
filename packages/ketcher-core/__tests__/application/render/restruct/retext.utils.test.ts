import { removeFirstLineVerticalShift } from 'application/render/restruct/retext.utils';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createTextNode(tspanShifts: Array<string | null>): SVGElement {
  const text = document.createElementNS(SVG_NS, 'text');

  tspanShifts.forEach((dy) => {
    const tspan = document.createElementNS(SVG_NS, 'tspan');
    if (dy !== null) {
      tspan.setAttribute('dy', dy);
    }
    text.appendChild(tspan);
  });

  return text;
}

describe('removeFirstLineVerticalShift', () => {
  it('drops the centering shift of a multi-line element', () => {
    const node = createTextNode(['-874', '21.6', '21.6']);

    removeFirstLineVerticalShift(node);

    const tspans = node.getElementsByTagName('tspan');
    expect(tspans[0].hasAttribute('dy')).toBe(false);
  });

  it('keeps the shifts of the following lines untouched', () => {
    const node = createTextNode(['-874', '21.6', '21.6']);

    removeFirstLineVerticalShift(node);

    const tspans = node.getElementsByTagName('tspan');
    expect(tspans[1].getAttribute('dy')).toBe('21.6');
    expect(tspans[2].getAttribute('dy')).toBe('21.6');
  });

  it('keeps the centering shift of a single-line element', () => {
    const node = createTextNode(['3.5']);

    removeFirstLineVerticalShift(node);

    const tspans = node.getElementsByTagName('tspan');
    expect(tspans[0].getAttribute('dy')).toBe('3.5');
  });

  it('does nothing when there are no tspans', () => {
    const node = createTextNode([]);

    expect(() => removeFirstLineVerticalShift(node)).not.toThrow();
  });
});
