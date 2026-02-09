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

import { Box2Abs, Text, Vec2 } from 'domain/entities';
import { flatten } from 'lodash/fp';

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import ReStruct from './restruct';
import { Scale } from 'domain/helpers';
import { RaphaelBaseElement } from 'raphael';

interface SerializedTextNode {
  detail?: number;
  format: number;
  mode?: string;
  style: string;
  text: string;
  type: string;
  version?: number;
}

interface SerializedParagraphNode {
  children: Array<SerializedTextNode>;
  direction?: string;
  format?: string | number;
  indent?: number;
  type: string;
  version?: number;
}

interface SerializedRootNode {
  children: Array<SerializedParagraphNode>;
  direction?: string;
  format?: string | number;
  indent?: number;
  type: string;
  version?: number;
}

interface SerializedEditorState {
  root: SerializedRootNode;
}

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

const SCALE = 40; // from ketcher-core

class ReText extends ReObject {
  private readonly item: Text;
  paths: Array<Array<RaphaelBaseElement>> = [];

  constructor(text: Text) {
    super('text');
    this.item = text;
  }

  static isSelectable() {
    return true;
  }

  getReferencePoints(): Array<Vec2> {
    if (!this.paths.length) return [];

    const { p0, p1 } = this.getRelBox(this.paths);

    const p = this.item.position;
    const width = Math.abs(Vec2.diff(p0, p1).x) / SCALE;
    const height = Math.abs(Vec2.diff(p0, p1).y) / SCALE;

    const refPoints: Array<Vec2> = [];

    refPoints.push(
      this.item.position,
      new Vec2(p.x, p.y + height),
      new Vec2(p.x + width, p.y + height),
      new Vec2(p.x + width, p.y),
    );

    return refPoints;
  }

  getVBoxObj(): Box2Abs {
    const [leftTopPoint, _, rightBottomPoint] = this.getReferencePoints();
    return new Box2Abs(leftTopPoint, rightBottomPoint);
  }

  hoverPath(render: any): any {
    const { p0, p1 } = this.getRelBox(this.paths);
    const topLeft = p0.sub(render.options.offset);
    const { x: width, y: height } = p1.sub(p0);

    return render.paper.rect(topLeft.x, topLeft.y, width, height, 5);
  }

  getRelBox(paths: Array<Array<RaphaelBaseElement>>): { p0: Vec2; p1: Vec2 } {
    const firstElOfFirstRow: RaphaelBaseElement = paths[0][0];
    const leftEdge = firstElOfFirstRow.getBBox().x;

    const firstRow: Array<RaphaelBaseElement> = paths[0];
    const topEdge: number = Math.min(
      ...firstRow.map((path) => path.getBBox().y),
    );

    const widestRow: Array<RaphaelBaseElement> = paths.reduce(
      (widestRow, nextRow) =>
        this.getRowWidth(nextRow) > this.getRowWidth(widestRow)
          ? nextRow
          : widestRow,
      paths[0],
    );
    const lastElOfWidestRow: RaphaelBaseElement =
      widestRow[widestRow.length - 1];
    const rightEdge: number =
      lastElOfWidestRow.getBBox().x + lastElOfWidestRow.getBBox().width;

    const lastRow: Array<RaphaelBaseElement> = paths[paths.length - 1];
    const bottomEdge: number = Math.max(
      ...lastRow.map((path) => path.getBBox().y + path.getBBox().height),
    );

    return {
      p0: new Vec2(leftEdge, topEdge),
      p1: new Vec2(rightEdge, bottomEdge),
    };
  }

  getRowWidth(row: Array<RaphaelBaseElement>): number {
    return row.reduce((rowWidth, nextRow) => {
      rowWidth += nextRow.getBBox().width;
      return rowWidth;
    }, 0);
  }

  drawHover(render: any): any {
    if (!this.paths.length) return null;
    const ret = this.hoverPath(render).attr(render.options.hoverStyle);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
    return ret;
  }

