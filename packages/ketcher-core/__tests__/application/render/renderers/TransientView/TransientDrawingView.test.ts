import { Coordinates } from 'application/editor/shared/coordinates';
import { TransientDrawingView } from 'application/render/renderers/TransientView/TransientDrawingView';
import { AutochainPreviewView } from 'application/render/renderers/TransientView/AutochainPreviewView';
import type { MonomerItemType } from 'domain/types';
import { Vec2 } from 'domain/entities';

describe('TransientDrawingView', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('keeps the autochain view class context when rendering its callback', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const drawingLayer = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g',
    );
    drawingLayer.classList.add('drawn-structures');
    svg.appendChild(drawingLayer);
    document.body.appendChild(svg);

    jest
      .spyOn(Coordinates, 'modelToCanvas')
      .mockImplementation((position) => position);
    const autochainView = AutochainPreviewView as unknown as {
      showSingleMonomerPreview: jest.Mock;
    };
    const showSingleMonomerPreview = jest
      .spyOn(autochainView, 'showSingleMonomerPreview')
      .mockReturnValue({ width: 10, height: 10 });
    const transientDrawingView = new TransientDrawingView();

    transientDrawingView.showAutochainPreview(
      {} as MonomerItemType,
      new Vec2(0, 0),
    );
    transientDrawingView.update();

    expect(showSingleMonomerPreview).toHaveBeenCalledTimes(1);
  });
});
