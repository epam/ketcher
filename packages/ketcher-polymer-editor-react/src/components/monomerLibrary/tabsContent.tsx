import { RnaMonomerSection } from 'components/rna/RnaMonomerSection'
import { MonomerList } from './monomerLibraryList'

type TabContent = {
  caption: string
  component: React.FC<any>
  props?: any
}

export const tabsContent: TabContent[] = [
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
            { label: 'P' },
            { label: 'vfvv' },
            { label: 'qswsx' },
            { label: 'Mesk' }
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
            groupItems: [
              { label: 'A', colorScheme: '#A0A0FF' },
              { label: '2ldg' },
              { label: '4skmc' },
              { label: '7jds' },
              { label: 'dc' }
            ],
            groupTitle: 'A'
          },
          {
            groupItems: [
              { label: 'C' },
              { label: '5dvd' },
              { label: '9dkvj' },
              { label: 'sd6' },
              { label: 'dsa' }
            ],
            groupTitle: 'C'
          }
        ],
        Sugar: [
          {
            groupItems: [
              { label: 'R' },
              { label: 'm' },
              { label: 'd' },
              { label: 'ar' },
              { label: 'Ld' }
            ]
          }
        ],
        Phosphate: [
          {
            groupItems: [
              { label: 'p' },
              { label: '36dcd' },
              { label: 'bnn' },
              { label: 'bp' },
              { label: 'me' }
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
