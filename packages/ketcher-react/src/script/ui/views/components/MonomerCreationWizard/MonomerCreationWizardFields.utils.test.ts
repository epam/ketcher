import { KetMonomerClass } from 'ketcher-core';
import { getMonomerPropertyVisibility } from './MonomerCreationWizardFields.utils';

describe('getMonomerPropertyVisibility', () => {
  it.each`
    type                         | naturalAnalogue | modificationTypes | helmAlias | bilnAlias
    ${KetMonomerClass.CHEM}      | ${false}        | ${false}          | ${true}   | ${true}
    ${KetMonomerClass.AminoAcid} | ${true}         | ${true}           | ${true}   | ${true}
    ${KetMonomerClass.Sugar}     | ${false}        | ${false}          | ${true}   | ${false}
    ${KetMonomerClass.Base}      | ${true}         | ${false}          | ${true}   | ${false}
    ${KetMonomerClass.Phosphate} | ${false}        | ${false}          | ${true}   | ${false}
    ${KetMonomerClass.RNA}       | ${true}         | ${false}          | ${false}  | ${false}
    ${'rnaPreset'}               | ${false}        | ${false}          | ${false}  | ${false}
  `(
    'returns supported properties for $type',
    ({ type, naturalAnalogue, modificationTypes, helmAlias, bilnAlias }) => {
      expect(getMonomerPropertyVisibility(type)).toEqual({
        displayNaturalAnalogue: naturalAnalogue,
        displayModificationTypes: modificationTypes,
        displayAliases: helmAlias || bilnAlias,
        displayHelmAlias: helmAlias,
        displayBilnAlias: bilnAlias,
      });
    },
  );
});
