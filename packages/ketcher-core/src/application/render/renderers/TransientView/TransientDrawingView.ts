import { select } from 'd3';
import { D3SvgElementSelection } from 'application/render/types';
import { ZoomTool } from 'application/editor';
import { drawnStructuresSelector } from 'application/editor/constants';
import { PolymerBond, Vec2 } from 'domain/entities';
import { BondSnapView } from './BondSnapView';
import { AngleSnapView } from 'application/render/renderers/TransientView/AngleSnapView';

type ViewData<P> = {
  show: (layer: D3SvgElementSelection<SVGGElement, void>, params: P) => void;
  params: P;
};

export class TransientDrawingView {
  private views: Map<string, ViewData<unknown>> = new Map();

  private readonly layer: D3SvgElementSelection<SVGGElement, void>;

  constructor() {
    const canvas = ZoomTool.instance?.canvas || select(drawnStructuresSelector);
    this.layer = canvas.append('g');
  }

  private addView<P>(viewName, viewData: ViewData<P>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.views.set(viewName, viewData);
  }

  private removeView(viewName: string) {
    this.views.delete(viewName);
    this.update();
  }

  public showBondSnap(bond: PolymerBond) {
    this.addView(BondSnapView.viewName, {
      show: BondSnapView.show,
      params: bond,
    });
  }

  public hideBondSnap() {
    this.removeView(BondSnapView.viewName);
  }

  public showAngleSnap(connectedPosition: Vec2, movingPosition: Vec2) {
    this.addView(AngleSnapView.viewName, {
      show: AngleSnapView.show,
      params: { connectedPosition, movingPosition },
    });
  }

  public hideAngleSnap() {
    this.removeView(AngleSnapView.viewName);
  }

  public clear() {
    this.views.clear();
    this.update();
  }

  public update() {
    this.layer.selectAll('*').remove();
    this.views.forEach((viewData) => {
      viewData.show(this.layer, viewData.params);
    });
    this.layer.raise();
  }
}
