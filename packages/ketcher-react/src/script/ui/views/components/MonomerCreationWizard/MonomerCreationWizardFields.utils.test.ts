import { KetMonomerClass } from 'ketcher-core';
import { getMonomerPropertyVisibility } from './MonomerCreationWizardFields.utils';

describe('getMonomerPropertyVisibility', () => {
  it.each`
    type                         | naturalAnalogue | modificationTypes | helmAlias | bilnAlias | idtAlias
    ${KetMonomerClass.CHEM}      | ${false}        | ${false}          | ${true}   | ${true}   | ${true}
    ${KetMonomerClass.AminoAcid} | ${true}         | ${true}           | ${true}   | ${true}   | ${false}
    ${KetMonomerClass.Sugar}     | ${false}        | ${false}          | ${true}   | ${false}  | ${false}
    ${KetMonomerClass.Base}      | ${true}         | ${false}          | ${true}   | ${false}  | ${false}
    ${KetMonomerClass.Phosphate} | ${false}        | ${false}          | ${true}   | ${false}  | ${true}
    ${KetMonomerClass.RNA}       | ${true}         | ${false}          | ${false}  | ${false}  | ${true}
    ${'rnaPreset'}               | ${false}        | ${false}          | ${false}  | ${false}  | ${false}
  `(
    'returns supported properties for $type',
    ({
      type,
      naturalAnalogue,
      modificationTypes,
      helmAlias,
      bilnAlias,
      idtAlias,
    }) => {
      expect(getMonomerPropertyVisibility(type)).toEqual({
        displayNaturalAnalogue: naturalAnalogue,
        displayModificationTypes: modificationTypes,
        displayAliases: helmAlias || bilnAlias,
        displayHelmAlias: helmAlias,
        displayBilnAlias: bilnAlias,
        displayIdtAlias: idtAlias,
      });
    },
  );
});
