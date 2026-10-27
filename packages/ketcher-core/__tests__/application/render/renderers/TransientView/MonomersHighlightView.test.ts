import { select } from 'd3';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { BaseSequenceItemRenderer } from 'application/render';
import { MonomersHighlightView } from 'application/render/renderers/TransientView/MonomersHighlightView';
import type { D3SvgElementSelection } from 'application/render/types';
import type { BaseMonomer } from 'domain/entities';
import { Vec2 } from 'domain/entities';
import { createSvgElement } from '../../../../helpers/dom';

jest.mock('application/editor/editorSingleton');

const setLayoutMode = (modeName: string) => {
  jest
    .mocked(provideEditorInstance)
    .mockReturnValue({ mode: { modeName } } as ReturnType<
      typeof provideEditorInstance
    >);
};

const createLayer = () => {
  const svg = createSvgElement('svg') as SVGSVGElement;
  const layer = createSvgElement('g') as SVGGElement;
  svg.appendChild(layer);
  document.body.appendChild(svg);
  return {
    layer,
    selection: select(layer) as unknown as D3SvgElementSelection<
      SVGGElement,
      void
    >,
  };
};

const createCanvasMonomer = (x: number, y: number) =>
  ({
    renderer: { center: new Vec2(x, y) },
  }) as unknown as BaseMonomer;

const createSequenceMonomer = (
  x: number,
  y: number,
  symbol: string,
  modified = false,
) => {
  const renderer = Object.create(BaseSequenceItemRenderer.prototype);
  Object.defineProperties(renderer, {
    scaledMonomerPositionForSequence: { value: new Vec2(x, y) },
    symbolToDisplay: { value: symbol },
    node: { value: { modified } },
  });
  return { renderer } as unknown as BaseMonomer;
};

describe('MonomersHighlightView', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.resetAllMocks();
  });

  describe('flex and snake modes', () => {
    it.each(['flex-layout-mode', 'snake-layout-mode'])(
      'draws a circle around every monomer in %s',
      (modeName) => {
        setLayoutMode(modeName);
        const { layer, selection } = createLayer();

        MonomersHighlightView.show(selection, {
          monomers: [createCanvasMonomer(10, 20), createCanvasMonomer(30, 40)],
        });

        const circles = layer.querySelectorAll(
          `circle[data-testid="${MonomersHighlightView.testId}"]`,
        );
        expect(circles).toHaveLength(2);
        expect(circles[0].getAttribute('cx')).toBe('10');
        expect(circles[0].getAttribute('cy')).toBe('20');
        expect(circles[1].getAttribute('cx')).toBe('30');
        expect(circles[0].getAttribute('stroke')).toBe('#0097A8');
        expect(circles[0].getAttribute('fill')).toBe('none');
      },
    );

    it('skips monomers that are not drawn', () => {
      setLayoutMode('flex-layout-mode');
      const { layer, selection } = createLayer();

      MonomersHighlightView.show(selection, {
        monomers: [{ renderer: undefined } as unknown as BaseMonomer],
      });

      expect(layer.children).toHaveLength(0);
    });

    it('draws nothing for an empty list', () => {
      setLayoutMode('flex-layout-mode');
      const { layer, selection } = createLayer();

      MonomersHighlightView.show(selection, { monomers: [] });

      expect(layer.children).toHaveLength(0);
    });
  });

  describe('sequence mode', () => {
    it('draws a green tile with the symbol for every monomer', () => {
      setLayoutMode('sequence-layout-mode');
      const { layer, selection } = createLayer();

      MonomersHighlightView.show(selection, {
        monomers: [
          createSequenceMonomer(100, 50, 'A'),
          createSequenceMonomer(120, 50, 'C'),
        ],
      });

      const tiles = layer.querySelectorAll(
        `g[data-testid="${MonomersHighlightView.testId}"]`,
      );
      expect(tiles).toHaveLength(2);
      expect(tiles[0].getAttribute('transform')).toBe('translate(98, 32)');
      expect(tiles[0].querySelector('rect')?.getAttribute('fill')).toBe(
        '#4EE581',
      );
      expect(
        [...tiles].map((tile) => tile.querySelector('text')?.textContent),
      ).toEqual(['A', 'C']);
    });

    it('underlines the symbol of a modified item', () => {
      setLayoutMode('sequence-layout-mode');
      const { layer, selection } = createLayer();

      MonomersHighlightView.show(selection, {
        monomers: [
          createSequenceMonomer(0, 0, 'A', true),
          createSequenceMonomer(20, 0, 'C', false),
        ],
      });

      const tiles = layer.querySelectorAll('g');
      expect(tiles[0].querySelector('path')).not.toBeNull();
      expect(tiles[1].querySelector('path')).toBeNull();
    });

    it('skips monomers that are not drawn as sequence items', () => {
      setLayoutMode('sequence-layout-mode');
      const { layer, selection } = createLayer();

      MonomersHighlightView.show(selection, {
        monomers: [createCanvasMonomer(10, 20)],
      });

      expect(layer.children).toHaveLength(0);
    });
  });
});
