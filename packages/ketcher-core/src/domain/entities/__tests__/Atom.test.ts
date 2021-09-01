import { getValueOrDefault, getPseudo, radicalElectrons, Atom } from '../Atom'
import { Vec2 } from '../Vec2'

describe('getValueOrDefault', () => {
  const defaultValue = 'defaultValue'

  it('should return default value if first arg is undefined', () => {
    const testValue = {}
    expect(getValueOrDefault((testValue as any).prop, defaultValue)).toBe(
      defaultValue
    )
  })

  it('should return value if it is defined', () => {
    const testValue = 'testValue'
    expect(getValueOrDefault(testValue, defaultValue)).toBe(testValue)
  })
})

describe('getPseudo', () => {
  it('should return empty string if value is real label of element', () => {
    expect(getPseudo('Lv')).toBe('')
  })

  it('should return empty string if passed value is R#', () => {
    expect(getPseudo('R#')).toBe('')
  })

  it('should return empty string if passed value is L', () => {
    expect(getPseudo('L')).toBe('')
  })

  it('should return empty string if passed value is L#', () => {
    expect(getPseudo('L#')).toBe('')
  })

  it('should return passed label if its not real label and not L, L#, R#', () => {
    expect(getPseudo('pseudo')).toBe('pseudo')
  })
})

describe('radicalElectrons', () => {
  it('should return 1 if passed radical is Douplet (value = 2)', () => {
    expect(radicalElectrons(2)).toBe(1)
  })

  it('should return 2 if passed radical is singlet (value = 1) or triplet (value = 3)', () => {
    expect(radicalElectrons(1)).toBe(2)
    expect(radicalElectrons(3)).toBe(2)
  })

  it('should return 0 if passed radical is different from 1 to 3 value range', () => {
    expect(radicalElectrons(4)).toBe(0)
    expect(radicalElectrons('test')).toBe(0)
    expect(radicalElectrons({})).toBe(0)
    expect(radicalElectrons(null)).toBe(0)
    expect(radicalElectrons(undefined)).toBe(0)
  })
})

describe('Atom', () => {
  const hydrogenParams = {
    aam: 0,
    alias: null,
    atomList: null,
    attpnt: null,
    badConn: false,
    charge: 0,
    exactChangeFlag: 0,
    explicitValence: -1,
    fragment: 0,
    hCount: 0,
    implicitH: 1,
    invRet: 0,
    isotope: 0,
    label: 'H',
    neighbors: [],
    // pp: new Vec2({
    //     x: 16,
    //     y: 3,
    //     z: 0,
    // }),
    pseudo: '',
    radical: 0,
    rglabel: null,
    ringBondCount: 0,
    rxnFragmentType: -1,
    sgs: new Set(),
    stereoLabel: null,
    stereoParity: 0,
    substitutionCount: 0,
    unsaturatedAtom: 0,
    valence: 1
  }

  describe('Atom constructor', () => {
    it('should call Vec2 constructor with pp param if passed atom doesnt have it', () => {
      const atom = new Atom(hydrogenParams)
      expect(atom.pp instanceof Vec2).toBe(true)
    })

    it('should create getter function "pseudo" and able to call it', () => {
      const atom = new Atom(hydrogenParams)
      expect(atom.pseudo).toBe('')
    })
  })

  describe('getAttrHash static function', () => {
    it('should return all attributes for default atom', () => {
      const atom = new Atom(hydrogenParams)
      const attrs = Atom.getAttrHash(atom)
      expect(Object.keys(attrs)).toHaveLength(18)
    })

    it('should return only defined attributes that have in attrsList', () => {
      const hydrogenParamsWithoutLabel = {
        ...hydrogenParams,
        label: undefined
      }
      const atom = new Atom(hydrogenParamsWithoutLabel as any)
      const attrs = Atom.getAttrHash(atom)
      expect(Object.keys(attrs)).toHaveLength(17)
    })

    it('returned object should not be instance of Atom', () => {
      const atom = new Atom(hydrogenParams)
      const attrs = Atom.getAttrHash(atom)
      expect(attrs instanceof Atom).toBe(false)
    })
  })

  describe('attrGetDefault static function', () => {
    it('should return default attr if value is in attrsList', () => {
      expect(Atom.attrGetDefault('label')).toBe('C')
    })

    it('should call console.assert if passed value is not in attrsList', () => {
      console.assert = jest.fn()
      Atom.attrGetDefault('test')
      expect(console.assert).toHaveBeenCalled()
    })
  })

  // describe('clone', () => {
  //   it('', () => {})
  // })
})
