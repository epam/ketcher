import { select } from 'd3';
import type { D3SvgElementSelection } from 'application/render/types';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import ZoomTool from 'application/editor/tools/Zoom';
import { drawnStructuresSelector } from 'application/editor/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { HydrogenBond } from 'domain/entities/HydrogenBond';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import type { Vec2 } from 'domain/entities/vec2';
import { BondSnapView } from './BondSnapView';
import { type AngleSnapViewParameters, AngleSnapView } from './AngleSnapView';
import type { BaseMonomerRenderer } from 'application/render';
import {
  type DistanceSnapViewParameters,
  DistanceSnapView,
} from './DistanceSnapView';
import {
  type ModifyAminoAcidsViewParameters,
  ModifyAminoAcidsView,
} from './ModifyAminoAcidsView';
import {
  type LineLengthHighlightViewParameters,
  LineLengthHighlightView,
} from './LineLengthHighlightView';
import { AutochainPreviewView } from 'application/render/renderers/TransientView/AutochainPreviewView';
import type { MonomerItemType } from 'domain/types';
import { type SelectionViewParameters, SelectionView } from './SelectionView';
import {
  type GroupCenterSnapViewParameters,
  GroupCentersnapView,
} from 'application/render/renderers/TransientView/GroupCenterSnapView';
import { type RotationViewParameters, RotationView } from './RotationView';
import {
  type ReplacementHighlightViewParameters,
  ReplacementHighlightView,
} from './ReplacementHighlightView';

type ViewData<P> = {
  show: (
    layer: D3SvgElementSelection<SVGGElement, void>,
    parameters: P,
  ) => void;
  params: P;
  onShow?: VoidFunction;
  onHide?: VoidFunction;
  topLayer?: boolean;
};

type StoredViewData = {
  render: (layer: D3SvgElementSelection<SVGGElement, void>) => void;
  onShow?: VoidFunction;
  onHide?: VoidFunction;
  topLayer?: boolean;
};

export class TransientDrawingView {
  private readonly views: Map<string, StoredViewData> = new Map();

  private readonly topLayer: D3SvgElementSelection<SVGGElement, void>;
  private readonly defaultLayer: D3SvgElementSelection<SVGGElement, void>;

  constructor() {
    const canvas = ZoomTool.instance?.canvas ?? select(drawnStructuresSelector);
    this.defaultLayer = canvas
      .append('g')
      .attr('class', 'transient-views-layer');

    this.topLayer = canvas
      .append('g')
      .attr('class', 'transient-views-top-layer');
    this.topLayer.raise();
  }

  private addView<P>(viewName: string, viewData: ViewData<P>) {
    if (this.views.has(viewName)) {
      this.removeView(viewName);
    }

    this.views.set(viewName, {
      render: (layer) => viewData.show(layer, viewData.params),
      onShow: viewData.onShow,
      onHide: viewData.onHide,
      topLayer: viewData.topLayer,
    });
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

  public showAngleSnap(parameters: AngleSnapViewParameters) {
    const { polymerBond } = parameters;

    this.addView(AngleSnapView.viewName, {
      show: AngleSnapView.show,
      params: parameters,
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

  public showDistanceSnap(parameters: DistanceSnapViewParameters) {
    this.addView(DistanceSnapView.viewName, {
      show: DistanceSnapView.show,
      params: parameters,
    });
  }

  public hideDistanceSnap() {
    this.removeView(DistanceSnapView.viewName);
  }

  public showGroupCenterSnap(parameters: GroupCenterSnapViewParameters) {
    this.addView(GroupCentersnapView.viewName, {
      show: GroupCentersnapView.show,
      params: parameters,
      topLayer: true,
    });
  }

  public hideGroupCenterSnap() {
    this.removeView(GroupCentersnapView.viewName);
  }

  public showModifyAminoAcidsView(parameters: ModifyAminoAcidsViewParameters) {
    this.addView(ModifyAminoAcidsView.viewName, {
      show: ModifyAminoAcidsView.show,
      topLayer: true,
      params: parameters,
    });
  }

  public hideModifyAminoAcidsView() {
    this.removeView(ModifyAminoAcidsView.viewName);
  }

  public showLineLengthHighlight(
    parameters: LineLengthHighlightViewParameters,
  ) {
    this.addView(LineLengthHighlightView.viewName, {
      show: LineLengthHighlightView.show,
      params: parameters,
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
      show: (layer, params) => AutochainPreviewView.show(layer, params),
      params: { monomerOrRnaItem, position, selectedMonomerToConnect },
    });
  }

  public hideAutochainPreview() {
    this.removeView(AutochainPreviewView.viewName);
  }

  public showSelection(parameters: SelectionViewParameters) {
    this.addView(SelectionView.viewName, {
      show: SelectionView.show,
      params: parameters,
    });
  }

  public hideSelection() {
    this.removeView(SelectionView.viewName);
  }

  public showRotation(parameters: RotationViewParameters) {
    this.addView(RotationView.viewName, {
<<<<<<< HEAD
      show: RotationView.show,
      params: parameters,
=======
      show: (layer, viewParams) => RotationView.show(layer, viewParams),
      params,
>>>>>>> origin/master
      topLayer: true,
    });
  }

  public hideRotation() {
    this.removeView(RotationView.viewName);
  }

  public showReplacementHighlight(
    parameters: ReplacementHighlightViewParameters,
  ) {
    this.addView(ReplacementHighlightView.viewName, {
<<<<<<< HEAD
      show: ReplacementHighlightView.show,
      params: parameters,
=======
      show: (layer, viewParams) =>
        ReplacementHighlightView.show(layer, viewParams),
      params,
>>>>>>> origin/master
      topLayer: true,
    });
  }

  public hideReplacementHighlight() {
    this.removeView(ReplacementHighlightView.viewName);
  }

  public clear() {
    this.views.forEach((_, viewName) => this.removeView(viewName));
    this.update();
  }

  public update() {
    this.topLayer.selectAll('*').remove();
    this.defaultLayer.selectAll('*').remove();

    this.views.forEach((viewData) => {
      viewData.render(viewData.topLayer ? this.topLayer : this.defaultLayer);
      viewData?.onShow?.();
    });

    this.topLayer.raise();
  }
}
