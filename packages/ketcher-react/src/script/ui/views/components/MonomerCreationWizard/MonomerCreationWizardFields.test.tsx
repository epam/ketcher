import { fireEvent, render, screen } from '@testing-library/react';
import { KetMonomerClass } from 'ketcher-core';
import MonomerCreationWizardFields from './MonomerCreationWizardFields';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  ketcherProvider: {
    getKetcher: () => ({
      editor: { setMonomerCreationSelectedType: jest.fn() },
    }),
  },
}));
jest.mock('../../../../../hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test' }),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => ({ assignedAttachmentPoints: new Map() }),
}));
jest.mock('./components/NaturalAnaloguePicker/NaturalAnaloguePicker', () => ({
  __esModule: true,
  default: () => null,
  isNaturalAnalogueRequired: () => true,
}));
jest.mock(
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
    const onChange = jest.fn();
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
          },
          notifications: new Map(),
          errors: {},
        }}
        assignedAttachmentPoints={new Map()}
        initialModificationTypes={['Natural amino acid']}
        onChangeModificationTypes={onChange}
        onFieldChange={jest.fn()}
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
