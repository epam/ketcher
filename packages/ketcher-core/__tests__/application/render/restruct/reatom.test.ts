import {
  checkIsSmartPropertiesExist,
  getAtomCustomQuery,
} from 'application/render/restruct';
import ReAtom from 'application/render/restruct/reatom';
import type ReStruct from 'application/render/restruct/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { StereoColoringType } from 'application/render/restruct/generalEnumTypes';
import { Atom, Struct } from 'domain/entities';

describe('atom annotation DOM traversal', () => {
  it('applies stereo styling and an escaped query tooltip to the first tspan', () => {
    const atom = new Atom({
      label: 'C',
      stereoLabel: '&2',
      queryProperties: { customQuery: 'query<one>;query&two' },
    });
    const molecule = new Struct();
    const aid = molecule.atoms.add(atom);
    const reatom = new ReAtom(atom);
    const nodes: SVGElement[] = [];
    const text = jest.fn(() => {
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text',
      );
      node.append(
        document.createElementNS('http://www.w3.org/2000/svg', 'tspan'),
        document.createElementNS('http://www.w3.org/2000/svg', 'tspan'),
      );
      nodes.push(node);
      return {
        node,
        attr: jest.fn().mockReturnThis(),
        getBBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
        translateAbs: jest.fn(),
      };
    });
    const options = {
      microModeScale: 1,
      zoom: 1,
      lineWidth: 1,
      fontszInPx: 13,
      fontszsubInPx: 10,
      colorOfAndCenters: '#123456',
      colorStereogenicCenters: StereoColoringType.LabelsOnly,
      autoFadeOfStereoLabels: true,
      ignoreChiralFlag: true,
    } as RenderOptions;
    const restruct = {
      molecule,
      render: { paper: { text }, options },
      addReObjectPath: jest.fn(),
    } as unknown as ReStruct;
    jest.spyOn(reatom, 'setHover').mockImplementation(() => undefined);

    reatom.show(restruct, aid, options);

    const annotation = nodes[nodes.length - 1];
    const firstSpan = annotation.firstChild as SVGElement;
    expect(firstSpan.getAttribute('fill')).toBe('#123456');
    expect(firstSpan.getAttribute('fill-opacity')).toBe('0.9');
    expect(firstSpan.getAttribute('data-tooltip')).toBe(
      'query&lt;one&gt;; query&two',
    );
    expect((annotation.lastChild as SVGElement).attributes).toHaveLength(0);
  });
});

describe('atom query properties rendering', () => {
  it.each([
    { implicitHCount: 0, expected: 'h0' },
    {
      queryProperties: { ringMembership: 0 },
      expected: 'R0',
    },
    {
      queryProperties: { ringSize: 0 },
      expected: 'r0',
    },
    {
      queryProperties: { connectivity: 0 },
      expected: 'X0',
    },
  ])('renders $expected for a zero-valued query property', (attributes) => {
    const atom = new Atom({
      label: 'C',
      ...attributes,
    });

    expect(checkIsSmartPropertiesExist(atom)).toBe(true);
    expect(
      getAtomCustomQuery({
        ...atom,
        ...atom.queryProperties,
      }),
    ).toBe(attributes.expected);
  });
});
