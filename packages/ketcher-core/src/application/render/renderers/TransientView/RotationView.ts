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
import { Coordinates } from 'application/editor';

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
  cursor?: Vec2;
};

type RotationHandleEvent = {
  type: 'down' | 'drag';
  event: PointerEvent;
};

type RotationCenterEvent = {
  type: 'down' | 'drag';
  event: PointerEvent;
};

const STYLE = {
  HANDLE_MARGIN: 15,
  HANDLE_RADIUS: 10,
  INITIAL_COLOR: '#B4B9D6',
  ACTIVE_COLOR: '#365CFF',
  RECT_RADIUS: 20,
  RECT_PADDING: 30,
  // Small step to snap the protractor radius for a steadier UI.
  PROTRACTOR_RADIUS_STEP: 5,
  // Keep the protractor slightly inside the cursor-to-center line.
  PROTRACTOR_CURSOR_OFFSET: 12,
  // Protractor helpers styling, aligned with rotate-controller.
  PROTRACTOR_COLOR: '#E1E5EA',
  DEGREE_FONT_SIZE: 12,
  DEGREE_TEXT_MARGIN: 10,
  DEGREE_LINE_LENGTH: 15,
  MIN_RADIUS_FOR_TEXT: 65,
};

const LEFT_ARROW_PATH =
  'M12.7034 14.8189L9.39616 17.6218L9.13674 16.1892C8.12927 16.0487 7.17132 15.6644 6.34605 15.0697C5.52078 14.475 4.85314 13.6878 4.40108 12.7766C3.94903 11.8653 3.72622 10.8575 3.75201 9.84062C3.7778 8.82373 4.0514 7.8285 4.54906 6.94133L5.8121 7.65148C5.45018 8.29719 5.24246 9.01784 5.20516 9.75712C5.16786 10.4964 5.302 11.2343 5.59709 11.9132C5.89218 12.592 6.34023 13.1935 6.90624 13.6705C7.47225 14.1475 8.1409 14.4872 8.85993 14.6631L8.62297 13.3587L12.7034 14.8189Z';
const RIGHT_ARROW_PATH =
  'M15.4493 13.0588L14.1862 12.3486C14.5482 11.7029 14.7559 10.9823 14.7932 10.243C14.8305 9.50371 14.6963 8.76582 14.4012 8.08695C14.1062 7.40809 13.6581 6.80665 13.0921 6.32962C12.5261 5.85259 11.8574 5.51288 11.1384 5.33704L11.3754 6.64501L7.29492 5.18124L10.6022 2.37834L10.8616 3.81095C11.8691 3.95145 12.827 4.33573 13.6523 4.93043C14.4776 5.52513 15.1452 6.31227 15.5973 7.22353C16.0493 8.13478 16.2721 9.1426 16.2463 10.1595C16.2205 11.1764 15.9469 12.1716 15.4493 13.0588Z';

const getDegreeDifference = (a: number, b: number) => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

const getPointOnCircle = (center: Vec2, radius: number, angle: number) => {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
};

const getRotationArcPath = (
  center: Vec2,
  radius: number,
  startAngle: number,
  rotationAngle: number,
) => {
  const start = getPointOnCircle(center, radius, startAngle);
  const end = getPointOnCircle(center, radius, startAngle + rotationAngle);
  const largeArcFlag = Math.abs(rotationAngle) > Math.PI ? 1 : 0;
  const sweepFlag = rotationAngle < 0 ? 0 : 1;

  return (
    `M${start.x},${start.y}` +
    `A${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${end.x},${end.y}`
  );
};

