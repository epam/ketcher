import { editorReducer, showPreview } from './editorSlice';
import { EditorStatePreview, PreviewType, PresetPosition } from 'state/types';

describe('showPreview', () => {
  const closedPreview = {
    type: PreviewType.Monomer,
    monomer: undefined,
    style: {},
  };
  const initial = () => editorReducer(undefined, { type: '@@INIT' });
  const openPreviews: EditorStatePreview[] = [
    {
      type: PreviewType.Text,
      text: 'tooltip',
      target: document.createElement('span'),
      style: { top: '10px', left: '20px', right: '0px', transform: 'none' },
    },
    {
      type: PreviewType.Preset,
      monomers: [],
      position: PresetPosition.Library,
      name: 'preset',
      idtAliases: { base: 'alias' },
      aliasAxoLabs: 'axo',
      phosphatePosition: 'right',
    },
    { type: PreviewType.Bond, polymerBond: {} } as EditorStatePreview,
    {
      type: PreviewType.AmbiguousMonomer,
      monomer: { label: 'ambiguous' },
      presetMonomers: [],
    } as unknown as EditorStatePreview,
    {
      type: PreviewType.Monomer,
      monomer: {},
      attachmentPointsToBonds: {},
    } as EditorStatePreview,
  ];

  it('preserves slice and preview identity when already fully closed', () => {
    const state = initial();
    const result = editorReducer(state, showPreview(undefined));
    expect(result).toBe(state);
    expect(result.preview).toBe(state.preview);
  });

  it.each(openPreviews)(
    'clears every field of an open $type preview',
    (preview) => {
      const state = editorReducer(initial(), showPreview(preview));
      const result = editorReducer(state, showPreview(undefined));
      expect(result).not.toBe(state);
      expect(result.preview).toEqual(closedPreview);
      expect(Object.keys(result.preview).sort()).toEqual([
        'monomer',
        'style',
        'type',
      ]);
    },
  );

  it.each([
    ['target', document.createElement('span')],
    ['attachmentPointsToBonds', {}],
    ['monomers', []],
    ['position', PresetPosition.Library],
    ['name', 'stale'],
    ['idtAliases', { base: 'alias' }],
    ['aliasAxoLabs', 'axo'],
    ['phosphatePosition', 'right'],
    ['polymerBond', {}],
    ['presetMonomers', []],
    ['text', 'stale'],
    ['style', { left: '10px' }],
    ['style', undefined],
  ])('cleans residual %s even with no monomer', (field, value) => {
    const state = {
      ...initial(),
      preview: {
        ...closedPreview,
        [field as string]: value,
      } as EditorStatePreview,
    };
    const result = editorReducer(state, showPreview(undefined));
    expect(result).not.toBe(state);
    expect(result.preview).toEqual(closedPreview);
  });

  it('preserves identity on repeated closes after the first close', () => {
    const open = editorReducer(initial(), showPreview(openPreviews[0]));
    const closed = editorReducer(open, showPreview(undefined));
    let state = closed;
    for (let index = 0; index < 5; index++) {
      state = editorReducer(state, showPreview(undefined));
      expect(state).toBe(closed);
      expect(state.preview).toBe(closed.preview);
    }
  });

  it('opens and switches preview types without retaining previous fields', () => {
    let state = initial();
    for (const preview of openPreviews) {
      const next = editorReducer(state, showPreview(preview));
      expect(next).not.toBe(state);
      expect(next.preview).toEqual(preview);
      state = next;
    }
    state = editorReducer(state, showPreview(undefined));
    expect(editorReducer(state, showPreview(openPreviews[0])).preview).toEqual(
      openPreviews[0],
    );
  });
});
