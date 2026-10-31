import type { D3SvgElementSelection } from 'application/render/types';
import { Render } from 'application/render/raphaelRender';
import { Coordinates } from 'application/editor/shared/coordinates';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Struct } from 'domain/entities/struct';
import type { Vec2 } from 'domain/entities/vec2';
import { TransientView } from './TransientView';
import { RGroupRenderer } from '../RGroupRenderer';
import { RGroupDrawingEntity } from 'domain/entities/RGroupDrawingEntity';
import type { RGroupDefinitionMembers } from 'domain/helpers/rGroupDefinitions';
import type { Atom } from 'domain/entities/CoreAtom';
import type { Box2Abs } from 'domain/entities/box2Abs';

export interface PastePreviewViewParams {
  svg: SVGSVGElement;
  anchor: Vec2;
  position: Vec2;
  definitions: Map<number, RGroupDefinitionMembers>;
  existingDefinitions: Map<number, RGroupDefinitionMembers>;
}

export class PastePreviewView extends TransientView {
  public static readonly viewName = 'PastePreviewView';
  private static readonly labelBoxes = new WeakMap<
    SVGSVGElement,
    Map<Atom, Box2Abs[]>
  >();

  /** Render a copy once; cursor movement only translates the resulting SVG. */
  public static createSvg(manager: DrawingEntitiesManager): SVGSVGElement {
    const struct = new Struct();
    const { monomerToAtomIdMap } =
      MacromoleculesConverter.convertDrawingEntitiesToStruct(
        manager,
        struct,
        undefined,
        true,
      );
    // Definitions are drawn separately, using both canvas and incoming fragments.
    struct.rgroups.clear();
    const host = document.createElement('div');
    host.style.cssText =
      'position:fixed;left:-100000px;top:0;width:1px;height:1px;pointer-events:none';
    document.body.append(host);
    let render: Render | undefined;
    try {
      render = new Render(host, {
        ...provideEditorSettings(),
        width: 1,
        height: 1,
        autoScale: false,
      });
      render.setMolecule(struct);
      render.hideScrollbars();
      const svg = render.paper.canvas.cloneNode(true) as SVGSVGElement;
      const boxes = new Map<Atom, Box2Abs[]>();
      const ctab = render.ctab;
      manager.atoms.forEach((atom) => {
        const id = monomerToAtomIdMap
          .get(atom.monomer)
          ?.get(atom.atomIdInMicroMode);
        if (id !== undefined)
          boxes.set(
            atom,
            ctab.atoms.get(id)?.visel.exts.map((box) => box.clone()) ?? [],
          );
        if (id !== undefined) {
          const pointBox = ctab.getRGroupAttachmentPointsVBoxByAtomIds([id]);
          if (pointBox) {
            const position = Coordinates.modelToCanvas(atom.position);
            boxes
              .get(atom)
              ?.push(
                pointBox
                  .transform(Coordinates.modelToCanvas, provideEditorSettings())
                  .translate(position.negated()),
              );
          }
        }
      });
      PastePreviewView.labelBoxes.set(svg, boxes);
      svg.style.overflow = 'visible';
      svg.setAttribute('pointer-events', 'none');
      svg
        .querySelectorAll('[data-testid]')
        .forEach((element) => element.removeAttribute('data-testid'));
      return svg;
    } finally {
      render?.paper.remove();
      host.remove();
    }
  }

  public static show(
    layer: D3SvgElementSelection<SVGGElement, void>,
    {
      svg,
      anchor,
      position,
      definitions,
      existingDefinitions,
    }: PastePreviewViewParams,
  ): void {
    const offset = Coordinates.modelToCanvas(position.sub(anchor));
    const group = layer
      .append('g')
      .attr('data-testid', 'paste-preview')
      .attr('pointer-events', 'none')
      .attr('opacity', 1)
      .attr('transform', `translate(${offset.x},${offset.y})`);
    group.node()?.append(svg.cloneNode(true));
    const modelOffset = position.sub(anchor);
    definitions.forEach((definition, id) => {
      const existing = existingDefinitions.get(id);
      const atomPositions = new Map(
        definition.atoms.map((atom) => [atom, atom.position.add(modelOffset)]),
      );
      const entity = new RGroupDrawingEntity(
        id,
        definition.rgroup,
        [...(existing?.atoms ?? []), ...definition.atoms],
        [],
      );
      const renderer = new RGroupRenderer(entity, {
        canvas: layer,
        atomPositions,
        atomLabelBoxes: PastePreviewView.labelBoxes.get(svg),
      });
      renderer.show();
    });
    // Preview brackets and labels are visual only and must not intercept placement.
    layer
      .selectAll('[data-testid="r-group-definition"]')
      .attr('data-testid', 'paste-preview-r-group-definition')
      .attr('pointer-events', 'none')
      .selectAll('*')
      .attr('pointer-events', 'none');
  }
}
