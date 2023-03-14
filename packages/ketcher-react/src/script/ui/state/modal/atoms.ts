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

function castAtomPropToType(property, value) {
  const typesMapping = {
    charge: Number,
    exactChangeFlag: Number,
    unsaturatedAtom: Number
  }
  if (typesMapping[property]) {
    return typesMapping[property](value)
  }
  return value
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
        updatedAtom[key] = castAtomPropToType(key, userChangedAtom[key])
      } else {
        updatedAtom[key] = unchangedAtom[key]
      }
      return updatedAtom
    },
    {}
  )
}

export function updateSelectedAtoms({
  atoms,
  changeAtomPromise,
  editor
}: {
  atoms: number[]
  editor
  changeAtomPromise: Promise<Atom>
}) {
  const action = new Action()
  const struct = editor.render.ctab
  const { molecule } = struct
  if (atoms) {
    Promise.resolve(changeAtomPromise)
      .then((userChangedAtom) => {
        // TODO: deep compare to not produce dummy, e.g.
        // atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
        atoms.forEach((atomId) => {
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
