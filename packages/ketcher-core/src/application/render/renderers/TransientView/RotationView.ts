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

import { TransientView } from 'application/render/renderers/TransientView/TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { arc as d3Arc } from 'd3';

export type RotationViewParams = {
  center: Vec2;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  rotationAngle?: number;
  isRotating?: boolean;
};

const STYLE = {
  HANDLE_MARGIN: 15,
  HANDLE_RADIUS: 10,
  INITIAL_COLOR: '#B4B9D6',
  ACTIVE_COLOR: '#365CFF',
  RECT_RADIUS: 20,
  RECT_PADDING: 10,
};

const LEFT_ARROW_PATH =
  'M12.7034 14.8189L9.39616 17.6218L9.13674 16.1892C8.12927 16.0487 7.17132 15.6644 6.34605 15.0697C5.52078 14.475 4.85314 13.6878 4.40108 12.7766C3.94903 11.8653 3.72622 10.8575 3.75201 9.84062C3.7778 8.82373 4.0514 7.8285 4.54906 6.94133L5.8121 7.65148C5.45018 8.29719 5.24246 9.01784 5.20516 9.75712C5.16786 10.4964 5.302 11.2343 5.59709 11.9132C5.89218 12.592 6.34023 13.1935 6.90624 13.6705C7.47225 14.1475 8.1409 14.4872 8.85993 14.6631L8.62297 13.3587L12.7034 14.8189Z';
const RIGHT_ARROW_PATH =
  'M15.4493 13.0588L14.1862 12.3486C14.5482 11.7029 14.7559 10.9823 14.7932 10.243C14.8305 9.50371 14.6963 8.76582 14.4012 8.08695C14.1062 7.40809 13.6581 6.80665 13.0921 6.32962C12.5261 5.85259 11.8574 5.51288 11.1384 5.33704L11.3754 6.64501L7.29492 5.18124L10.6022 2.37834L10.8616 3.81095C11.8691 3.95145 12.827 4.33573 13.6523 4.93043C14.4776 5.52513 15.1452 6.31227 15.5973 7.22353C16.0493 8.13478 16.2721 9.1426 16.2463 10.1595C16.2205 11.1764 15.9469 12.1716 15.4493 13.0588Z';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class RotationView extends TransientView {
  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: RotationViewParams,
  ) {
    const {
      center,
      boundingBox,
      rotationAngle = 0,
      isRotating = false,
    } = params;

    const rectStartX = boundingBox.left - STYLE.RECT_PADDING;
    const rectStartY = boundingBox.top - STYLE.RECT_PADDING;
    const rectWidth = boundingBox.width + STYLE.RECT_PADDING * 2;
    const rectHeight = boundingBox.height + STYLE.RECT_PADDING * 2;

    // Draw bounding rect
    if (!isRotating) {
      transientLayer
        .append('rect')
        .attr('x', rectStartX)
        .attr('y', rectStartY)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('rx', STYLE.RECT_RADIUS)
        .attr('ry', STYLE.RECT_RADIUS)
        .attr('fill', 'none')
        .attr('stroke', STYLE.INITIAL_COLOR)
        .attr('stroke-dasharray', '4,4')
        .attr('style', 'pointer-events: none');
    }

    const handleCenterX = center.x;
    const handleCenterY =
      rectStartY - STYLE.HANDLE_MARGIN - STYLE.HANDLE_RADIUS;

    // Draw link from bounding box to handle
    const linkPath = isRotating
      ? `M${center.x},${center.y}L${handleCenterX},${handleCenterY}`
      : `M${handleCenterX},${handleCenterY}l0,${
          STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN
        }`;

    transientLayer
      .append('path')
      .attr('d', linkPath)
      .attr('stroke', isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR)
      .attr('stroke-dasharray', '4,4')
      .attr('fill', 'none')
      .attr('style', 'pointer-events: none');

    // Draw cross at center
    const crossColor = isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR;
    transientLayer
      .append('path')
      .attr(
        'd',
        `M${center.x - 8},${center.y}h16M${center.x},${center.y - 8}v16`,
      )
      .attr('stroke', crossColor)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('style', 'pointer-events: none');

    // Draw handle circle
    const handleGroup = transientLayer
      .append('g')
      .attr('class', 'rotation-handle')
      .attr('data-testid', 'rotation-handle')
      .attr('transform', `translate(${handleCenterX},${handleCenterY})`);

    handleGroup
      .append('circle')
      .attr('r', STYLE.HANDLE_RADIUS)
      .attr('fill', STYLE.INITIAL_COLOR)
      .attr('stroke', 'none')
      .attr('style', 'cursor: grab');

    // Draw arrows on handle
    const arrowGroup = handleGroup.append('g');
    arrowGroup
      .append('path')
      .attr('d', LEFT_ARROW_PATH)
      .attr('fill', 'white')
      .attr('transform', 'translate(-10,-10)');
    arrowGroup
      .append('path')
      .attr('d', RIGHT_ARROW_PATH)
      .attr('fill', 'white')
      .attr('transform', 'translate(-10,-10)');

    // Draw rotation protractor and arc when rotating
    if (isRotating && Math.abs(rotationAngle) > 0.001) {
      const radius =
        Math.sqrt(
          Math.pow(handleCenterY - center.y, 2) +
            Math.pow(handleCenterX - center.x, 2),
        ) -
        STYLE.HANDLE_MARGIN -
        STYLE.HANDLE_RADIUS;

      if (radius > 0) {
        // Draw protractor circle
        transientLayer
          .append('circle')
          .attr('cx', center.x)
          .attr('cy', center.y)
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', '#E1E5EA')
          .attr('stroke-dasharray', '4,4')
          .attr('style', 'pointer-events: none');

        // Draw rotation arc
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + rotationAngle;

        const arcGenerator = d3Arc()
          .innerRadius(0)
          .outerRadius(radius)
          .startAngle(Math.min(startAngle, endAngle))
          .endAngle(Math.max(startAngle, endAngle));

        transientLayer
          .append('path')
          .attr('d', arcGenerator as unknown as string)
          .attr('transform', `translate(${center.x},${center.y})`)
          .attr('fill', 'none')
          .attr('stroke', STYLE.ACTIVE_COLOR)
          .attr('stroke-width', 2)
          .attr('style', 'pointer-events: none');

        // Draw angle text
        const angleInDegrees = Math.round((rotationAngle * 180) / Math.PI);
        const textAngle = startAngle + rotationAngle / 2;
        const textRadius = radius + 20;
        const textX = center.x + textRadius * Math.cos(textAngle);
        const textY = center.y + textRadius * Math.sin(textAngle);

        transientLayer
          .append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '16px')
          .attr('fill', '#333333')
          .text(`${angleInDegrees}°`);
      }
    }
  }

  public static readonly viewName = 'RotationView';
}
