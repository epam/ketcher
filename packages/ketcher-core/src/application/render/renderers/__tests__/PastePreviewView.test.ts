import { select } from 'd3';
import { PastePreviewView } from '../TransientView/PastePreviewView';
import { Atom } from 'domain/entities/CoreAtom';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AtomLabel } from 'domain/constants';
import { RGroup } from 'domain/entities/rgroup';
import { Vec2 } from 'domain/entities/vec2';
import type { D3SvgElementSelection } from 'application/render/types';

describe('merged R-group paste preview', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="preview-layer"></g></svg>';
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 100, height: 40 }),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('draws one definition around existing and moved incoming fragments with pasted logic', () => {
    const atoms = (positions: number[]) =>
      positions.map(
        (x, id) => new Atom(new Vec2(x, 0), {} as BaseMonomer, id, AtomLabel.C),
      );
    const existing = {
      rgroup: new RGroup({ range: '2-3' }),
      atoms: atoms([4, 5]),
      bonds: [],
    };
    const incoming = {
      rgroup: new RGroup({ range: '1', resth: true }),
      atoms: atoms([0, 1]),
      bonds: [],
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const layer = select<SVGGElement, void>(
      '#preview-layer',
    ) as D3SvgElementSelection<SVGGElement, void>;
    const show = PastePreviewView.show;
    show(layer, {
      svg,
      anchor: new Vec2(),
      position: new Vec2(10, 0),
      definitions: new Map([[1, incoming]]),
      existingDefinitions: new Map([[1, existing]]),
    });
    const groups = document.querySelectorAll(
      '[data-testid="paste-preview-r-group-definition"]',
    );
    expect(groups).toHaveLength(1);
    expect(
      document
        .querySelector('[data-testid="paste-preview"]')
        ?.getAttribute('opacity'),
    ).toBe('1');
    expect(
      groups[0].querySelector('[data-testid="r-group-logic"]')?.textContent,
    ).toBe('R1=1 (RestH)');
    const brackets = groups[0].querySelectorAll(
      '[data-testid="r-group-bracket"]',
    );
    expect(brackets[0].getAttribute('d')).toContain('H146');
    expect(brackets[1].getAttribute('d')).toContain('H454');
    expect(
      groups[0]
        .querySelector('[data-testid="r-group-label"]')
        ?.getAttribute('pointer-events'),
    ).toBe('none');
    expect(existing.rgroup.range).toBe('2-3');
    expect(incoming.atoms[0].position).toEqual(new Vec2(0, 0));
  });
});
