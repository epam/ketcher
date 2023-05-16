// @ts-nocheck
import { RnaMonomerSection } from 'components/rna/RnaMonomerSection'
import { MonomerList } from './monomerLibraryList'
import { SdfSerializer } from 'ketcher-core'
import monomersData from '../../monomers.sdf'


const sdfSerializer = new SdfSerializer()
const data = sdfSerializer.deserialize(monomersData)

const colors = {
  colorA: ['#CCCBD6', '#B8BBCC'],
  colorCM: ['#FFE34C', '#FFD700'],
  colorDQ: ['#AD4551', '#AB0014'],
  colorEN: ['#93F5F5', '#00F0F0'],
  colorFY: ['#5656BF', '#2626BF'],
  colorGX: ['#E1E6ED', '#CAD3E0'],
  colorH: ['#BFC9FF', '#99AAFF'],
  colorILV: ['#50E576', '#00D936'],
  colorKR: ['#365CFF', '#002CEB'],
  colorP: ['#F2C5B6', '#FFA98C'],
  colorST: ['#FFC44C', '#FFAA00'],
  colorW: ['#99458B', '#7F006B']
}

const colorMap = {
  A: colors.colorA,
  C: colors.colorCM,
  M: colors.colorCM,
  D: colors.colorDQ,
  Q: colors.colorDQ,
  E: colors.colorEN,
  N: colors.colorEN,
  F: colors.colorFY,
  Y: colors.colorFY,
  G: colors.colorGX,
  X: colors.colorGX,
  H: colors.colorH,
  I: colors.colorILV,
  L: colors.colorILV,
  V: colors.colorILV,
  K: colors.colorKR,
  R: colors.colorKR,
  P: colors.colorP,
  S: colors.colorST,
  T: colors.colorST,
  W: colors.colorW
}

const getColor = (code) => {
  if (Object.hasOwn(colorMap, code)) {
    return colorMap[code]
  }
  return colorMap.A
}

const getResult = (type = 'PEPTIDE', group = false) => {
  const favorites = JSON.parse(localStorage.getItem('library') || '[]')
  const favoriteIds = favorites.reduce((a, c) => {
    a[c.props.Name] = true
    return a
  }, {})
  const filterType = m => m.props.MonomerType === type
  const filterFavorites = m => !!favoriteIds[m.props.Name]
  const filterFunction = type === 'FAVORITES' ? filterFavorites : filterType
  const preparedData = data.filter(filterFunction).reduce((a, c) => {
  const code = c.props.MonomerNaturalAnalogCode
      if (!a[code]) {
          a[code] = []
      }
      if (!group || code === group) {
        a[code].push({ label: c.props.MonomerName, struct: c.struct, props: c.props })
      }
      return a
  }, {})
  const result = Object.keys(preparedData).sort().reduce((a, c, i) => {
    const res: {
      groupTitle: string,
      groupItems: {
        label: string,
        colorScheme: string[]
        struct: any
      }[]
    } = {
      groupTitle: c,
      groupItems: []
    }
    preparedData[c].forEach((item: {label: string, struct: any}) => {
      if (favoriteIds[item.props.Name]) {
        item.favorite = true
      }
      res.groupItems.push({
        ...item,
        colorScheme: getColor(item.props.MonomerNaturalAnalogCode),
        props: {...item.props}
      })
    })
    // @ts-ignore
    a.push(res)
    return a
  }, [])
  return result
}

export const tabsContent = [
  {
    caption: '★',
    component: MonomerList,
    props: {
      list: () => getResult('FAVORITES'),
      onItemClick: (item) => {
        const event = new Event('loadTemplate')
        // @ts-ignore
        event.struct = item.struct
        window.dispatchEvent(event)
        console.log('callback for monomer item', item)
      }
    }
  },
  {
    caption: 'Peptides',
    component: MonomerList,
    props: {
      list: () => getResult('PEPTIDE'),
      onItemClick: (item) => {
        const event = new Event('loadTemplate')
        // @ts-ignore
        event.struct = item.struct
        window.dispatchEvent(event)
        console.log('callback for monomer item', item)
      }
    }
  },
  {
    caption: 'RNA',
    component: RnaMonomerSection,
    props: {
      items: {
        Nucleotide: () => [
          {
            groupItems: [
              {
                label: 'A',
                monomers: {
                  Sugar: 'R',
                  Nucleobase: 'A',
                  Phosphate: 'P'
                }
              },
              {
                label: 'C',
                monomers: {
                  Sugar: 'R',
                  Nucleobase: 'C',
                  Phosphate: 'P'
                }
              },
              {
                label: 'G',
                monomers: {
                  Sugar: 'R',
                  Nucleobase: 'G',
                  Phosphate: 'P'
                }
              },
              {
                label: 'T',
                monomers: {
                  Sugar: 'R',
                  Nucleobase: 'T',
                  Phosphate: 'P'
                }
              },
              {
                label: 'U',
                monomers: {
                  Sugar: 'R',
                  Nucleobase: 'U',
                  Phosphate: 'P'
                }
              }
            ],
            groupTitle: 'Nucleotides'
          }
        ],
        Nucleobase: () => getResult('RNA', 'A'),
        Sugar: () => getResult('RNA', 'R'),
        Phosphate: () => getResult('RNA', 'P')
      },
      selectItem: (item) => console.log(item)
    }
  },
  {
    caption: 'CHEM',
    component: MonomerList,
    props: {
      list: () => getResult('CHEM'),
      onItemClick: (item) => {
        const event = new Event('loadTemplate')
        // @ts-ignore
        event.struct = item.struct
        window.dispatchEvent(event)
        console.log('callback for monomer item', item)
      }
    }
  }
]
