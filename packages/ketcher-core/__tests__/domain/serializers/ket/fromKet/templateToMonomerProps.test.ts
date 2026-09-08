import { KetMonomerClass, KetTemplateType } from 'ketcher-core';
import { templateToMonomerProps } from '../../../../../src/domain/serializers/ket/fromKet/monomerToDrawingEntity';

describe('templateToMonomerProps', () => {
  it('maps template.idtAliases onto props.idtAliases', () => {
    const idtAliases = {
      base: 'Cy3',
      modifications: {
        endpoint5: '/5Cy3/',
        internal: '/iCy3/',
        endpoint3: '/3Cy3Sp/',
      },
    };

    const props = templateToMonomerProps({
      type: KetTemplateType.MONOMER_TEMPLATE,
      id: 'Cy3___Cy3',
      class: KetMonomerClass.CHEM,
      alias: 'Cy3',
      fullName: 'Cy3',
      naturalAnalogShort: 'X',
      idtAliases,
      atoms: [],
      bonds: [],
      root: {
        nodes: [],
        connections: [],
        templates: [{ $ref: 'monomerTemplate-Cy3___Cy3' }],
      },
    });

    expect(props.idtAliases).toEqual(idtAliases);
  });

  it('leaves props.idtAliases undefined when the template has none', () => {
    const props = templateToMonomerProps({
      type: KetTemplateType.MONOMER_TEMPLATE,
      id: 'X___X',
      class: KetMonomerClass.CHEM,
      alias: 'X',
      naturalAnalogShort: 'X',
      atoms: [],
      bonds: [],
      root: {
        nodes: [],
        connections: [],
        templates: [{ $ref: 'monomerTemplate-X___X' }],
      },
    });

    expect(props.idtAliases).toBeUndefined();
  });
});
