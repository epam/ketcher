import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import {
  Coordinates,
  CoreEditor,
  IRnaPreset,
  monomerFactory,
} from 'application/editor';
import { MonomerItemType } from 'domain/types';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { KetcherLogger } from 'utilities';
import { isLibraryItemRnaPreset } from 'domain/helpers/monomers';

export type AutochainPreviewViewParams = {
  monomerOrRnaItem: MonomerItemType | IRnaPreset;
  position: Vec2;
  selectedMonomerToConnect?: BaseMonomer;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class AutochainPreviewView extends TransientView {
  public static viewName = 'AutochainPreviewView';

  private static showSingleMonomerPreview(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    monomerOrRnaItem: MonomerItemType,
    scaledPosition: Vec2,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const [Monomer, MonomerRenderer] = monomerFactory(monomerOrRnaItem);
    const monomerInstance = new Monomer(monomerOrRnaItem);
    const monomerRenderer = new MonomerRenderer(monomerInstance);
    const monomerAutochainSymbolElementId =
      monomerRenderer.monomerAutochainPreviewElementId;
    const monomerAutochainSymbolElement =
      editor.canvas.querySelector<SVGUseElement>(
        monomerAutochainSymbolElementId,
      );
    const monomerAutochainPreviewSize = {
      width: Number(
        monomerAutochainSymbolElement?.getAttribute('data-actual-width') ?? 0,
      ),
      height: Number(
        monomerAutochainSymbolElement?.getAttribute('data-actual-height') ?? 0,
      ),
    };

    transientLayer
      .append('g')
      .attr('transform-origin', 'center')
      .attr(
        'transform',
        `translate(${
          scaledPosition.x - monomerAutochainPreviewSize.width / 2
        }, ${scaledPosition.y - monomerAutochainPreviewSize.height / 2})`,
      )
      .append('use')
      .attr('href', monomerAutochainSymbolElementId)
      .attr('fill', 'none')
      .attr('stroke', '#167782');

    return monomerAutochainPreviewSize;
  }

  private static showBondPreview(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    transientLayer
      .append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('stroke', '#167782')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4');
  }

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: AutochainPreviewViewParams,
  ) {
    const { monomerOrRnaItem, position, selectedMonomerToConnect } = params;
    const scaledPosition = Coordinates.modelToCanvas(position);
    let sizeOfAutochainPreviewToConnect: { width: number; height: number };

    if (isLibraryItemRnaPreset(monomerOrRnaItem)) {
      if (!monomerOrRnaItem.sugar) {
        KetcherLogger.error(
          'Cannot show autochain preview for RNA preset without sugar',
        );

        return;
      }

      sizeOfAutochainPreviewToConnect =
        AutochainPreviewView.showSingleMonomerPreview(
          transientLayer,
          monomerOrRnaItem.sugar,
          scaledPosition,
        );

      if (monomerOrRnaItem.base) {
        const basePosition = position.add(new Vec2(0, 1.5));
        const scaledBasePosition = Coordinates.modelToCanvas(basePosition);

        const sizeOfBaseAutochainPreview =
          AutochainPreviewView.showSingleMonomerPreview(
            transientLayer,
            monomerOrRnaItem.base,
            scaledBasePosition,
          );

        AutochainPreviewView.showBondPreview(
          transientLayer,
          scaledPosition.x,
          scaledPosition.y + sizeOfAutochainPreviewToConnect.height / 2,
          scaledPosition.x,
          scaledBasePosition.y - sizeOfBaseAutochainPreview.height / 2,
        );
      }

      if (monomerOrRnaItem.phosphate) {
        const phosphatePosition = position.add(new Vec2(1.5, 0));
        const scaledPhosphatePosition =
          Coordinates.modelToCanvas(phosphatePosition);

        const sizeOfPhosphateAutochainPreview =
          AutochainPreviewView.showSingleMonomerPreview(
            transientLayer,
            monomerOrRnaItem.phosphate,
            scaledPhosphatePosition,
          );

        AutochainPreviewView.showBondPreview(
          transientLayer,
          scaledPosition.x + sizeOfAutochainPreviewToConnect.width / 2,
          scaledPosition.y,
          scaledPhosphatePosition.x - sizeOfPhosphateAutochainPreview.width / 2,
          scaledPosition.y,
        );
      }
    } else {
      sizeOfAutochainPreviewToConnect =
        AutochainPreviewView.showSingleMonomerPreview(
          transientLayer,
          monomerOrRnaItem,
          scaledPosition,
        );
    }

    if (selectedMonomerToConnect) {
      AutochainPreviewView.showBondPreview(
        transientLayer,
        scaledPosition.x - SnakeLayoutCellWidth,
        scaledPosition.y,
        scaledPosition.x - sizeOfAutochainPreviewToConnect.width / 2,
        scaledPosition.y,
      );
    }
  }
}
