import { Render, Struct } from 'ketcher-core'

/**
 * Is used to improve search and opening tab performance in Template Dialog
 * Rendering a lot of structures causes great delay
 */
const renderCache = new Map()

export class RenderStruct {
  /**
   * for S-Groups we want to show expanded structure
   * without brackets
   */
  static prepareStruct(struct: Struct) {
    if (struct.sgroups.size > 0) {
      const newStruct = struct.clone()
      newStruct.sgroups.delete(0)
      return newStruct
    }
    return struct
  }

  static render(
    el: HTMLElement | null,
    struct: Struct | null,
    options: any = {}
  ) {
    if (el && struct) {
      const { cachePrefix = '' } = options
      const cacheKey = `${cachePrefix}${struct.name}`
      if (renderCache.has(cacheKey)) {
        el.innerHTML = renderCache.get(cacheKey)
        return
      }
      const preparedStruct = this.prepareStruct(struct)
      preparedStruct.initHalfBonds()
      preparedStruct.initNeighbors()
      preparedStruct.setImplicitHydrogen()
      preparedStruct.markFragments()
      const rnd = new Render(el, {
        autoScale: true,
        ...options
      })
      rnd.setMolecule(preparedStruct)
      rnd.update(true, options.viewSz)
      renderCache.set(cacheKey, rnd.clientArea.innerHTML)
    }
  }
}
