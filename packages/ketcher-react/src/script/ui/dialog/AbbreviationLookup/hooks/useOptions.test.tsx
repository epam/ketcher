import { useOptions } from './useOptions'
import { renderHook } from '@testing-library/react'
import { Element } from 'ketcher-core'
import { AbbreviationType } from '../AbbreviationLookup.types'

jest.mock('react-redux', () => {
  return {
    useSelector: (fn) => fn()
  }
})

const ELEMENT: Element = {
  number: 6,
  label: 'C',
  period: 2,
  group: 4,
  title: 'Carbon',
  state: 'solid',
  origin: 'primordial',
  type: 'other-nonmetal',
  mass: 12.011
}
jest.mock('ketcher-core', () => {
  return {
    Elements: {
      getAll: () => [ELEMENT]
    }
  }
})

const FUNCTIONAL_GROUP = {
  props: {},
  struct: { abbreviation: 'FG', name: 'Function Group' }
}
jest.mock('../../../state/functionalGroups/selectors', () => {
  return {
    functionalGroupsSelector: () => [FUNCTIONAL_GROUP, FUNCTIONAL_GROUP]
  }
})

const TEMPLATE = {
  props: {},
  struct: { abbreviation: 'TMPL', name: 'Template' }
}
jest.mock('../../../state/templates/selectors', () => {
  return {
    templatesLibSelector: () => [TEMPLATE, TEMPLATE]
  }
})

const SALT_AND_SOLVENT = {
  props: {},
  struct: { abbreviation: 'SaS', name: 'Salts And Solvents' }
}
jest.mock('../../../state/saltsAndSolvents/selectors', () => {
  return {
    saltsAndSolventsSelector: () => [SALT_AND_SOLVENT]
  }
})

describe('useOptions', () => {
  it('Should collect items for options from different sources and remove duplicates', () => {
    const { result } = renderHook(() => useOptions())
    expect(result.current).toHaveLength(4)
  })

  it('Should contain Element', () => {
    const { result } = renderHook(() => useOptions())
    expect(
      result.current.filter(
        (option) => option.type === AbbreviationType.Element
      )
    ).toHaveLength(1)
  })

  it('Should contain Functional Group', () => {
    const { result } = renderHook(() => useOptions())
    expect(
      result.current.filter(
        (option) =>
          option.type === AbbreviationType.Template &&
          option.loweredName === FUNCTIONAL_GROUP.struct.name.toLowerCase()
      )
    ).toHaveLength(1)
  })

  it('Should contain Template', () => {
    const { result } = renderHook(() => useOptions())
    expect(
      result.current.filter(
        (option) =>
          option.type === AbbreviationType.Template &&
          option.loweredName === TEMPLATE.struct.name.toLowerCase()
      )
    ).toHaveLength(1)
  })

  it('Should contain SaltAndSolvent', () => {
    const { result } = renderHook(() => useOptions())
    expect(
      result.current.filter(
        (option) =>
          option.type === AbbreviationType.Template &&
          option.loweredName === SALT_AND_SOLVENT.struct.name.toLowerCase()
      )
    ).toHaveLength(1)
  })
})
