import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/render/renderers/monomerFactory';
import {
  SPACER_TEMPLATE_ID,
  createMacromoleculesKet,
  deserializeToManager,
  findMonomerByLabel,
} from './fixtures/macromolecules';

const PARSING_ERROR = 'Error during file parsing';

type Library = Record<string, unknown> | null | undefined;

describe('KetSerializer reads of the editor through the bridge', () => {
  const spacerKey = `monomerTemplate-${SPACER_TEMPLATE_ID}`;
  const reportError = jest.fn();
  let library: Library;
  const serializer = new KetSerializer();

  const deserialize = (ket: Record<string, unknown>) =>
    serializer.deserializeToDrawingEntities(JSON.stringify(ket));
  const monomerByLabel = (ket: Record<string, unknown>, label: string) =>
    findMonomerByLabel(
      deserializeToManager(serializer, JSON.stringify(ket)),
      label,
    );

  beforeAll(() => {
    KetSerializer.setMonomerFactory(monomerFactory);
    KetSerializer.setEditorBridge({
      reportError,
      getMonomersLibraryJson: () => library as never,
    });
  });

  beforeEach(() => {
    reportError.mockClear();
    library = {
      [spacerKey]: {
        idtAliases: { base: 'iSpBase' },
        aliasAxoLabs: 'Sp-axo',
        aliasBILN: 'Sp-biln',
        modificationTypes: ['Natural amino acid'],
      },
    };
  });

  describe('library enrichment of monomer templates', () => {
    it('fills the four alias fields that the KET template lacks from the library', () => {
      const spacer = monomerByLabel(createMacromoleculesKet(), 'Sp');

      expect(spacer.monomerItem.props.idtAliases).toEqual({ base: 'iSpBase' });
      expect(spacer.monomerItem.props.aliasAxoLabs).toBe('Sp-axo');
      expect(spacer.monomerItem.props.aliasBILN).toBe('Sp-biln');
      expect(spacer.monomerItem.props.modificationTypes).toEqual([
        'Natural amino acid',
      ]);
    });

    it('keeps the fields that the KET template already has', () => {
      const ket = createMacromoleculesKet();

      ket[spacerKey].idtAliases = { base: 'fromKet' };

      const spacer = monomerByLabel(ket, 'Sp');

      expect(spacer.monomerItem.props.idtAliases).toEqual({ base: 'fromKet' });
      expect(spacer.monomerItem.props.aliasBILN).toBe('Sp-biln');
    });

    it('leaves a template as it is when the library has no template with its id', () => {
      const alanine = monomerByLabel(createMacromoleculesKet(), 'A');

      expect(alanine.monomerItem.props.idtAliases).toBeUndefined();
      expect(alanine.monomerItem.props.modificationTypes).toBeUndefined();
    });

    it.each([undefined, null])(
      'leaves a template as it is when the bridge returns %s',
      (value) => {
        library = value;

        const spacer = monomerByLabel(createMacromoleculesKet(), 'Sp');

        expect(spacer.monomerItem.props.idtAliases).toBeUndefined();
        expect(spacer.monomerItem.props.modificationTypes).toBeUndefined();
      },
    );
  });

  describe('parsing errors', () => {
    it('reports a monomer node whose template is missing and returns no result', () => {
      const ket = createMacromoleculesKet();

      delete ket[spacerKey];

      expect(deserialize(ket)).toBeUndefined();
      expect(reportError).toHaveBeenCalledWith(PARSING_ERROR);
    });

    it('reports a connection of an unsupported type', () => {
      const ket = createMacromoleculesKet();

      ket.root.connections[0].connectionType = 'unsupported';
      deserialize(ket);

      expect(reportError).toHaveBeenCalledWith(PARSING_ERROR);
    });

    it('reports nothing for a valid KET', () => {
      deserialize(createMacromoleculesKet());

      expect(reportError).not.toHaveBeenCalled();
    });
  });
});

describe('KetSerializer without a bound editor bridge', () => {
  // The bridge slot is never unbound, so each test gets a fresh module.
  const freshSerializer = () => {
    let serializer!: KetSerializer;

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        KetSerializer: FreshKetSerializer,
      } = require('domain/serializers');

      FreshKetSerializer.setMonomerFactory(monomerFactory);
      serializer = new FreshKetSerializer();
    });

    return serializer;
  };

  it('reads a KET that needs no editor', () => {
    const result = freshSerializer().deserializeToDrawingEntities(
      JSON.stringify(createMacromoleculesKet()),
    );

    expect(result?.drawingEntitiesManager.monomers.size).toBe(5);
  });

  it('throws an error that names the bridge for a monomer node whose template is missing', () => {
    const ket = createMacromoleculesKet();

    delete ket[`monomerTemplate-${SPACER_TEMPLATE_ID}`];

    expect(() =>
      freshSerializer().deserializeToDrawingEntities(JSON.stringify(ket)),
    ).toThrow(/setEditorBridge/);
  });
});
