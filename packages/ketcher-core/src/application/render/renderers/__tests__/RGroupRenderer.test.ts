import { RGroupRenderer } from '../RGroupRenderer';
import { RGroupDrawingEntity } from 'domain/entities/RGroupDrawingEntity';
import { RGroup } from 'domain/entities/rgroup';
import { Atom } from 'domain/entities/CoreAtom';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AtomLabel } from 'domain/constants';
import { Vec2 } from 'domain/entities/vec2';

describe('RGroupRenderer', () => {
  let bbox: jest.SpyInstance;

  beforeEach(() => {
    document.body.innerHTML =
      '<svg id="polymer-editor-canvas"><g class="drawn-structures"></g></svg>';
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      writable: true,
      value: () => ({ x: -60, y: -22, width: 114, height: 44 }),
    });
    bbox = jest.spyOn(SVGElement.prototype as SVGGraphicsElement, 'getBBox');
  });

  afterEach(() => {
    bbox.mockRestore();
    document.body.innerHTML = '';
  });

  it('renders brackets and all logic, updates after a move and clears its overlay', () => {
    const atoms = [0, 1].map(
      (x, id) => new Atom(new Vec2(x, 0), {} as BaseMonomer, id, AtomLabel.C),
    );
    const entity = new RGroupDrawingEntity(
      1,
      new RGroup({ range: '1-3', resth: true, ifthen: 2 }),
      atoms,
      [],
    );
    const renderer = new RGroupRenderer(entity);
    renderer.refresh();
    const root = document.querySelector('[data-testid="r-group-definition"]')!;
    expect(
      root.querySelectorAll('[data-testid="r-group-bracket"]'),
    ).toHaveLength(2);
    expect(root.getAttribute('pointer-events')).toBe('none');
    expect(
      root
        .querySelector('[data-testid="r-group-label"]')
        ?.getAttribute('pointer-events'),
    ).toBe('all');
    expect(
      root
        .querySelector('[data-testid="r-group-bracket-hit-area"]')
        ?.getAttribute('pointer-events'),
    ).toBe('stroke');
    expect(root.querySelector('rect')?.getAttribute('pointer-events')).toBe(
      'none',
    );
    expect(root.querySelectorAll('rect')).toHaveLength(1);
    expect(
      root.querySelector('[data-testid="r-group-label"]')?.textContent,
    ).toBe('R1=');
    expect(
      root.querySelector('[data-testid="r-group-logic"]')?.textContent,
    ).toBe('IF R1=1-3 (RestH)THEN R2');
    renderer.refresh();
    expect(document.querySelector('[data-testid="r-group-definition"]')).toBe(
      root,
    );

    const bracketBefore = root.querySelector('path')?.getAttribute('d');
    atoms.forEach((atom) => atom.moveRelative(new Vec2(1, 2)));
    renderer.refresh();
    const movedRoot = document.querySelector(
      '[data-testid="r-group-definition"]',
    )!;
    expect(movedRoot.querySelector('path')?.getAttribute('d')).not.toBe(
      bracketBefore,
    );
    expect(
      document.querySelectorAll('[data-testid="r-group-definition"]'),
    ).toHaveLength(1);

    atoms.forEach((atom) => atom.turnOnSelection());
    entity.turnOnHover();
    renderer.refresh();
    expect(movedRoot.querySelector('rect')?.getAttribute('fill')).toBe(
      '#57FF8F',
    );
    expect(movedRoot.querySelector('rect')?.getAttribute('stroke')).toBe(
      '#0097a8',
    );
    renderer.remove();
    expect(
      document.querySelector('[data-testid="r-group-definition"]'),
    ).toBeNull();
  });
});
