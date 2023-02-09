import { RnaMonomerSection } from 'components/rna/RnaMonomerSection'
import { MonomerList } from './monomerLibraryList'

export const tabsContent = [
  {
    caption: '✩',
    component: () => <></>
  },
  {
    caption: 'Peptides',
    component: MonomerList,
    props: {
      list: [
        {
          groupItems: [
            { label: 'A', colorScheme: '#A0A0FF' },
            { label: '1Nal' },
            { label: '2Nal' },
            { label: 'Ala_tBu' },
            { label: 'bAla' },
            { label: 'Cha' },
            { label: 'Cya' },
            { label: 'D-1Nal' },
            { label: 'D-2Nal' },
            { label: 'D-2Thi' },
            { label: 'D-2Cha' },
            { label: 'dA' },
            { label: 'Dha' },
            { label: 'MeA' },
            { label: 'Thi' },
            { label: 'Tza' }
          ],
          groupTitle: 'A'
        },
        {
          groupItems: [
            { label: 'C', colorScheme: '#FFEB3B' },
            { label: 'Cys_Bn', colorScheme: '#FFEB3B' },
            { label: 'Cys_Me', colorScheme: '#FFEB3B' },
            { label: 'Cys_SE', colorScheme: '#FFEB3B' },
            { label: 'dC', colorScheme: '#FFEB3B' },
            { label: 'Hcy', colorScheme: '#FFEB3B' },
            { label: 'meC', colorScheme: '#FFEB3B' },
            { label: 'seC', colorScheme: '#FFEB3B' }
          ],
          groupTitle: 'C'
        },
        {
          groupTitle: 'D',
          groupItems: [
            {
              label: 'D',
              colorScheme: '#F44336'
            },
            {
              label: 'Asp_OMe',
              colorScheme: '#F44336'
            },
            {
              label: 'Asp_Ph2NH2',
              colorScheme: '#F44336'
            },
            {
              label: 'dD',
              colorScheme: '#F44336'
            },
            {
              label: 'meD',
              colorScheme: '#F44336'
            }
          ]
        }
      ],
      onItemClick: () => {
        console.log('callback for monomer item')
      }
    }
  },
  {
    caption: 'RNA',
    component: RnaMonomerSection,
    props: {
      items: {
        Nucleotide: [
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
        Nucleobase: [
          {
            groupTitle: 'A',
            groupItems: [
              {
                label: 'A',
                colorScheme: '#5C6BC0'
              },
              {
                label: '2imen2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: '4ime6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'az8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bn6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'br8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c3A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c7A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c7cn7A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c7io7A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c7io7n2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c7pry7A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c7pry7n2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cl2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cl2cyp6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cl8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cpm6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cyh6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cyp6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'e6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'fl2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'impr6n2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'imprn2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'io2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'io7c7A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'm1A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'm2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'm2nprn2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'm62A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'm6A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'mo2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'moprn2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ms2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'n2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'n2br7c7z8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'n8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'nC6n8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'nen2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'o8A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'phen2A',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'tclampA',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'z8A',
                colorScheme: '#5C6BC0'
              }
            ]
          }
        ],
        Sugar: [
          {
            groupItems: [
              {
                label: '*',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'd',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'm',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'r',
                colorScheme: '#5C6BC0'
              },
              {
                label: '25d3r',
                colorScheme: '#5C6BC0'
              },
              {
                label: '25mo3r',
                colorScheme: '#5C6BC0'
              },
              {
                label: '25moe3r',
                colorScheme: '#5C6BC0'
              },
              {
                label: '25r',
                colorScheme: '#5C6BC0'
              },
              {
                label: '5formD',
                colorScheme: '#5C6BC0'
              },
              {
                label: '5R6Rm5cEt',
                colorScheme: '#5C6BC0'
              },
              {
                label: '5R6Sm5cEt',
                colorScheme: '#5C6BC0'
              },
              {
                label: '5S6Rm5cEt',
                colorScheme: '#5C6BC0'
              },
              {
                label: '5S6Sm5cEt',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'acn4d',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'Ae2d',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'afhna',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'afl2Nmc',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ALlna',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'allyl2r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ALmeclna',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ALtrina1',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ALtrina2',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'Am2d',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ana',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'aoe2r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ar',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bcdna',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'Bcm2r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'Bcm3d',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'Bcm3r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'Bcoh4d',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bn2r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bnanc',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bnancm',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bnoe2r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'bu2r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c4d',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'c4m',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'C52r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'C92r',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cena',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'cet',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'ciPr',
                colorScheme: '#5C6BC0'
              },
              {
                label: 'clhna',
                colorScheme: '#5C6BC0'
              }
            ]
          }
        ],
        Phosphate: [
          {
            groupItems: [
              {
                label: '*',
                colorScheme: '#7986CB'
              },
              {
                label: 'p',
                colorScheme: '#7986CB'
              },
              {
                label: '36SS',
                colorScheme: '#7986CB'
              },
              {
                label: 'bnn',
                colorScheme: '#7986CB'
              },
              {
                label: 'bp',
                colorScheme: '#7986CB'
              },
              {
                label: 'cm',
                colorScheme: '#7986CB'
              },
              {
                label: 'cmp',
                colorScheme: '#7986CB'
              },
              {
                label: 'co',
                colorScheme: '#7986CB'
              },
              {
                label: 'en',
                colorScheme: '#7986CB'
              },
              {
                label: 'eop',
                colorScheme: '#7986CB'
              },
              {
                label: 'fl2me',
                colorScheme: '#7986CB'
              },
              {
                label: 'gly',
                colorScheme: '#7986CB'
              },
              {
                label: 'hn',
                colorScheme: '#7986CB'
              },
              {
                label: 'ibun',
                colorScheme: '#7986CB'
              },
              {
                label: 'm2nen',
                colorScheme: '#7986CB'
              },
              {
                label: 'm2np',
                colorScheme: '#7986CB'
              },
              {
                label: 'me',
                colorScheme: '#7986CB'
              },
              {
                label: 'mepo2',
                colorScheme: '#7986CB'
              },
              {
                label: 'mn',
                colorScheme: '#7986CB'
              },
              {
                label: 'moen',
                colorScheme: '#7986CB'
              },
              {
                label: 'mp',
                colorScheme: '#7986CB'
              },
              {
                label: 'msp',
                colorScheme: '#7986CB'
              },
              {
                label: 'nen',
                colorScheme: '#7986CB'
              },
              {
                label: 'oxy',
                colorScheme: '#7986CB'
              },
              {
                label: 'prn',
                colorScheme: '#7986CB'
              },
              {
                label: 'Rmp',
                colorScheme: '#7986CB'
              },
              {
                label: 'Rsp',
                colorScheme: '#7986CB'
              },
              {
                label: 's2p',
                colorScheme: '#7986CB'
              },
              {
                label: 'Smp',
                colorScheme: '#7986CB'
              },
              {
                label: 'sp',
                colorScheme: '#7986CB'
              },
              {
                label: 'Ssp',
                colorScheme: '#7986CB'
              }
            ]
          }
        ]
      },
      selectItem: (item) => console.log(item)
    }
  },
  {
    caption: 'CHEM',
    component: () => <></>
  }
]
