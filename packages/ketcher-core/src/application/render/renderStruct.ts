import { Struct } from 'domain/entities';
import { Render } from './raphaelRender';

/**
 * Is used to improve search and opening tab performance in Template Dialog
 * Rendering a lot of structures causes great delay
 */
const renderCache = new Map();

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

  static render(
    el: HTMLElement | null,
    struct: Struct | null,
    options: any = {}
  ) {
    if (el && struct) {
      const { cachePrefix = '', needCache = true } = options;
      const cacheKey = `${cachePrefix}${struct.name}`;
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
  struct: Struct
) {
  struct.sgroups.forEach((sgroup) => {
    sgroup.getAttachmentPoints().forEach((attachmentPoint) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const attachmentPointAtom = struct.atoms.get(attachmentPoint.atomId)!;
      attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
    });
  });
}
