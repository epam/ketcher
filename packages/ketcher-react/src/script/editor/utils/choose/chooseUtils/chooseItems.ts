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

export interface Self {
  event: {
    chosenElementsChange: any
    selectionChange: any
  }
  render: { ctab: any; update: () => void }
  _selection: any
  _chosenElements: any
  struct(): { atoms: any }
  explicitSelected(): { atoms: any }
}

export function getChosenItems(self: Self) {
  return self._selection // eslint-disable-line
}

export function chooseItems(self: Self, ci?: any) {
  let ReStruct = self.render.ctab

  self._selection = null // eslint-disable-line
  if (ci === 'all') {
    // TODO: better way will be self.struct()
    ci = structObjects.reduce((res, key) => {
      res[key] = Array.from(ReStruct[key].keys())
      return res
    }, {})
  }

  if (ci === 'descriptors') {
    ReStruct = self.render.ctab
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
      self._selection = res // eslint-disable-line
    }
    const stereoFlags = selectStereoFlags(
      self.struct().atoms,
      self.explicitSelected().atoms
    )
    if (stereoFlags.length !== 0) {
      self._selection && self._selection.enhancedFlags
        ? (self._selection.enhancedFlags = Array.from(
            new Set([...self._selection.enhancedFlags, ...stereoFlags])
          ))
        : (res.enhancedFlags = stereoFlags)
    }
  }

  self.render.ctab.setSelection(self._selection) // eslint-disable-line
  self.event.selectionChange.dispatch(self._selection) // eslint-disable-line
  self.event.chosenElementsChange.dispatch(self._chosenElements)
  console.log('self.event.chosenElementsChange.dispatch(self._selection)')

  self.render.update()
  return self._selection // eslint-disable-line
}
