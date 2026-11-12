import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/render/renderers/monomerFactory';
import {
  ALANINE_TEMPLATE_ID,
  createMacromoleculesKet,
} from './fixtures/macromolecules';

// Separate file on purpose: no CoreEditor is created here, and Jest gives each
// test file its own module registry, so the editor singleton stays empty.
describe('KetSerializer malformed macromolecules KET without an editor', () => {
  beforeAll(() => {
    KetSerializer.setMonomerFactory(monomerFactory);
  });

  it('throws for a monomer node whose template is missing', () => {
    const ket = createMacromoleculesKet();

    delete ket[`monomerTemplate-${ALANINE_TEMPLATE_ID}`];

    expect(() =>
      new KetSerializer().deserialize(JSON.stringify(ket)),
    ).toThrow();
  });

  it('throws for a connection of an unsupported type', () => {
    const ket = createMacromoleculesKet();

    ket.root.connections[0].connectionType = 'unsupported';

    expect(() =>
      new KetSerializer().deserialize(JSON.stringify(ket)),
    ).toThrow();
  });
});
