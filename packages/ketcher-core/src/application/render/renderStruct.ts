import { Struct } from 'domain/entities';
import { isEqual } from 'lodash';
import { Render } from './raphaelRender';
import ReAtom from './restruct/reatom';

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
      newStruct.sgroups.delete(0);
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
    el: HTMLElement | null,
    struct: Struct | null,
    options: any = {},
  ) {
    if (el && struct) {
      const { cachePrefix = '', needCache = true } = options;
      const cacheKey = `${cachePrefix}${struct.name}`;

      if (!isEqual(previousOptions, options)) {
        renderCache.clear();
        previousOptions = options;
      }

      if (renderCache.has(cacheKey) && needCache) {
        el.innerHTML = renderCache.get(cacheKey);
        return;
      }

      const preparedStruct = this.prepareStruct(struct);
      preparedStruct.initHalfBonds();
      preparedStruct.initNeighbors();
      preparedStruct.setImplicitHydrogen();
      preparedStruct.markFragments();

      const rnd = new Render(el, {
        autoScale: true,
        ...options,
      });

      preparedStruct.rescale();
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
