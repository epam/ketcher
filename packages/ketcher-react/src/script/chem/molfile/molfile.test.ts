import { Struct } from 'ketcher-core'
import common from './common'
import Molfile, { END_V2000 } from './molfile'
import utils from './utils'

describe('parseCTFile', () => {
  let initHalfBondsFn: jest.Mock
  let initNeighborsFn: jest.Mock
  let markFragmentsFn: jest.Mock

  beforeEach(() => {
    initHalfBondsFn = jest.fn()
    initNeighborsFn = jest.fn()
    markFragmentsFn = jest.fn()
  })

  function mockParse(spy: jest.SpyInstance) {
    spy.mockImplementationOnce(
      () =>
        ({
          initHalfBonds: initHalfBondsFn,
          initNeighbors: initNeighborsFn,
          markFragments: markFragmentsFn
        } as any)
    )
  }

  test('RXN', () => {
    const molfileLines = ['$RXN']

    const spy = jest.spyOn(common, 'parseRxn')
    mockParse(spy)

    new Molfile().parseCTFile(molfileLines, false)
    expect(spy).toHaveBeenCalledWith(molfileLines, false)
    expect(initHalfBondsFn).toHaveBeenCalledTimes(1)
    expect(initNeighborsFn).toHaveBeenCalledTimes(1)
    expect(markFragmentsFn).toHaveBeenCalledTimes(1)
  })

  test('Mol', () => {
    const molfileLines = ['']

    const spy = jest.spyOn(common, 'parseMol')
    mockParse(spy)

    new Molfile().parseCTFile(molfileLines)
    expect(spy).toHaveBeenCalledWith(molfileLines)
    expect(initHalfBondsFn).toHaveBeenCalledTimes(1)
    expect(initNeighborsFn).toHaveBeenCalledTimes(1)
    expect(markFragmentsFn).toHaveBeenCalledTimes(1)
  })
})

describe('prepareSGroups', () => {
  // TODO: add tests
})

test('getCTab', () => {
  const molfile = new Molfile()
  molfile.molfile = 'dirty'

  const prepareSpy = jest.spyOn(molfile, 'prepareSGroups')
  prepareSpy.mockImplementationOnce(() => {})

  const writeSpy = jest.spyOn(molfile, 'writeCTab2000')
  writeSpy.mockImplementationOnce(() => {})

  const structMock = ({
    clone: jest.fn()
  } as any) as Struct

  const mapMock = new Map()

  const result = molfile.getCTab(structMock, mapMock)
  expect(result).not.toBe('dirty')

  expect(structMock.clone).toHaveBeenCalledTimes(1)
  expect(prepareSpy).toHaveBeenCalledTimes(1)
  expect(writeSpy).toHaveBeenCalledWith(mapMock)
})

describe('saveMolecule', () => {
  // TODO: add tests
})

test('writeHeader', () => {
  const molfile = new Molfile()

  const fakeDate = new Date(Date.UTC(2021, 2, 14, 5, 0))
  const endMock = ` 31421 8 0`

  const dateSpy = jest.spyOn(global, 'Date' as any)
  dateSpy.mockImplementationOnce(() => fakeDate)

  const writeCRSpy = jest.spyOn(molfile, 'writeCR')
  writeCRSpy.mockImplementationOnce(() => {})

  const writeWhiteSpaceSpy = jest.spyOn(molfile, 'writeWhiteSpace')
  writeWhiteSpaceSpy.mockImplementationOnce(() => {})

  const writeSpy = jest.spyOn(molfile, 'write')
  writeSpy.mockImplementationOnce(() => {})

  molfile.writeHeader()
  expect(writeSpy).toHaveBeenCalledWith('Ketcher')

  expect(writeCRSpy).toHaveBeenCalledTimes(3)
  expect(writeCRSpy).toHaveBeenNthCalledWith(1)
  expect(writeCRSpy).toHaveBeenNthCalledWith(2, `${endMock}${END_V2000}`)
  expect(writeCRSpy).toHaveBeenNthCalledWith(3)

  expect(writeWhiteSpaceSpy).toHaveBeenCalledTimes(2)
  expect(writeWhiteSpaceSpy).toHaveBeenNthCalledWith(1, 2)
  expect(writeWhiteSpaceSpy).toHaveBeenNthCalledWith(2)
})

test('write', () => {
  const molfile = new Molfile()
  molfile.molfile = 'some'

  molfile.write(' string')
  expect(molfile.molfile).toBe('some string')
})

describe('writeCR', () => {
  test('break line', () => {
    const molfile = new Molfile()
    molfile.molfile = 'some'

    molfile.writeCR()
    expect(molfile.molfile).toBe('some\n')
  })

  test('with string', () => {
    const molfile = new Molfile()
    molfile.molfile = 'some'

    molfile.writeCR(' string')
    expect(molfile.molfile).toBe('some string\n')
  })
})

