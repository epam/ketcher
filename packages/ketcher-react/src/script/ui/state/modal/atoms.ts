import { Action, Atom, fromAtomsAttrs } from 'ketcher-core'
import { fromElement } from '../../data/convert/structconv'

export function isAtomsArray(selectedElements: Atom | Atom[]): boolean {
  return (
    Array.isArray(selectedElements) &&
    selectedElements?.every((element) => element instanceof Atom)
  )
}

type somePropertiesOfAtom = Partial<{
  [attribute in keyof Atom]: string | number | boolean
}>

// If all atoms have the same value, then this value is used as a baseline
// otherwise it is set to an empty string. Afterwards, empty string denotes that the value is not changed
export function generateCommonProperties(
  selectedElements: Atom[]
): somePropertiesOfAtom {
  const normalizedAtom = fromElement(selectedElements[0])
  const properties = Object.getOwnPropertyNames(normalizedAtom)
  const resultAtomAttributes: somePropertiesOfAtom = {}
  properties.forEach((property) => {
    const uniqueValues = new Set()
    selectedElements.forEach((element) => {
      uniqueValues.add(element[property])
    })
    const allAtomsHaveTheSameValue = uniqueValues.size === 1
    if (allAtomsHaveTheSameValue) {
      resultAtomAttributes[property] = normalizedAtom[property]
    } else {
      resultAtomAttributes[property] = ''
    }
  })
  return resultAtomAttributes
}

export function updateOnlyChangedProperties(atomId, userChangedAtom, molecule) {
  const unchangedAtom = molecule.atoms.get(atomId)
  const updatedKeys = Object.getOwnPropertyNames(userChangedAtom).filter(
    (key) => userChangedAtom[key] !== ''
  )
  return Object.getOwnPropertyNames(unchangedAtom).reduce(
    (updatedAtom, key) => {
      const isPropertyChanged = updatedKeys.includes(key)
      if (isPropertyChanged) {
        updatedAtom[key] = userChangedAtom[key]
        if (key === 'charge') {
          updatedAtom[key] = Number(updatedAtom[key])
        }
      } else {
        updatedAtom[key] = unchangedAtom[key]
      }
      return updatedAtom
    },
    {}
  )
}

export function updateSelectedAtoms({ selection, changeAtomPromise, editor }) {
  const action = new Action()
  const struct = editor.render.ctab
  const { molecule } = struct
  if (selection?.atoms) {
    const selectionAtoms = selection.atoms
    Promise.resolve(changeAtomPromise)
      .then((userChangedAtom) => {
        // TODO: deep compare to not produce dummy, e.g.
        // atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
        selectionAtoms.forEach((atomId) => {
          const atomWithChangedProperties = updateOnlyChangedProperties(
            atomId,
            userChangedAtom,
            molecule
          )
          action.mergeWith(
            fromAtomsAttrs(struct, atomId, atomWithChangedProperties, false)
          )
        })
        editor.update(action)
      })
      .catch(() => null)
  }
}
