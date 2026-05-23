import { KetMonomerClass } from 'ketcher-core';

import { getMonomerAttributeFieldVisibility } from './MonomerCreationWizardFields.utils';

type VisibilityType = Parameters<typeof getMonomerAttributeFieldVisibility>[0];

describe('getMonomerAttributeFieldVisibility', () => {
  const cases: Array<
    [VisibilityType, ReturnType<typeof getMonomerAttributeFieldVisibility>]
  > = [
    [
      KetMonomerClass.CHEM,
      {
        displayNaturalAnalogue: false,
        displayModificationTypes: false,
        displayAliases: false,
        displayHelmAlias: false,
        displayBilnAlias: false,
      },
    ],
    [
      KetMonomerClass.AminoAcid,
      {
        displayNaturalAnalogue: true,
        displayModificationTypes: true,
        displayAliases: true,
        displayHelmAlias: true,
        displayBilnAlias: false,
      },
    ],
    [
      KetMonomerClass.Sugar,
      {
        displayNaturalAnalogue: false,
        displayModificationTypes: false,
        displayAliases: true,
        displayHelmAlias: true,
        displayBilnAlias: false,
      },
    ],
    [
      KetMonomerClass.Base,
      {
        displayNaturalAnalogue: true,
        displayModificationTypes: false,
        displayAliases: true,
        displayHelmAlias: true,
        displayBilnAlias: false,
      },
    ],
    [
      KetMonomerClass.Phosphate,
      {
        displayNaturalAnalogue: false,
        displayModificationTypes: false,
        displayAliases: true,
        displayHelmAlias: true,
        displayBilnAlias: false,
      },
    ],
    [
      KetMonomerClass.RNA,
      {
        displayNaturalAnalogue: true,
        displayModificationTypes: false,
        displayAliases: false,
        displayHelmAlias: false,
        displayBilnAlias: false,
      },
    ],
    [
      'rnaPreset',
      {
        displayNaturalAnalogue: false,
        displayModificationTypes: false,
        displayAliases: false,
        displayHelmAlias: false,
        displayBilnAlias: false,
      },
    ],
  ];

  it.each(cases)(
    'returns field visibility for %s monomers',
    (type, expected) => {
      expect(getMonomerAttributeFieldVisibility(type)).toEqual(expected);
    },
  );
});
