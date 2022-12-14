import { Render } from 'ketcher-core'

interface ChoosenItems {
  atoms?: Array<number>
  bonds?: Array<number>
  enhancedFlags?: Array<number>
  rxnPluses?: Array<number>
  rxnArrows?: Array<number>
  sgroupData?: Array<number>
}

const structObjects = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects',
  'texts'
]

// export function returnChosenItem() {
//   console.log('TODO: return chosen item')
// }

function chooseAllItems(items, reStruct): ChoosenItems {
  return items.reduce((result, key) => {
    result[key] = Array.from(reStruct[key].keys())
    return result
  }, {})
}

function chooseSGroupData(reStruct): ChoosenItems {
  return { sgroupData: Array.from(reStruct.sgroupData.keys()) }
}

function chooseClosestItem(items, reStruct): ChoosenItems {
  const result: Selection = {}
  let selection: Selection = {}

  Object.keys(items).forEach((key) => {
    if (items[key].length > 0)
      // TODO: deep merge
      result[key] = items[key].slice()
  })

  if (Object.keys(result).length !== 0) {
    selection = result // eslint-disable-line
  }
  const stereoFlags = selectStereoFlagsIfNecessary(
    reStruct().atoms,
    explicitSelected().atoms
  )
  if (stereoFlags.length !== 0) {
    selection && selection.enhancedFlags
      ? (selection.enhancedFlags = Array.from(
          new Set([...selection.enhancedFlags, ...stereoFlags])
        ))
      : (result.enhancedFlags = stereoFlags)
  }

  return result
}

export function chooseItems(closestItems: any, struct: any): ChoosenItems {
  // todo:     this._selection = null // eslint-disable-line

  if (closestItems === 'all') {
    return chooseAllItems(structObjects, struct)
  }

  if (closestItems === 'descriptors') {
    return chooseSGroupData(struct)
  }

  if (closestItems) {
    return chooseClosestItem()
  }

  return {}
}
