import { select } from 'd3';
import { D3SvgElementSelection } from 'application/render/types';
import { IRnaPreset, ZoomTool } from 'application/editor';
import { drawnStructuresSelector } from 'application/editor/constants';
import { BaseMonomer, HydrogenBond, PolymerBond, Vec2 } from 'domain/entities';
import { BondSnapView } from './BondSnapView';
import { AngleSnapView, AngleSnapViewParams } from './AngleSnapView';
import { BaseMonomerRenderer } from 'application/render';
import { DistanceSnapView, DistanceSnapViewParams } from './DistanceSnapView';
import {
  ModifyAminoAcidsView,
  ModifyAminoAcidsViewParams,
} from './ModifyAminoAcidsView';
import {
  LineLengthHighlightView,
  LineLengthHighlightViewParams,
} from './LineLengthHighlightView';
import { AutochainPreviewView } from 'application/render/renderers/TransientView/AutochainPreviewView';
import { MonomerItemType } from 'domain/types';
import { SelectionView, SelectionViewParams } from './SelectionView';
import {
  GroupCentersnapView,
  GroupCenterSnapViewParams,
} from 'application/render/renderers/TransientView/GroupCenterSnapView';

type ViewData<P> = {
  show: (layer: D3SvgElementSelection<SVGGElement, void>, params: P) => void;
  params: P;
  onShow?: VoidFunction;
  onHide?: VoidFunction;
  topLayer?: boolean;
};

export class TransientDrawingView {
  private readonly views: Map<string, ViewData<unknown>> = new Map();

  private readonly topLayer: D3SvgElementSelection<SVGGElement, void>;
  private readonly defaultLayer: D3SvgElementSelection<SVGGElement, void>;

  constructor() {
    const canvas = ZoomTool.instance?.canvas || select(drawnStructuresSelector);
    this.defaultLayer = canvas
      .append('g')
      .attr('class', 'transient-views-layer');

    this.topLayer = canvas
      .append('g')
      .attr('class', 'transient-views-top-layer');
    this.topLayer.raise();
  }

  private addView<P>(viewName, viewData: ViewData<P>) {
    if (this.views.has(viewName)) {
      this.removeView(viewName);
    }

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

  public showBondSnap(bond: PolymerBond | HydrogenBond) {
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
        bond.renderer?.setVisibility(true);
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

  public showDistanceSnap(params: DistanceSnapViewParams) {
    this.addView(DistanceSnapView.viewName, {
      show: DistanceSnapView.show,
      params,
    });
  }

  public hideDistanceSnap() {
    this.removeView(DistanceSnapView.viewName);
  }

  public showGroupCenterSnap(params: GroupCenterSnapViewParams) {
    this.addView(GroupCentersnapView.viewName, {
      show: GroupCentersnapView.show,
      params,
      topLayer: true,
    });
  }

  public hideGroupCenterSnap() {
    this.removeView(GroupCentersnapView.viewName);
  }

  public showModifyAminoAcidsView(params: ModifyAminoAcidsViewParams) {
    this.addView(ModifyAminoAcidsView.viewName, {
      show: ModifyAminoAcidsView.show,
      topLayer: true,
      params,
    });
  }

  public hideModifyAminoAcidsView() {
    this.removeView(ModifyAminoAcidsView.viewName);
  }

  public showLineLengthHighlight(params: LineLengthHighlightViewParams) {
    this.addView(LineLengthHighlightView.viewName, {
      show: LineLengthHighlightView.show,
      params,
      topLayer: true,
    });
  }

  public hideLineLengthHighlight() {
    this.removeView(LineLengthHighlightView.viewName);
  }

  public showAutochainPreview(
    monomerOrRnaItem: MonomerItemType | IRnaPreset,
    position: Vec2,
    selectedMonomerToConnect?: BaseMonomer,
  ) {
    this.addView(AutochainPreviewView.viewName, {
      show: AutochainPreviewView.show,
      params: { monomerOrRnaItem, position, selectedMonomerToConnect },
    });
  }

  public hideAutochainPreview() {
    this.removeView(AutochainPreviewView.viewName);
  }

  public showSelection(params: SelectionViewParams) {
    this.addView(SelectionView.viewName, {
      show: SelectionView.show,
      params,
    });
  }

  public hideSelection() {
    this.removeView(SelectionView.viewName);
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
