import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import {
  Coordinates,
  CoreEditor,
  IRnaPreset,
  isRnaPreset,
  monomerFactory,
} from 'application/editor';
import { MonomerItemType } from 'domain/types';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { SnakeLayoutCellWidth } from 'domain/constants';

export type AutochainPreviewViewParams = {
  monomerOrRnaItem: MonomerItemType | IRnaPreset;
  position: Vec2;
  selectedMonomerToConnect?: BaseMonomer;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class AutochainPreviewView extends TransientView {
  public static viewName = 'AutochainPreviewView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: AutochainPreviewViewParams,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const { monomerOrRnaItem, position, selectedMonomerToConnect } = params;
    const scaledPosition = Coordinates.modelToCanvas(position);

    if (isRnaPreset(monomerOrRnaItem)) {
    } else {
      const [Monomer, MonomerRenderer] = monomerFactory(monomerOrRnaItem);
      const monomerInstance = new Monomer(monomerOrRnaItem);
      const monomerRenderer = new MonomerRenderer(monomerInstance);
      const monomerAutochainSymbolElementId =
        monomerRenderer.monomerAutochainPreviewElementId;
      const monomerAutochainSymbolElement =
        editor.canvas.querySelector<SVGUseElement>(
          monomerAutochainSymbolElementId,
        );
      const monomerSize = {
        width: Number(
          monomerAutochainSymbolElement?.getAttribute('data-actual-width') || 0,
        ),
        height: Number(
          monomerAutochainSymbolElement?.getAttribute('data-actual-height') ||
            0,
        ),
      };

      transientLayer
        .append('g')
        .attr('transform-origin', 'center')
        .attr(
          'transform',
          `translate(${scaledPosition.x - monomerSize.width / 2}, ${
            scaledPosition.y - monomerSize.height / 2
          })`,
        )
        .append('use')
        .attr('href', monomerAutochainSymbolElementId)
        .attr('fill', 'none')
        .attr('stroke', '#167782');

      if (selectedMonomerToConnect) {
        transientLayer
          .append('line')
          .attr('x1', scaledPosition.x - SnakeLayoutCellWidth)
          .attr('y1', scaledPosition.y)
          .attr('x2', scaledPosition.x - monomerSize.width / 2)
          .attr('y2', scaledPosition.y)
          .attr('stroke', '#167782')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4 4');
      }
    }
  }
}
