import { select } from 'd3';
import { D3SvgElementSelection } from 'application/render/types';
import { ZoomTool } from 'application/editor';
import { drawnStructuresSelector } from 'application/editor/constants';
import { PolymerBond } from 'domain/entities';
import { BondSnapView } from './BondSnapView';
import { AngleSnapView, AngleSnapViewParams } from './AngleSnapView';
import { BaseMonomerRenderer } from 'application/render';

type ViewData<P> = {
  show: (layer: D3SvgElementSelection<SVGGElement, void>, params: P) => void;
  params: P;
  onShow?: VoidFunction;
  onHide?: VoidFunction;
  topLayer?: boolean;
};

export class TransientDrawingView {
  private views: Map<string, ViewData<unknown>> = new Map();

  private readonly topLayer: D3SvgElementSelection<SVGGElement, void>;
  private readonly defaultLayer: D3SvgElementSelection<SVGGElement, void>;

  constructor() {
    const canvas = ZoomTool.instance?.canvas || select(drawnStructuresSelector);
    this.topLayer = canvas
      .append('g')
      .attr('class', 'transient-views-top-layer');
    this.defaultLayer = canvas
      .append('g')
      .attr('class', 'transient-views-layer');
  }

  private addView<P>(viewName, viewData: ViewData<P>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.views.set(viewName, viewData);
  }

  private removeView(viewName: string) {
    const viewData = this.views.get(viewName);
    if (viewData?.onHide) {
      viewData.onHide();
    }

    this.views.delete(viewName);
  }

  public showBondSnap(bond: PolymerBond) {
    this.addView(BondSnapView.viewName, {
      show: BondSnapView.show,
      params: bond,
      topLayer: true,
      onShow: () => {
        bond.renderer?.setVisibility(false);
        if (bond.firstMonomer.renderer) {
          (
            bond.firstMonomer.renderer as BaseMonomerRenderer
          ).setLabelVisibility(false);
        }
        if (bond.secondMonomer?.renderer) {
          (
            bond.secondMonomer.renderer as BaseMonomerRenderer
          ).setLabelVisibility(false);
        }
      },
      onHide: () => {
        bond.renderer?.setVisibility(false);
        if (bond.firstMonomer.renderer) {
          (
            bond.firstMonomer.renderer as BaseMonomerRenderer
          ).setLabelVisibility(true);
        }
        if (bond.secondMonomer?.renderer) {
          (
            bond.secondMonomer.renderer as BaseMonomerRenderer
          ).setLabelVisibility(true);
        }
      },
    });
  }

  public hideBondSnap() {
    this.removeView(BondSnapView.viewName);
  }

  public showAngleSnap(params: AngleSnapViewParams) {
    const { polymerBond } = params;

    this.addView(AngleSnapView.viewName, {
      show: AngleSnapView.show,
      params,
      onShow: () => {
        polymerBond.renderer?.setVisibility(false);
      },
      onHide: () => {
        polymerBond.renderer?.setVisibility(true);
      },
    });
  }

  public hideAngleSnap() {
    this.removeView(AngleSnapView.viewName);
  }

  public clear() {
    this.views.forEach((_, viewName) => this.removeView(viewName));
    this.update();
  }

  public update() {
    this.topLayer.selectAll('*').remove();
    this.defaultLayer.selectAll('*').remove();

    this.views.forEach((viewData) => {
      viewData.show(
        viewData.topLayer ? this.topLayer : this.defaultLayer,
        viewData.params,
      );
      viewData?.onShow?.();
    });

    this.topLayer.raise();
  }
}
