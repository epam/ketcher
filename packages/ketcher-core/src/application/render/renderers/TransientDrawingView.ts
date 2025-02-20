import { BondSnapView } from 'application/render/renderers/BondSnapView';
import { PolymerBond } from 'domain/entities';
import { D3SvgElementSelection } from 'application/render/types';
import { ZoomTool } from 'application/editor';
import { select } from 'd3';
import { drawnStructuresSelector } from 'application/editor/constants';

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
