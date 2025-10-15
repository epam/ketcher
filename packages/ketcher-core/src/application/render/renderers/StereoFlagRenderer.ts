import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Coordinates } from 'application/editor/shared/coordinates';
import { CoreEditor } from 'application/editor';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Fragment, StereoFlag } from 'domain/entities';

export class StereoFlagRenderer extends BaseRenderer {
  private textElement?: D3SvgElementSelection<SVGTextElement, void>;
  private selectionElement?: D3SvgElementSelection<SVGRectElement, void>;

  constructor(public monomer: BaseMonomer, public fragmentId: number) {
    super(monomer);
  }

  get scaledPosition() {
    const fragment = this.monomer.monomerItem.struct.frags.get(this.fragmentId);
    if (!fragment) return Coordinates.modelToCanvas(this.monomer.position);

    const position =
      fragment.stereoFlagPosition ||
      Fragment.getDefaultStereoFlagPosition(
        this.monomer.monomerItem.struct,
        this.fragmentId,
      );

    if (!position) return Coordinates.modelToCanvas(this.monomer.position);

    // Position is relative to monomer, need to add monomer position
    const absolutePosition = this.monomer.position.add(position);
    return Coordinates.modelToCanvas(absolutePosition);
  }

  get center() {
    return this.scaledPosition;
  }

  private getStereoFlagLabel(): string {
    const fragment = this.monomer.monomerItem.struct.frags.get(this.fragmentId);
    if (!fragment?.enhancedStereoFlag) return '';

    const stereoFlagMap = {
      [StereoFlag.Abs]: 'ABS',
      [StereoFlag.And]: 'AND Enantiomer',
      [StereoFlag.Mixed]: 'Mixed',
      [StereoFlag.Or]: 'OR Enantiomer',
    };

    return stereoFlagMap[fragment.enhancedStereoFlag] || '';
  }

  show() {
    const editor = CoreEditor.provideEditorInstance();
    const label = this.getStereoFlagLabel();

    if (!label) return;

    this.rootElement = this.canvas
      .insert('g', ':first-child')
      .data([this])
      .attr('pointer-events', 'all')
      .attr('data-testid', 'stereo-flag')
      .attr(
        'transform',
        `translate(${this.scaledPosition.x}, ${this.scaledPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    this.textElement = this.rootElement
      ?.append('text')
      .text(label)
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#000');

    this.rootElement
      ?.on('mouseover', () => {
        this.showHover();
      })
      .on('mouseleave', () => {
        this.hideHover();
      })
      .on('mouseup', (event) => {
        editor.events.mouseUpAtom.dispatch(event);
      });
  }

  drawSelection() {
    if (this.selectionElement || !this.textElement) return;

    const bbox = this.textElement.node()?.getBBox();
    if (!bbox) return;

    this.selectionElement = this.rootElement
      ?.insert('rect', ':first-child')
      .attr('x', bbox.x - 2)
      .attr('y', bbox.y - 2)
      .attr('width', bbox.width + 4)
      .attr('height', bbox.height + 4)
      .attr('fill', 'none')
      .attr('stroke', '#57FF8F')
      .attr('stroke-width', '1.2');
  }

  moveSelection() {
    this.remove();
    this.show();
    this.drawSelection();
  }

  appendHover() {
    if (this.hoverElement || !this.textElement) return;

    const bbox = this.textElement.node()?.getBBox();
    if (!bbox) return;

    this.hoverElement = this.rootElement
      ?.insert('rect', ':first-child')
      .attr('x', bbox.x - 2)
      .attr('y', bbox.y - 2)
      .attr('width', bbox.width + 4)
      .attr('height', bbox.height + 4)
      .attr('fill', '#0097A8')
      .attr('fill-opacity', 0.2)
      .attr('stroke', 'none');
  }

  showHover() {
    this.appendHover();
  }

  remove() {
    super.remove();
    this.textElement = undefined;
    this.selectionElement = undefined;
  }
}
