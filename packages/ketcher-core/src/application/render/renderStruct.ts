import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { isEqual } from 'lodash';
import { getOrThrow } from '../../utilities';
import { Render } from './raphaelRender';
import type { RenderOptions } from './render.types';
import type ReAtom from './restruct/reatom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Scale } from 'domain/helpers';
import { getPolymerPreviewSvgSize } from './polymerPreviewSize';
import { UsageInMacromolecule } from './render.constants';

/**
 * Is used to improve search and opening tab performance in Template Dialog
 * Rendering a lot of structures causes great delay
 */
export type RenderStructOptions = Partial<RenderOptions> & {
  cachePrefix?: string;
  needCache?: boolean;
  wrapperDimensions?: Pick<DOMRectReadOnly, 'width' | 'height'>;
};

const renderCache = new Map<string, string>();
let previousOptions: RenderStructOptions | undefined;
const MONOMER_PREVIEW_PX_PER_ANGSTROM = 45;
const MIN_ATTACHMENT_POINT_SIZE = 8;
const attachmentPointRegExp = /^R[1-8]$/;

export class RenderStruct {
  /**
   * for S-Groups we want to show expanded structure
   * without brackets
   */
  static prepareStruct(struct: Struct) {
    if (struct.sgroups.size > 0) {
      const newStruct = struct.clone();
      convertAllSGroupAttachmentPointsToRGroupAttachmentPoints(newStruct);
      if (!newStruct.sgroups.get(0)?.isSuperatomWithoutLabel) {
        newStruct.sgroups.delete(0);
      }
      return newStruct;
    }
    return struct;
  }

  static removeSmallAttachmentPointLabelsInModal(
    render: Render,
    options: RenderStructOptions = {},
  ) {
    if (!options.labelInMonomerConnectionsModal) {
      return;
    }

    render.ctab.atoms.forEach((atom: ReAtom) => {
      if (!atom.label) {
        return;
      }
      const isAttachmentPointAtom = attachmentPointRegExp.test(atom.label.text);

      if (!isAttachmentPointAtom) {
        return;
      }

      const isSmall =
        atom.label.path.node.getBoundingClientRect().width <
        MIN_ATTACHMENT_POINT_SIZE;

      if (isSmall) {
        atom.label.path.node.remove();
      }
    });
  }

  /**
   * In polymer mode the structure is shown at the bond length of the
   * macromolecules canvas, so the svg has to be as large as the rendered
   * content (labels included) is at that bond length. Otherwise the renderer
   * squeezes the content into a box that was sized from atom coordinates only,
   * and structures with short bonds (e.g. "R1 - CH3") come out tiny.
   * When the content does not fit the wrapper the svg keeps filling the wrapper
   * and the renderer fits the content into it.
   */
  private static fitPolymerSvgToContent(
    render: Render,
    wrapperDimensions: Pick<DOMRectReadOnly, 'width' | 'height'>,
  ) {
    const contentSizeInUnits = render.ctab
      .getVBoxObj()
      .transform(Scale.modelToCanvas, render.options)
      .sz();
    const svgSize = getPolymerPreviewSvgSize({
      contentSizeInUnits,
      unitsPerAngstrom: render.options.microModeScale,
      pxPerAngstrom:
        render.options.usageInMacromolecule ===
        UsageInMacromolecule.MonomerPreview
          ? MONOMER_PREVIEW_PX_PER_ANGSTROM
          : Coordinates.modelToCanvas(new Vec2(1, 0)).x,
      wrapper: wrapperDimensions,
    });

    if (svgSize !== undefined) {
      render.setSize(svgSize, svgSize);
    }
  }

  static render(
    wrapperElement: HTMLElement | null,
    struct: Struct | null,
    options: RenderStructOptions = {},
  ) {
    if (wrapperElement && struct) {
      const {
        cachePrefix = '',
        needCache: shouldCache = true,
        wrapperDimensions,
        ...renderOptions
      } = options;
      const cacheKey = `${cachePrefix}${struct.name}`;

      if (!isEqual(previousOptions, options)) {
        renderCache.clear();
        previousOptions = options;
      }

      const cachedSvg = renderCache.get(cacheKey);

      if (shouldCache && cachedSvg !== undefined) {
        wrapperElement.innerHTML = cachedSvg;
        return;
      }

      const preparedStruct = this.prepareStruct(struct.clone());
      preparedStruct.initHalfBonds();
      preparedStruct.initNeighbors();
      preparedStruct.setImplicitHydrogen();
      preparedStruct.markFragments();

      // Use pre-calculated wrapper dimensions if provided to avoid forced reflow
      // This is critical for batch rendering scenarios (e.g., template tables)
      // where getBoundingClientRect() would be called multiple times per frame
      const wrapperElementBoundingRect = wrapperDimensions || {
        width: wrapperElement.getBoundingClientRect().width,
        height: wrapperElement.getBoundingClientRect().height,
      };
      const extendedOptions: Partial<RenderOptions> = {
        autoScale: true,
        ...renderOptions,
      };

      if (globalThis.isPolymerEditorTurnedOn) {
        extendedOptions.fontsz = 30;
        extendedOptions.fontszsub = 20;
      }

      const rnd = new Render(wrapperElement, extendedOptions);

      if (!globalThis.isPolymerEditorTurnedOn) {
        preparedStruct.rescale();
      }

      rnd.setMolecule(preparedStruct);

      if (globalThis.isPolymerEditorTurnedOn) {
        // Raphael sets overflow:hidden as an inline style on the SVG element,
        // which clips bond strokes at the bounding-box edge and makes them
        // appear thinner than bonds in the interior. Override it so strokes
        // can paint the few pixels beyond the viewBox that they need.
        (rnd.paper.canvas as SVGSVGElement).style.overflow = 'visible';
      }

      if (window.isPolymerEditorTurnedOn) {
        this.fitPolymerSvgToContent(rnd, wrapperElementBoundingRect);
      }

      this.removeSmallAttachmentPointLabelsInModal(rnd, options);

      if (shouldCache) {
        renderCache.set(cacheKey, rnd.clientArea.innerHTML);
      }
    }
  }
}

/**
 * Why?
 * We need somehow display sgroup attachment points (tooltips, preview, templates),
 * But due to current rendering approach for sgroups (ungrouping sgroups)
 * - we have to use RGroup attachment points on atoms for this purposes
 */
function convertAllSGroupAttachmentPointsToRGroupAttachmentPoints(
  struct: Struct,
) {
  struct.sgroups.forEach((sgroup) => {
    if (sgroup.isSuperatomWithoutLabel) {
      return;
    }

    sgroup.getAttachmentPoints().forEach((attachmentPoint) => {
      const attachmentPointAtom = getOrThrow(
        struct.atoms,
        attachmentPoint.atomId,
        `Atom with id ${attachmentPoint.atomId} not found in struct while converting sgroup attachment points`,
      );
      attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
      const rgroupAttachmentPoint =
        attachmentPoint.convertToRGroupAttachmentPointForDisplayPurpose(
          attachmentPoint.atomId,
        );
      struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
    });
  });
}
