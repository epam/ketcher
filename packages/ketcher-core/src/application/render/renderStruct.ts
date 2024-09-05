import { Struct, Vec2 } from 'domain/entities';
import { isEqual } from 'lodash';
import { Render } from './raphaelRender';
import ReAtom from './restruct/reatom';
import { Coordinates } from 'application/editor';

/**
 * Is used to improve search and opening tab performance in Template Dialog
 * Rendering a lot of structures causes great delay
 */
const renderCache = new Map();
let previousOptions: any;
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
    options: any = {},
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

  static render(
    wrapperElement: HTMLElement | null,
    struct: Struct | null,
    options: any = {},
  ) {
    if (wrapperElement && struct) {
      const { cachePrefix = '', needCache = true } = options;
      const cacheKey = `${cachePrefix}${struct.name}`;

      if (!isEqual(previousOptions, options)) {
        renderCache.clear();
        previousOptions = options;
      }

      if (renderCache.has(cacheKey) && needCache) {
        wrapperElement.innerHTML = renderCache.get(cacheKey);
        return;
      }

      const preparedStruct = this.prepareStruct(struct.clone());
      preparedStruct.initHalfBonds();
      preparedStruct.initNeighbors();
      preparedStruct.setImplicitHydrogen();
      preparedStruct.markFragments();
      const structureSize = preparedStruct.getCoordBoundingBox();
      const structureSizeInPixels = Coordinates.modelToCanvas(
        new Vec2(
          structureSize.max.x - structureSize.min.x,
          structureSize.max.y - structureSize.min.y,
        ),
      );
      const wrapperElementBoundingRect = wrapperElement.getBoundingClientRect();
      const isStructureLessThanWrapper =
        structureSizeInPixels.x < wrapperElementBoundingRect.width &&
        structureSizeInPixels.y < wrapperElementBoundingRect.height;
      const structureRectangleSize = Math.max(
        structureSizeInPixels.x,
        structureSizeInPixels.y,
      );
      const svgSize = isStructureLessThanWrapper
        ? Math.min(
            structureRectangleSize,
            wrapperElementBoundingRect.width,
            wrapperElementBoundingRect.height,
          )
        : undefined;
      const extendedOptions = {
        autoScale: true,
        ...options,
        width: svgSize,
        height: svgSize,
      };

      if (window.isPolymerEditorTurnedOn) {
        extendedOptions.fontsz = 40;
        extendedOptions.fontszsub = 30;
      }

      const rnd = new Render(wrapperElement, extendedOptions);

      rnd.setMolecule(preparedStruct);
      this.removeSmallAttachmentPointLabelsInModal(rnd, options);

      if (needCache) {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const attachmentPointAtom = struct.atoms.get(attachmentPoint.atomId)!;
      attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
      const rgroupAttachmentPoint =
        attachmentPoint.convertToRGroupAttachmentPointForDisplayPurpose(
          attachmentPoint.atomId,
        );
      struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
    });
  });
}
