import { CoreEditor, MonomerLibraryUpdateError } from 'application/editor';
import { SettingsManager, KetcherLogger } from 'utilities';
import type { MonomerItemType } from 'domain/types';

const template = (id: string, alias: string) => ({
  type: 'monomerTemplate',
  id,
  class: 'CHEM',
  classHELM: 'CHEM',
  alias,
  fullName: alias,
  aliasHELM: `helm${alias}`,
  aliasBILN: `biln${alias}`,
  atoms: [
    { label: 'C', location: [0, 0, 0] },
    { label: 'O', location: [1, 0, 0] },
  ],
  bonds: [{ type: 1, atoms: [0, 1] }],
});

const libraryData = (...templates: ReturnType<typeof template>[]) =>
  JSON.stringify({
    root: {
      templates: templates.map(({ id }) => ({ $ref: `monomerTemplate-${id}` })),
    },
    ...Object.fromEntries(
      templates.map((item) => [`monomerTemplate-${item.id}`, item]),
    ),
  });

const makeEditor = () => {
  const editor = Object.create(CoreEditor.prototype) as CoreEditor;
  Object.assign(editor, {
    _monomersLibrary: [],
    _monomersLibraryParsedJson: { root: { templates: [] } },
    events: { updateMonomersLibrary: { dispatch: jest.fn() } },
  });
  return editor;
};

describe('editing monomer library entries by identity', () => {
  beforeEach(() => {
    jest.spyOn(KetcherLogger, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('ignores ambiguous entries when locating and validating an edit', () => {
    const editor = makeEditor();
    editor.updateMonomersLibrary(libraryData(template('original', 'A')));
    editor.monomersLibrary.unshift({
      id: 'ambiguous',
      label: 'X',
      isAmbiguous: true,
      monomers: [],
      options: [],
    } as unknown as MonomerItemType);
    expect(() =>
      editor.updateMonomersLibrary(
        libraryData(template('changed', 'Renamed')),
        'monomerTemplate-original',
      ),
    ).not.toThrow();
    expect(editor.monomersLibrary[1].props.MonomerName).toBe('Renamed');
  });

  it.each(['A', 'Renamed'])(
    'updates %s without duplicating the entry or changing its template identity',
    (alias) => {
      const editor = makeEditor();
      editor.updateMonomersLibrary(libraryData(template('original', 'A')));
      const original = editor.monomersLibrary[0];
      editor.updateMonomersLibrary(
        libraryData({
          ...template('new-id', alias),
          aliasHELM: 'helmA',
          aliasBILN: 'bilnA',
        }),
        'monomerTemplate-original',
      );
      expect(editor.monomersLibrary).toHaveLength(1);
      expect(editor.monomersLibrary[0].props).toMatchObject({
        id: 'original',
        MonomerName: alias,
      });
      expect(editor.monomersLibraryParsedJson?.root.templates).toEqual([
        { $ref: 'monomerTemplate-original' },
      ]);
      expect(
        editor.monomersLibraryParsedJson?.['monomerTemplate-original'],
      ).toMatchObject({
        id: 'original',
        alias,
      });
      expect(original.props.MonomerName).toBe('A');
    },
  );

  it.each(['code', 'HELM', 'BILN', 'code-as-HELM'])(
    'rejects another entry’s %s without losing the original',
    (field) => {
      const editor = makeEditor();
      editor.updateMonomersLibrary(
        libraryData(template('original', 'A'), template('other', 'B')),
      );
      const modified = template('changed', field === 'code' ? 'B' : 'Renamed');
      if (field === 'HELM') modified.aliasHELM = 'helmB';
      if (field === 'BILN') modified.aliasBILN = 'bilnB';
      if (field === 'code-as-HELM') modified.alias = 'helmB';
      expect(() =>
        editor.updateMonomersLibrary(
          libraryData(modified),
          'monomerTemplate-original',
        ),
      ).toThrow(MonomerLibraryUpdateError);
      expect(
        editor.monomersLibrary.map(({ props }) => props.MonomerName),
      ).toEqual(['A', 'B']);
    },
  );

  it('persists deletion and refuses to leave dangling RNA preset references', () => {
    const editor = makeEditor();
    const persist = jest
      .spyOn(SettingsManager, 'addMonomerLibraryUpdate')
      .mockImplementation();
    editor.updateMonomersLibrary(libraryData(template('original', 'A')));
    const item = editor.monomersLibrary[0];
    editor.removeMonomerFromLibrary(item);
    expect(editor.monomersLibrary).toHaveLength(0);
    expect(persist).toHaveBeenCalledWith(
      JSON.stringify({ removedMonomerRef: 'monomerTemplate-original' }),
    );
    editor.updateMonomersLibrary(libraryData(template('original', 'A')));
    const parsed = editor.monomersLibraryParsedJson;
    if (!parsed) throw new Error('Missing library');
    parsed.root.templates.push({ $ref: 'monomerGroupTemplate-preset' });
    parsed['monomerGroupTemplate-preset'] = {
      type: 'monomerGroupTemplate',
      id: 'preset',
      class: 'RNA',
      name: 'preset',
      templates: [{ $ref: 'monomerTemplate-original' }],
    } as (typeof parsed)[string];
    expect(() => editor.removeMonomerFromLibrary(item)).toThrow('RNA preset');
    expect(editor.monomersLibrary).toHaveLength(1);
  });

  it('replays persisted edits and deletions after a reload', () => {
    const editor = makeEditor();
    const updates = SettingsManager.monomerLibraryUpdates;
    SettingsManager.monomerLibraryUpdates = [
      JSON.stringify({
        data: libraryData(template('changed', 'Renamed')),
        editedMonomerRef: 'monomerTemplate-original',
      }),
      JSON.stringify({ removedMonomerRef: 'monomerTemplate-other' }),
    ];
    try {
      Reflect.get(editor, 'setMonomersLibrary').call(
        editor,
        libraryData(template('original', 'A'), template('other', 'B')),
      );
      expect(editor.monomersLibrary).toHaveLength(1);
      expect(editor.monomersLibrary[0].props).toMatchObject({
        id: 'original',
        MonomerName: 'Renamed',
      });
    } finally {
      SettingsManager.monomerLibraryUpdates = updates;
    }
  });
});
