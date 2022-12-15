import { selectStereoFlags } from '../../selectStereoFlags'

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

interface Selection {
  atoms?: Array<number>
  bonds?: Array<number>
  enhancedFlags?: Array<number>
  rxnPluses?: Array<number>
  rxnArrows?: Array<number>
}

export function chooseItems(tool, ci?: any) {
  if (arguments.length === 0) {
    return tool._selection // eslint-disable-line
  }

  let ReStruct = tool.render.ctab

  tool._selection = null // eslint-disable-line
  if (ci === 'all') {
    // TODO: better way will be tool.struct()
    ci = structObjects.reduce((res, key) => {
      res[key] = Array.from(ReStruct[key].keys())
      return res
    }, {})
  }

  if (ci === 'descriptors') {
    ReStruct = tool.render.ctab
    ci = { sgroupData: Array.from(ReStruct.sgroupData.keys()) }
  }

  if (ci) {
    const res: Selection = {}

    Object.keys(ci).forEach((key) => {
      if (ci[key].length > 0)
        // TODO: deep merge
        res[key] = ci[key].slice()
    })

    if (Object.keys(res).length !== 0) {
      tool._selection = res // eslint-disable-line
    }
    const stereoFlags = selectStereoFlags(
      tool.struct().atoms,
      tool.explicitSelected().atoms
    )
    if (stereoFlags.length !== 0) {
      tool._selection && tool._selection.enhancedFlags
        ? (tool._selection.enhancedFlags = Array.from(
            new Set([...tool._selection.enhancedFlags, ...stereoFlags])
          ))
        : (res.enhancedFlags = stereoFlags)
    }
  }

  tool.render.ctab.setSelection(tool._selection) // eslint-disable-line
  tool.event.selectionChange.dispatch(tool._selection) // eslint-disable-line

  tool.render.update()
  return tool._selection // eslint-disable-line
}