  makeSelectionPlate(restruct: ReStruct, paper: any, options: any): any {
    if (!this.paths.length || !paper) return null;
    return this.hoverPath(restruct.render).attr(options.selectionStyle);
  }

  show(restruct: ReStruct, _id: number, options: any): void {
    const render = restruct.render;
    const paper = render.paper;
    const paperScale = Scale.modelToCanvas(this.item.position, options);

    let shiftY = 0;
    this.paths = [];
    // TODO: create parser in ketcher-core package
    const editorState: SerializedEditorState | null = this.item.content
      ? (JSON.parse(this.item.content) as SerializedEditorState)
      : null;
    if (!editorState?.root) {
      return;
    }

    const paragraphs = editorState.root.children.filter(
      (child) => child.type === 'paragraph',
    );

    paragraphs.forEach((paragraph: SerializedParagraphNode) => {
      const textNodes = (
        paragraph.children as SerializedTextNode[]
      ).filter((child) => child.type === 'text');

      let shiftX = 0;
      const row: Array<RaphaelBaseElement> = [];

      if (textNodes.length === 0) {
        const path = paper
          .text(paperScale.x, paperScale.y, '\u00a0')
          .attr({
            font: options.font,
            'font-size': options.fontszInPx,
            'text-anchor': 'start',
            fill: '#000000',
          });
        path.node.setAttribute('data-testid', 'text-label');
        path.node.setAttribute(
          'data-text-id',
          restruct.molecule.texts.keyOf(this.item),
        );
        path.translateAbs(0, shiftY);
        row.push(path);
      } else {
        textNodes.forEach((textNode: SerializedTextNode) => {
          const styles = this.getStylesFromTextNode(textNode, options);
          const text =
            textNode.text.replace(/[^\S\r\n]/g, '\u00a0') || '\u00a0';

          const path = paper
            .text(paperScale.x, paperScale.y, text)
            .attr({
              font: options.font,
              'font-size': options.fontszInPx,
              'text-anchor': 'start',
              fill: '#000000',
              ...styles,
            });
          path.node.setAttribute('data-testid', 'text-label');
          path.node.setAttribute(
            'data-text-id',
            restruct.molecule.texts.keyOf(this.item),
          );
          path.translateAbs(shiftX, shiftY + (styles.shiftY || 0));
          row.push(path);
          shiftX += path.getBBox().width;
        });
      }

      this.paths.push(row);

      const { p0, p1 } = this.getRelBox([row]);
      shiftY += Math.abs(Vec2.diff(p0, p1).y);
    });

    this.item.setPos(this.getReferencePoints());

    render.ctab.addReObjectPath(
      LayerMap.data,
      this.visel,
      flatten(this.paths),
      null,
      true,
    );
  }

  getStylesFromTextNode(
    textNode: SerializedTextNode,
    options: any,
  ): Record<string, any> {
    const styles: Record<string, any> = {};
    const format = textNode.format || 0;

    // Parse font-size from style string
    let customFontSize: number | null = null;
    if (textNode.style) {
      const fontSizeMatch = textNode.style.match(/font-size:\s*(\d+)px/);
      if (fontSizeMatch) {
        customFontSize = parseInt(fontSizeMatch[1], 10);
        styles['font-size'] = customFontSize + 'px';
      }
    }

    if (format & IS_BOLD) {
      styles['font-weight'] = 'bold';
    }

    if (format & IS_ITALIC) {
      styles['font-style'] = 'italic';
    }

    const fontsz = customFontSize ?? options.fontszInPx;
    const fontszsub = (customFontSize ?? options.fontszsubInPx) * 0.5;

    if (format & IS_SUBSCRIPT) {
      styles['font-size'] = fontszsub + 'px';
      styles.shiftY = fontsz / 4;
    }

    if (format & IS_SUPERSCRIPT) {
      styles['font-size'] = fontszsub + 'px';
      styles.shiftY = -fontsz / 3;
    }

    return styles;
  }
}

export default ReText;
