import { MACROMOLECULES_BOND_TYPES, SgContexts } from 'application/editor';
import { convertDraftToLexical } from 'application/render';

describe('public names exported by the application barrels', () => {
  it('exports the macromolecules bond types from application/editor', () => {
    expect(MACROMOLECULES_BOND_TYPES).toEqual({
      SINGLE: 'single',
      HYDROGEN: 'hydrogen',
    });
  });

  it('exports the S-group contexts from application/editor', () => {
    expect(SgContexts).toEqual({
      Fragment: 'Fragment',
      Multifragment: 'Multifragment',
      Bond: 'Bond',
      Atom: 'Atom',
      Group: 'Group',
    });
  });

  it('exports the Draft.js to Lexical converter from application/render', () => {
    const lexical = convertDraftToLexical({
      blocks: [
        {
          text: 'Hi',
          type: 'unstyled',
          inlineStyleRanges: [{ offset: 0, length: 1, style: 'BOLD' }],
        },
      ],
    });

    expect(lexical).toEqual({
      root: {
        type: 'root',
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              { type: 'text', text: 'H', format: 1, style: '', version: 1 },
              { type: 'text', text: 'i', format: 0, style: '', version: 1 },
            ],
          },
        ],
      },
    });
  });
});