describe('writeWhiteSpace', () => {
  const molfile = new Molfile()
  const spy = jest.spyOn(molfile, 'write')

  beforeEach(() => {
    spy.mockImplementationOnce(() => {})
  })

  test('without args', () => {
    molfile.writeWhiteSpace()
    expect(spy).toHaveBeenCalledWith(' ')
  })

  test('with string', () => {
    molfile.writeWhiteSpace(3)
    expect(spy).toHaveBeenCalledWith('   ')
  })
})

test('writePadded', () => {
  const molfile = new Molfile()

  const writeSpy = jest.spyOn(molfile, 'write')
  writeSpy.mockImplementationOnce(() => {})

  const writeWhiteSpaceSpy = jest.spyOn(molfile, 'writeWhiteSpace')
  writeWhiteSpaceSpy.mockImplementationOnce(() => {})

  const stringMock = 'my string'
  molfile.writePadded(stringMock, stringMock.length + 3)
  expect(writeSpy).toHaveBeenCalledWith(stringMock)
  expect(writeWhiteSpaceSpy).toHaveBeenCalledWith(3)
})

test('writePaddedNumber', () => {
  const molfile = new Molfile()

  const writeSpy = jest.spyOn(molfile, 'write')
  writeSpy.mockImplementationOnce(() => {})

  const writeWhiteSpaceSpy = jest.spyOn(molfile, 'writeWhiteSpace')
  writeWhiteSpaceSpy.mockImplementationOnce(() => {})

  molfile.writePaddedNumber(16, 5)
  expect(writeSpy).toHaveBeenCalledWith('16')
  expect(writeWhiteSpaceSpy).toHaveBeenCalledWith(3)
})

test('writePaddedFloat', () => {
  const molfile = new Molfile()

  const writeSpy = jest.spyOn(molfile, 'write')
  writeSpy.mockImplementationOnce(() => {})

  const paddedNumSpy = jest.spyOn(utils, 'paddedNum')
  paddedNumSpy.mockImplementationOnce(() => {})

  molfile.writePaddedFloat(18, 3, 1)
  expect(writeSpy).toHaveBeenCalledTimes(1)
  expect(paddedNumSpy).toHaveBeenCalledWith(18, 3, 1)
})

describe('writeCTab2000Header', () => {
  // TODO: add tests
})

describe('writeCTab2000', () => {
  // TODO: add tests
})

describe('getAtomLabel', () => {
  test('L', () => {
    const molfile = new Molfile()
    const atomMock = {
      atomList: []
    }
    const result = molfile['getAtomLabel'](atomMock)
    expect(result).toBe('L')
  })

  test('A', () => {
    const molfile = new Molfile()
    const atomMock = {
      pseudo: '1234'
    }
    const result = molfile['getAtomLabel'](atomMock)
    expect(result).toBe('A')
  })

  test('label', () => {
    const molfile = new Molfile()
    const atomMock = {
      alias: 'some',
      label: 'some label'
    }
    const result = molfile['getAtomLabel'](atomMock)
    expect(result).toBe(atomMock.label)
  })

  test('C', () => {
    const molfile = new Molfile()
    const atomMock = {
      label: 'some'
    }
    const result = molfile['getAtomLabel'](atomMock)
    expect(result).toBe('C')
  })

  test('default', () => {
    const molfile = new Molfile()
    const atomMock = {
      label: 'Og'
    }
    const result = molfile['getAtomLabel'](atomMock)
    expect(result).toBe(atomMock.label)
  })
})

