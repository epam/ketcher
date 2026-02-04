/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Coordinates } from 'application/editor';
import { CoreStereoFlag } from 'domain/entities/CoreStereoFlag';
import { StereoFlag as StereoFlagEnum } from 'domain/entities/fragment';
import { Vec2 } from 'domain/entities';

export class StereoFlagRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGRectElement, void>
    | undefined;

  private textElement?: D3SvgElementSelection<SVGTextElement, void>;

  constructor(public stereoFlag: CoreStereoFlag) {
    super(stereoFlag);
    this.stereoFlag.setRenderer(this);
  }

  private get scaledPosition() {
    return Coordinates.modelToCanvas(this.stereoFlag.position);
  }

  private get flagLabel(): string {
    switch (this.stereoFlag.flagType) {
      case StereoFlagEnum.Abs:
        return 'ABS';
      case StereoFlagEnum.And:
        return 'AND Enantiomer';
      case StereoFlagEnum.Or:
        return 'OR Enantiomer';
      case StereoFlagEnum.Mixed:
        return 'Mixed';
      default:
        return '';
    }
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .attr('data-testid', 'stereo-flag')
      .attr('pointer-events', 'all')
      .attr(
        'transform',
        `translate(${this.scaledPosition.x}, ${this.scaledPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    this.textElement = this.rootElement
      .append('text')
      .attr('font-family', 'Arial')
      .attr('font-size', '13px')
      .attr('fill', '#000')
      .attr('y', 4)
      .text(this.flagLabel);

    this.appendHoverAreaElement();
    this.drawSelection();
  }

  private getTextBBox() {
    const textNode = this.textElement?.node();
    if (!textNode) {
      const HOVER_PADDING = 4;
      return {
        x: -HOVER_PADDING,
        y: -10,
        width: 50,
        height: 16,
      };
    }
    return textNode.getBBox();
  }

  private setSelectionContourAttributes(
    selectionContourElement: D3SvgElementSelection<SVGRectElement, void>,
    position = new Vec2(0, 0),
  ) {
    const bbox = this.getTextBBox();
    const HOVER_PADDING = 4;

    return selectionContourElement
      .attr('x', position.x + bbox.x - HOVER_PADDING)
      .attr('y', position.y + bbox.y - HOVER_PADDING)
      .attr('width', bbox.width + HOVER_PADDING * 2)
      .attr('height', bbox.height + HOVER_PADDING * 2)
      .attr('rx', 4);
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    if (!this.rootElement) {
      return;
    }

    this.hoverElement = this.rootElement
      .insert('rect', ':first-child')
      .attr('fill', 'none')
      .attr('stroke', '#0097A8')
      .attr('stroke-width', 1.2)
      .attr('class', 'dynamic-element');

    this.setSelectionContourAttributes(this.hoverElement);
  }

  protected appendHoverAreaElement(): void {
    if (!this.rootElement) {
      return;
    }

    this.hoverAreaElement = this.rootElement
      .append('rect')
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('pointer-events', 'all')
      .attr('class', 'dynamic-element');

    this.setSelectionContourAttributes(this.hoverAreaElement);

    this.hoverAreaElement
      ?.on('mouseover', () => {
        this.appendHover();
      })
      .on('mouseout', () => {
        this.removeHover();
      });
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }
    if (this.stereoFlag.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  public appendSelection(): void {
    if (!this.rootElement || this.selectionElement) {
      return;
    }

    this.selectionElement = this.canvas
      ?.insert('rect', ':first-child')
      .attr('fill', '#57ff8f')
      .attr('stroke', '#57ff8f')
      .attr('class', 'dynamic-element');

    this.setSelectionContourAttributes(
      this.selectionElement,
      this.scaledPosition,
    );
  }

  public removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  public move() {
    if (!this.rootElement) {
      return;
    }

    this.remove();
    this.show();
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  public remove() {
    super.remove();
    this.removeHover();
    this.removeSelection();
  }

  public moveSelection(): void {}
}