// TypeScript doesn't support abstract static methods, but the TransientView pattern
// requires static show() methods. This ts-ignore is necessary to follow the
// established pattern used by other TransientView subclasses (SelectionView, etc.)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class RotationView extends TransientView {
  private static lastSnappingRadius?: number;
  private static wasRotating = false;
  private static readonly rotationHandleSubscribers = new Set<
    (payload: RotationHandleEvent) => void
  >();

  private static readonly rotationCenterSubscribers = new Set<
    (payload: RotationCenterEvent) => void
  >();

  public static subscribeRotationHandle(
    listener: (payload: RotationHandleEvent) => void,
  ) {
    RotationView.rotationHandleSubscribers.add(listener);
    return () => RotationView.rotationHandleSubscribers.delete(listener);
  }

  public static subscribeRotationCenter(
    listener: (payload: RotationCenterEvent) => void,
  ) {
    RotationView.rotationCenterSubscribers.add(listener);
    return () => RotationView.rotationCenterSubscribers.delete(listener);
  }

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: RotationViewParams,
  ) {
    const {
      center,
      boundingBox,
      rotationAngle = 0,
      isRotating = false,
      cursor,
    } = params;

    if (!isRotating) {
      RotationView.lastSnappingRadius = undefined;
    } else if (!RotationView.wasRotating) {
      RotationView.lastSnappingRadius = undefined;
    }
    RotationView.wasRotating = isRotating;

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
        .attr('stroke-dasharray', '3,1')
        .attr('style', 'pointer-events: none');
    }

    const cursorInCanvas =
      isRotating && cursor ? Coordinates.viewToCanvas(cursor) : undefined;

    const handleCenterX = isRotating
      ? cursorInCanvas?.x ?? center.x
      : boundingBox.left + boundingBox.width / 2;
    const handleCenterY =
      cursorInCanvas?.y ??
      rectStartY - STYLE.HANDLE_MARGIN - STYLE.HANDLE_RADIUS;

    // Draw link from bounding box to handle
    const linkPath = isRotating
      ? `M${center.x},${center.y}L${handleCenterX},${handleCenterY}`
      : `M${handleCenterX},${handleCenterY}l0,${
          STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN
        }`;

    const link = transientLayer
      .append('path')
      .attr('d', linkPath)
      .attr('stroke', isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR)
      .attr('stroke-dasharray', '4,4')
      .attr('fill', 'none')
      .attr('style', 'pointer-events: none');

    // Draw cross at center (draggable)
    const crossColor = isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR;
    const crossGroup = transientLayer
      .append('g')
      .attr('class', 'rotation-center-handle')
      .attr('data-testid', 'rotation-center-handle')
      .attr('style', 'pointer-events: all');

    const crossHitBoxSize = 24; // bbox size to make the center cross easier to grab
    crossGroup
      .append('rect')
      .attr('x', center.x - crossHitBoxSize / 2)
      .attr('y', center.y - crossHitBoxSize / 2)
      .attr('width', crossHitBoxSize)
      .attr('height', crossHitBoxSize)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .attr('style', 'pointer-events: all')
      .on('mousedown', (event: PointerEvent) => {
        event.stopPropagation();
        event.preventDefault();
        RotationView.rotationCenterSubscribers.forEach((listener) =>
          listener({ type: 'down', event }),
        );
      })
      .on('mousemove', (event: PointerEvent) => {
        if (event.buttons !== 1) return;
        RotationView.rotationCenterSubscribers.forEach((listener) =>
          listener({ type: 'drag', event }),
        );
      });

    const crossPath = crossGroup
      .append('path')
      .attr(
        'd',
        `M${center.x - 8},${center.y}h16M${center.x},${center.y - 8}v16`,
      )
      .attr('stroke', crossColor)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('style', 'pointer-events: none');

    if (!isRotating) {
      const hoverLinkPath = `M${center.x},${center.y}L${handleCenterX},${handleCenterY}`;
      const defaultLinkPath = linkPath;

      crossGroup
        .on('mouseenter', () => {
          crossPath.attr('stroke', STYLE.ACTIVE_COLOR);
          link.attr('d', hoverLinkPath).attr('stroke', STYLE.ACTIVE_COLOR);
        })
        .on('mouseleave', () => {
          crossPath.attr('stroke', STYLE.INITIAL_COLOR);
          link.attr('d', defaultLinkPath).attr('stroke', STYLE.INITIAL_COLOR);
        });
    }

    // Draw handle circle
    const handleGroup = transientLayer
      .append('g')
      .attr('class', 'rotation-handle')
      .attr('data-testid', 'rotation-handle')
      .attr('transform', `translate(${handleCenterX},${handleCenterY})`)
      .on('mousedown', (event: PointerEvent) => {
        event.stopPropagation();
        event.preventDefault();
        RotationView.rotationHandleSubscribers.forEach((listener) =>
          listener({ type: 'down', event }),
        );
      })
      .on('mousedown', (event: PointerEvent) => {
        if (event.buttons !== 1) return;
        RotationView.rotationHandleSubscribers.forEach((listener) =>
          listener({ type: 'drag', event }),
        );
      });

    handleGroup
      .append('circle')
      .attr('r', STYLE.HANDLE_RADIUS)
      .attr('fill', isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR)
      .attr('stroke', 'none')
      .attr('style', `cursor: ${isRotating ? 'grabbing' : 'grab'}`);

    // Draw arrows on handle
    const arrowGroup = handleGroup.append('g');
    arrowGroup
      .append('path')
      .attr('d', LEFT_ARROW_PATH)
      .attr('fill', isRotating ? 'none' : 'white')
      .attr('transform', 'translate(-10,-10)');
    arrowGroup
      .append('path')
      .attr('d', RIGHT_ARROW_PATH)
      .attr('fill', isRotating ? 'none' : 'white')
      .attr('transform', 'translate(-10,-10)');

    if (!isRotating) {
      handleGroup
        .on('mouseenter', () => {
          handleGroup.select('circle').attr('fill', STYLE.ACTIVE_COLOR);
        })
        .on('mouseleave', () => {
          handleGroup.select('circle').attr('fill', STYLE.INITIAL_COLOR);
        });
    }

    // Draw rotation protractor and arc when rotating
    if (isRotating) {
      const centerInView = Coordinates.canvasToView(center);
      const fallbackRadius =
        Math.sqrt(
          Math.pow(handleCenterY - centerInView.y, 2) +
            Math.pow(handleCenterX - centerInView.x, 2),
        ) -
        STYLE.HANDLE_MARGIN -
        STYLE.HANDLE_RADIUS;

      const cursorDistance = cursor
        ? Math.sqrt(
            Math.pow(cursor.x - centerInView.x, 2) +
              Math.pow(cursor.y - centerInView.y, 2),
          )
        : undefined;

      const rawRadius =
        cursorDistance === undefined
          ? fallbackRadius
          : Math.max(cursorDistance - STYLE.PROTRACTOR_CURSOR_OFFSET, 0);

      const snappedToStep =
        Math.round(rawRadius / STYLE.PROTRACTOR_RADIUS_STEP) *
        STYLE.PROTRACTOR_RADIUS_STEP;
      let radius = snappedToStep > 0 ? snappedToStep : 0;

      const lastSnappingRadius = RotationView.lastSnappingRadius;
      if (radius > 0) {
        if (lastSnappingRadius === undefined) {
          RotationView.lastSnappingRadius = radius;
        } else {
          // Keep the radius stable until it grows/shrinks enough (as in rotate-controller).
          const upperThreshold = lastSnappingRadius * 1.4;
          const lowerThreshold = lastSnappingRadius / 1.4;
          if (radius >= upperThreshold || radius <= lowerThreshold) {
            RotationView.lastSnappingRadius = radius;
          } else {
            radius = lastSnappingRadius;
          }
        }
      }

      if (radius > 0) {
        // Draw protractor circle
        transientLayer
          .append('circle')
          .attr('cx', center.x)
          .attr('cy', center.y)
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', STYLE.PROTRACTOR_COLOR)
          .attr('stroke-dasharray', '4,4')
          .attr('style', 'pointer-events: none');

        // Draw protractor degree ticks and labels (as in rotate-controller)
        const startAngle = -Math.PI / 2;
        const toRadians = (deg: number) => (deg * Math.PI) / 180;
        const predefinedDegrees = [
          0, 30, 45, 60, 90, 120, 135, 150, 180, -150, -135, -120, -90, -60,
          -45, -30,
        ];
        const currentDegrees = Math.round((rotationAngle * 180) / Math.PI);
        const tickLength =
          radius >= STYLE.MIN_RADIUS_FOR_TEXT
            ? STYLE.DEGREE_LINE_LENGTH
            : STYLE.DEGREE_LINE_LENGTH / 2;

        predefinedDegrees.forEach((degree) => {
          const diff = getDegreeDifference(degree, currentDegrees);
          const angle = startAngle + toRadians(degree);
          const lineStartX = center.x + radius * Math.cos(angle);
          const lineStartY = center.y + radius * Math.sin(angle);
          const lineEndX = center.x + (radius + tickLength) * Math.cos(angle);
          const lineEndY = center.y + (radius + tickLength) * Math.sin(angle);

          transientLayer
            .append('path')
            .attr('d', `M${lineStartX},${lineStartY}L${lineEndX},${lineEndY}`)
            .attr('stroke', diff > 90 ? 'none' : STYLE.PROTRACTOR_COLOR)
            .attr('stroke-dasharray', '4,4')
            .attr('style', 'pointer-events: none');

          if (radius < STYLE.MIN_RADIUS_FOR_TEXT) {
            return;
          }

          const textRadius = radius + STYLE.DEGREE_TEXT_MARGIN + tickLength;
          const textX = center.x + textRadius * Math.cos(angle);
          const textY = center.y + textRadius * Math.sin(angle);
          const textFill =
            diff > 90
              ? 'none'
              : degree !== 0 && degree === currentDegrees
              ? STYLE.ACTIVE_COLOR
              : STYLE.INITIAL_COLOR;

          transientLayer
            .append('text')
            .attr('x', textX)
            .attr('y', textY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', `${STYLE.DEGREE_FONT_SIZE}px`)
            .attr('fill', textFill)
            .text(`${degree}°`);
        });

        // Draw rotation arc
        transientLayer
          .append('path')
          .attr(
            'd',
            getRotationArcPath(center, radius, startAngle, rotationAngle),
          )
          .attr('fill', 'none')
          .attr('stroke', STYLE.ACTIVE_COLOR)
          .attr('stroke-width', 1)
          .attr('style', 'pointer-events: none');

        // Draw angle text
        const angleInDegrees = Math.round((rotationAngle * 180) / Math.PI);
        const textAngle = startAngle;
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
