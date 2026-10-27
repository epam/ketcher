import { BaseRenderer } from './BaseRenderer';
import type { RGroupDrawingEntity } from 'domain/entities/RGroupDrawingEntity';
import { Box2Abs } from 'domain/entities/box2Abs';
import { Vec2 } from 'domain/entities/vec2';
import { Coordinates } from 'application/editor/shared/coordinates';
import { editorEvents } from 'application/editor/editorEvents';
import { rGroupLogicToString } from 'domain/helpers/rGroupLogic';
import type { D3SvgElementSelection } from 'application/render/types';
import { SELECTION_COLOR } from './constants';
import type { Atom } from 'domain/entities/CoreAtom';

interface RGroupRendererOptions {
  canvas?: D3SvgElementSelection<SVGGElement, void>;
  atomPositions?: Map<Atom, Vec2>;
  atomLabelBoxes?: Map<Atom, Box2Abs[]>;
}

/** Brackets and logic for a definition; its atoms/bonds retain their own renderers. */
export class RGroupRenderer extends BaseRenderer {
  private geometryKey?: string;
  private selectionElement?: D3SvgElementSelection<SVGRectElement, void>;

  constructor(
    public readonly rgroupDrawingEntity: RGroupDrawingEntity,
    private readonly options: RGroupRendererOptions = {},
  ) {
    super(rgroupDrawingEntity);
    if (options.canvas) this.canvas = options.canvas;
    rgroupDrawingEntity.setBaseRenderer(this as BaseRenderer);
  }

  private getBracketBox(): Box2Abs | undefined {
    let box: Box2Abs | undefined;
    this.rgroupDrawingEntity.atoms.forEach((atom) => {
      const position = Coordinates.modelToCanvas(
        this.options.atomPositions?.get(atom) ?? atom.position,
      );
      let atomBox = new Box2Abs(position, position);
      atom.renderer?.attachmentPointBoxes?.forEach((box) => {
        atomBox = Box2Abs.union(atomBox, box.translate(position));
      });
      this.options.atomLabelBoxes?.get(atom)?.forEach((labelBox) => {
        atomBox = Box2Abs.union(atomBox, labelBox.translate(position));
      });
      atom.renderer?.labelBBoxes.forEach((labelBox) => {
        atomBox = Box2Abs.union(
          atomBox,
          Box2Abs.fromRelBox(labelBox).translate(position),
        );
      });
      box = box ? Box2Abs.union(box, atomBox) : atomBox;
    });
    // Same model-space border and bracket padding as ReRGroup.
    const padding = Coordinates.modelToCanvas(new Vec2(0.35, 0.55));
    return box?.extend(padding, padding);
  }

  public refresh(): void {
    const box = this.getBracketBox();
    const { rgroupId, rgroup } = this.rgroupDrawingEntity;
    const key = `${box?.toString()}:${rGroupLogicToString(rgroupId, rgroup)}`;
    if (key !== this.geometryKey || !this.rootElement) {
      this.remove();
      this.geometryKey = key;
      this.show();
    }
    this.drawSelection();
    this.redrawHover();
  }

  public show(): void {
    const box = this.getBracketBox();
    if (!box) return;
    const { rgroupId, rgroup } = this.rgroupDrawingEntity;
    const fontSize = Math.ceil(1.9 * (this.editorSettings.macroModeScale / 6));
    const middleY = (box.p0.y + box.p1.y) / 2;
    const bracketWidth = Math.min(
      this.editorSettings.macroModeScale * 0.25,
      box.sz().x * 0.3,
    );

    this.rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('data-testid', 'r-group-definition')
      .attr('data-rgroup-id', rgroupId)
      .attr('pointer-events', 'none')
      .on('mouseover', (event) =>
        editorEvents.mouseOverDrawingEntity.dispatch(event),
      )
      .on('mouseleave', (event) =>
        editorEvents.mouseLeaveDrawingEntity.dispatch(event),
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    [box.p0.x, box.p1.x].forEach((x, index) => {
      const innerX = x + (index === 0 ? bracketWidth : -bracketWidth);
      const path = `M${innerX},${box.p0.y}H${x}V${box.p1.y}H${innerX}`;
      this.rootElement
        ?.append('path')
        .attr('d', path)
        .attr('data-testid', 'r-group-bracket-hit-area')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .attr('pointer-events', 'stroke');
      this.rootElement
        ?.append('path')
        .attr('d', path)
        .attr('data-testid', 'r-group-bracket')
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', 1);
    });

    this.rootElement
      .append('text')
      .attr('x', box.p0.x - 2)
      .attr('y', middleY)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-family', 'Arial')
      .attr('font-size', fontSize * 1.2)
      .attr('pointer-events', 'all')
      .attr('data-testid', 'r-group-label')
      .text(`R${rgroupId}=`);

    const lines = rGroupLogicToString(rgroupId, rgroup).split('\n');
    const logic = this.rootElement
      .append('text')
      .attr('x', box.p0.x - 12)
      .attr('y', middleY + fontSize * 1.2)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Arial')
      .attr('font-size', fontSize * 0.7)
      .attr('pointer-events', 'all')
      .attr('data-testid', 'r-group-logic');
    lines.forEach((line, index) => {
      logic
        .append('tspan')
        .attr('x', box.p0.x - 12)
        .attr('dy', index === 0 ? 0 : '1.2em')
        .text(line);
    });

    // The contour covers the definition but never intercepts its atoms or bonds.
    const bounds = this.rootElement.node()?.getBBox();
    if (!bounds) return;
    this.selectionElement = this.rootElement
      .insert('rect', ':first-child')
      .attr('x', bounds.x - 4)
      .attr('y', bounds.y - 4)
      .attr('width', bounds.width + 8)
      .attr('height', bounds.height + 8)
      .attr('rx', 4)
      .attr('fill', 'none')
      .attr('pointer-events', 'none');
  }

  public drawSelection(): void {
    const atoms = this.rgroupDrawingEntity.atoms;
    this.selectionElement
      ?.attr(
        'fill',
        atoms.length && atoms.every((atom) => atom.selected)
          ? SELECTION_COLOR
          : 'none',
      )
      .attr('fill-opacity', 0.2);
  }

  public moveSelection(): void {
    this.refresh();
  }

  protected appendHover(): void {
    this.selectionElement?.attr('stroke', '#0097a8').attr('stroke-width', 1.2);
  }

  protected removeHover(): void {
    this.selectionElement?.attr('stroke', 'none');
  }

  protected appendHoverAreaElement(): void {
    // Only brackets and labels are hit targets; the structure remains editable.
  }
}