describe('writeAtom', () => {
  const molfile = new Molfile()

  const writePaddedFloatSpy = jest.spyOn(molfile, 'writePaddedFloat')
  writePaddedFloatSpy.mockImplementation(() => {})

  const writeWhiteSpaceSpy = jest.spyOn(molfile, 'writeWhiteSpace')
  writeWhiteSpaceSpy.mockImplementation(() => {})

  const writePaddedSpy = jest.spyOn(molfile, 'writePadded')
  writePaddedSpy.mockImplementation(() => {})

  const writePaddedNumberSpy = jest.spyOn(molfile, 'writePaddedNumber')
  writePaddedNumberSpy.mockImplementation(() => {})

  const writeCRSpy = jest.spyOn(molfile, 'writeCR')
  writeCRSpy.mockImplementation(() => {})

  afterEach(() => {
    writePaddedFloatSpy.mockClear()
    writeWhiteSpaceSpy.mockClear()
    writePaddedSpy.mockClear()
    writePaddedNumberSpy.mockClear()
    writeCRSpy.mockClear()
  })

  afterAll(() => {
    writePaddedFloatSpy.mockRestore()
    writeWhiteSpaceSpy.mockRestore()
    writePaddedSpy.mockRestore()
    writePaddedNumberSpy.mockRestore()
    writeCRSpy.mockRestore()
  })

  test('main', () => {
    const atomMock = {
      pp: {
        x: 1,
        y: 2,
        z: 3
      },
      hCount: 4,
      stereoCare: 5,
      explicitValence: 6,
      aam: 7,
      invRet: 8,
      exactChangeFlag: 9
    }

    molfile['writeAtom'](atomMock, 'some label')

    expect(writePaddedFloatSpy).toHaveBeenNthCalledWith(1, atomMock.pp.x, 10, 4)
    expect(writePaddedFloatSpy).toHaveBeenNthCalledWith(
      2,
      -atomMock.pp.y,
      10,
      4
    )
    expect(writePaddedFloatSpy).toHaveBeenNthCalledWith(3, atomMock.pp.z, 10, 4)

    expect(writeWhiteSpaceSpy).toHaveBeenCalledTimes(1)

    expect(writePaddedSpy).toHaveBeenCalledWith('some label', 3)

    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(1, 0, 2)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(2, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(3, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(4, atomMock.hCount, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(
      5,
      atomMock.stereoCare,
      3
    )
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(
      6,
      atomMock.explicitValence,
      3
    )
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(7, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(8, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(9, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(10, atomMock.aam, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(11, atomMock.invRet, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(
      12,
      atomMock.exactChangeFlag,
      3
    )

    expect(writeCRSpy).toHaveBeenCalledTimes(1)
  })

  test('defaults', () => {
    const atomMock = {
      pp: {}
    }

    molfile['writeAtom'](atomMock, 'some label')

    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(4, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(5, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(6, undefined, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(10, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(11, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(12, 0, 3)
  })

  test('explicitValence < 0', () => {
    const atomMock = {
      pp: {},
      explicitValence: -1
    }

    molfile['writeAtom'](atomMock, 'some label')
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(6, 0, 3)
  })

  test('explicitValence == 0', () => {
    const atomMock = {
      pp: {},
      explicitValence: 0
    }

    molfile['writeAtom'](atomMock, 'some label')
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(6, 15, 3)
  })
})

describe('writeBond', () => {
  let molfile: Molfile
  let writePaddedNumberSpy: jest.SpyInstance
  let writePaddedSpy: jest.SpyInstance
  let writeCRSpy: jest.SpyInstance

  beforeEach(() => {
    molfile = new Molfile()

    writePaddedNumberSpy = jest.spyOn(molfile, 'writePaddedNumber')
    writePaddedNumberSpy.mockImplementation(() => {})

    writePaddedSpy = jest.spyOn(molfile, 'writePadded')
    writePaddedSpy.mockImplementation(() => {})

    writeCRSpy = jest.spyOn(molfile, 'writeCR')
    writeCRSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    writePaddedNumberSpy.mockClear()
    writePaddedSpy.mockClear()
    writeCRSpy.mockClear()
  })

  afterAll(() => {
    writePaddedNumberSpy.mockRestore()
    writePaddedSpy.mockRestore()
    writeCRSpy.mockRestore()
  })

  test('main', () => {
    const bondMock = {
      begin: 1,
      end: 2,
      type: 3,
      stereo: 4,
      xxx: 5,
      topology: 6,
      reactingCenterStatus: 7
    }

    molfile.mapping = {
      1: 11,
      2: 22
    }
    molfile['writeBond'](bondMock)

    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(1, 11, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(2, 22, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(3, bondMock.type, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(4, bondMock.stereo, 3)

    expect(writePaddedSpy).toHaveBeenCalledWith(bondMock.xxx, 3)

    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(
      5,
      bondMock.topology,
      3
    )
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(
      6,
      bondMock.reactingCenterStatus,
      3
    )

    expect(writeCRSpy).toHaveBeenCalledTimes(1)
  })

  test('defaults', () => {
    const bondMock = {
      begin: 0,
      end: 0
    }

    molfile.mapping = {
      0: 0
    }
    molfile['writeBond'](bondMock)

    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(4, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(5, 0, 3)
    expect(writePaddedNumberSpy).toHaveBeenNthCalledWith(6, 0, 3)
  })
})

test('writeAtomProps', () => {
  const molfile = new Molfile()

  const writeSpy = jest.spyOn(molfile, 'write')
  writeSpy.mockImplementationOnce(() => {})

  const writePaddedNumberSpy = jest.spyOn(molfile, 'writePaddedNumber')
  writePaddedNumberSpy.mockImplementationOnce(() => {})

  const writeCRSpy = jest.spyOn(molfile, 'writeCR')
  writeCRSpy.mockImplementation(() => {})

  const propsMock = {
    id: 12,
    value: 'some'
  }
  molfile['writeAtomProps'](propsMock)
  expect(writeSpy).toHaveBeenCalledWith('A  ')
  expect(writePaddedNumberSpy).toHaveBeenCalledWith(propsMock.id + 1, 3)
  expect(writeCRSpy).toHaveBeenCalledTimes(2)
  expect(writeCRSpy).toHaveBeenNthCalledWith(2, propsMock.value)

  writeCRSpy.mockRestore()
})

describe('writeAtomPropList', () => {
  // TODO: add tests
})
