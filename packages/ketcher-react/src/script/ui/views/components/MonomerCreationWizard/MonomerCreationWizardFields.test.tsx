import { fireEvent, render, screen } from '@testing-library/react';
import { KetMonomerClass } from 'ketcher-core';
import MonomerCreationWizardFields from './MonomerCreationWizardFields';

vi.mock('ketcher-core', async () => ({
  ...(await vi.importActual('ketcher-core')),
  ketcherProvider: {
    getKetcher: () => ({
      editor: { setMonomerCreationSelectedType: vi.fn() },
    }),
  },
}));
vi.mock('../../../../../hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test' }),
}));
vi.mock('react-redux', async () => ({
  ...(await vi.importActual('react-redux')),
  useSelector: () => ({ assignedAttachmentPoints: new Map() }),
}));
vi.mock('./components/NaturalAnaloguePicker/NaturalAnaloguePicker', () => ({
  __esModule: true,
  default: () => null,
  isNaturalAnalogueRequired: () => true,
}));
vi.mock(
  './components/ModificationTypeDropdown/ModificationTypeDropdown',
  () => ({
    __esModule: true,
    default: ({ value, onChange, testId }) => (
      <input
        data-testid={testId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  }),
);

describe('library modification types', () => {
  it('loads and edits the original modification types without adding a copy', () => {
    const onChange = vi.fn();
    render(
      <MonomerCreationWizardFields
        wizardState={{
          values: {
            type: KetMonomerClass.AminoAcid,
            symbol: 'A',
            name: 'Alanine',
            naturalAnalogue: 'A',
            aliasHELM: '',
            aliasBILN: '',
            aliasAxoLabs: '',
          },
          notifications: new Map(),
          errors: {},
        }}
        assignedAttachmentPoints={new Map()}
        initialModificationTypes={['Natural amino acid']}
        onChangeModificationTypes={onChange}
        onFieldChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId('modification-type-dropdown-0')).toHaveValue(
      'Natural amino acid',
    );
    fireEvent.change(screen.getByTestId('modification-type-dropdown-0'), {
      target: { value: 'Modified' },
    });
    expect(onChange).toHaveBeenLastCalledWith(['Modified']);
    fireEvent.click(screen.getByTestId('add-modification-type-button'));
    expect(onChange).toHaveBeenLastCalledWith(['Modified', '']);
    fireEvent.change(screen.getByTestId('modification-type-dropdown-1'), {
      target: { value: 'Additional' },
    });
    expect(onChange).toHaveBeenLastCalledWith(['Modified', 'Additional']);
  });
});

describe('AxoLabs alias field', () => {
  const renderFields = (
    type: KetMonomerClass,
    showAxoLabsAlias?: boolean,
    aliasAxoLabs = '',
  ) =>
    render(
      <MonomerCreationWizardFields
        wizardState={{
          values: {
            type,
            symbol: 'A',
            name: 'Alanine',
            naturalAnalogue: 'A',
            aliasHELM: '',
            aliasBILN: '',
            aliasAxoLabs,
          },
          notifications: new Map(),
          errors: {},
        }}
        assignedAttachmentPoints={new Map()}
        showAxoLabsAlias={showAxoLabsAlias}
        onFieldChange={vi.fn()}
      />,
    );

  it.each([
    KetMonomerClass.RNA,
    KetMonomerClass.CHEM,
    KetMonomerClass.Phosphate,
  ])('is shown for %s', (type) => {
    renderFields(type);
    expect(screen.getByTestId('axolabs-alias-input')).toBeInTheDocument();
  });

  it.each([
    KetMonomerClass.AminoAcid,
    KetMonomerClass.Sugar,
    KetMonomerClass.Base,
  ])('is hidden for %s', (type) => {
    renderFields(type);
    expect(screen.queryByTestId('axolabs-alias-input')).not.toBeInTheDocument();
  });

  it('is hidden when showAxoLabsAlias is false, keeping HELM for phosphate', () => {
    renderFields(KetMonomerClass.Phosphate, false);
    expect(screen.queryByTestId('axolabs-alias-input')).not.toBeInTheDocument();
    expect(screen.getByTestId('helm-alias-input')).toBeInTheDocument();
  });

  it('drops the whole Aliases section for RNA when the field is hidden', () => {
    renderFields(KetMonomerClass.RNA, false);
    expect(screen.queryByTestId('aliases-accordion')).not.toBeInTheDocument();
  });
});
