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

/* eslint-disable no-undef */
import paperjs from 'paper';
import type { Element as RaphaelElement } from 'raphael';

export type HoverPathSource = RaphaelElement | null | undefined;

export function paperPathFromSVGElement(
  element: SVGElement,
): paper.Path | paper.CompoundPath | undefined {
  const tagName = element.tagName;

  if (tagName === 'circle') {
    const cx = parseFloat(element.getAttribute('cx') ?? '0');
    const cy = parseFloat(element.getAttribute('cy') ?? '0');
    const radius = parseFloat(element.getAttribute('r') ?? '0');
    return new paperjs.Path.Circle(new paperjs.Point(cx, cy), radius);
  }

  if (tagName === 'rect') {
    const x = parseFloat(element.getAttribute('x') ?? '0');
    const y = parseFloat(element.getAttribute('y') ?? '0');
    const width = parseFloat(element.getAttribute('width') ?? '0');
    const height = parseFloat(element.getAttribute('height') ?? '0');
    return new paperjs.Path.Rectangle(
      new paperjs.Rectangle(x, y, width, height),
      new paperjs.Size(
        parseFloat(element.getAttribute('rx') || '0'),
        parseFloat(element.getAttribute('ry') || '0'),
      ),
    );
  }

  if (tagName === 'path') {
    const pathData = element.getAttribute('d');
    return pathData ? new paperjs.CompoundPath(pathData) : undefined;
  }

  return undefined;
}

export function uniteHoverPaths(
  hoverPaths: HoverPathSource[],
): string | undefined {
  const elements = hoverPaths.flatMap((hoverPath) => {
    if (!hoverPath?.node) {
      return [];
    }

    const element = hoverPath.node;
    hoverPath.remove();
    return [element];
  });

  if (elements.length === 0) {
    return undefined;
  }

  paperjs.setup(document.createElement('canvas'));
  let combinedPath: paper.PathItem | undefined;

  elements.forEach((element) => {
    const paperPath = paperPathFromSVGElement(element);
    if (!paperPath) {
      return;
    }

    if (!paperPath.closed) {
      paperPath.closePath();
    }
    combinedPath = combinedPath ? combinedPath.unite(paperPath) : paperPath;
  });

  return combinedPath?.pathData;
}
