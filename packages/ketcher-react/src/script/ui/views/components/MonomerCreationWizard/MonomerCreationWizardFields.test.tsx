import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { AttachmentPointName, KetMonomerClass } from 'ketcher-core';

import MonomerCreationWizardFields from './MonomerCreationWizardFields';
import { WizardState } from './MonomerCreationWizard.types';

const mockEditor = {
  setMonomerCreationSelectedType: jest.fn(),
  reassignAttachmentPoint: jest.fn(),
  changeLeavingAtomLabel: jest.fn(),
  removeAttachmentPoint: jest.fn(),
};

jest.mock('ketcher-core', () => {
  const actual = jest.requireActual('ketcher-core');

  return {
    ...actual,
    ketcherProvider: {
      getKetcher: () => ({
        editor: mockEditor,
      }),
    },
  };
});

jest.mock('components', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
  IconButton: ({
    title,
    testId,
    onClick,
  }: {
    title: string;
    testId?: string;
    onClick?: () => void;
  }) => (
    <button data-testid={testId} onClick={onClick}>
      {title}
    </button>
  ),
}));

jest.mock('../../../../../hooks', () => ({
  useAppContext: () => ({
    ketcherId: 'test-ketcher-id',
  }),
}));

jest.mock('../../../state/editor/selectors', () => ({
  editorMonomerCreationStateSelector: (state) =>
    state.editor?.monomerCreationState,
}));

jest.mock('./components/AttachmentPoint/AttachmentPoint', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

jest.mock(
  './components/ReadonlyAttachmentPoint/ReadonlyAttachmentPoint',
  () => ({
    __esModule: true,
    default: ({ name }: { name: string }) => <div>{name}</div>,
  }),
);

const createMockStore = () => {
  const reducer = combineReducers({
    editor: () => ({
      monomerCreationState: {
        assignedAttachmentPoints: new Map(),
      },
    }),
  });

  return createStore(reducer);
};

const createWizardState = (type: KetMonomerClass): WizardState => ({
  values: {
    type,
    symbol: '',
    name: '',
    naturalAnalogue: '',
    aliasHELM: '',
    aliasBILN: '',
  },
  errors: {},
  notifications: new Map(),
});

const renderFields = (type: KetMonomerClass) =>
  render(
    <Provider store={createMockStore()}>
      <MonomerCreationWizardFields
        wizardState={createWizardState(type)}
        assignedAttachmentPoints={
          new Map([[AttachmentPointName.R1, [1, 2] as [number, number]]])
        }
        onFieldChange={jest.fn()}
      />
    </Provider>,
  );

const expectVisibleOrAbsent = (
  element: HTMLElement | null,
  shouldBeVisible: boolean,
) => {
  if (shouldBeVisible) {
    expect(element).toBeInTheDocument();
  } else {
    expect(element).not.toBeInTheDocument();
  }
};

describe('MonomerCreationWizardFields', () => {
  it.each<{
    type: KetMonomerClass;
    naturalAnalogue: boolean;
    modification: boolean;
    aliases: boolean;
    helmAlias: boolean;
    bilnAlias: boolean;
    attachmentPoints: boolean;
  }>([
    {
      type: KetMonomerClass.CHEM,
      naturalAnalogue: false,
      modification: false,
      aliases: true,
      helmAlias: false,
      bilnAlias: true,
      attachmentPoints: true,
    },
    {
      type: KetMonomerClass.AminoAcid,
      naturalAnalogue: true,
      modification: true,
      aliases: true,
      helmAlias: true,
      bilnAlias: true,
      attachmentPoints: true,
    },
    {
      type: KetMonomerClass.Sugar,
      naturalAnalogue: false,
      modification: false,
      aliases: true,
      helmAlias: true,
      bilnAlias: false,
      attachmentPoints: true,
    },
    {
      type: KetMonomerClass.Base,
      naturalAnalogue: true,
      modification: false,
      aliases: true,
      helmAlias: true,
      bilnAlias: false,
      attachmentPoints: true,
    },
    {
      type: KetMonomerClass.Phosphate,
      naturalAnalogue: false,
      modification: false,
      aliases: true,
      helmAlias: true,
      bilnAlias: false,
      attachmentPoints: false,
    },
    {
      type: KetMonomerClass.RNA,
      naturalAnalogue: true,
      modification: false,
      aliases: false,
      helmAlias: false,
      bilnAlias: false,
      attachmentPoints: true,
    },
  ])(
    'shows only supported attributes for $type monomers',
    ({
      type,
      naturalAnalogue,
      modification,
      aliases,
      helmAlias,
      bilnAlias,
      attachmentPoints,
    }) => {
      renderFields(type);

      expect(screen.getByTestId('symbol-input')).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expectVisibleOrAbsent(
        screen.queryByText('Natural analogue'),
        naturalAnalogue,
      );
      expectVisibleOrAbsent(
        screen.queryByTestId('modification-types-accordion'),
        modification,
      );
      expectVisibleOrAbsent(screen.queryByTestId('aliases-accordion'), aliases);
      expectVisibleOrAbsent(
        screen.queryByTestId('helm-alias-input'),
        helmAlias,
      );
      expectVisibleOrAbsent(
        screen.queryByTestId('biln-alias-input'),
        bilnAlias,
      );
      expectVisibleOrAbsent(
        screen.queryByText('Attachment points'),
        attachmentPoints,
      );
    },
  );
});
