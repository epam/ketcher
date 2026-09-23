import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Subscription } from 'subscription';
import type { MonomerCreationWizardRequest } from 'ketcher-core';
import { Editor } from './Editor';

const mockMicroEditor = {
  event: { monomerWizardStateChange: new Subscription<boolean>() },
  closeMonomerCreationWizard: jest.fn(),
  openMonomerCreationWizardFromMacro: jest.fn(),
  focusCliparea: jest.fn(),
  errorHandler: jest.fn(),
};
const mockMacroEditor = {
  events: {
    switchToMacromoleculesMode: new Subscription(),
    switchToMoleculesMode: new Subscription(),
    openMonomerCreationWizard: new Subscription<MonomerCreationWizardRequest>(),
  },
  switchToMacromolecules: jest.fn(),
  switchToMicromolecules: jest.fn(),
  finishMonomerWizardSession: jest.fn(),
};

jest.mock('ketcher-core', () => ({
  ketcherProvider: { getIndexById: () => 0 },
}));
jest.mock('./MicromoleculesEditor', () => ({
  MicromoleculesEditor: ({
    onInit,
    onSetKetcherId,
    togglerComponent,
  }: {
    onInit: (ketcher: unknown) => void;
    onSetKetcherId: (id: string) => void;
    togglerComponent: React.ReactNode;
  }) => (
    <>
      <button
        onClick={() => {
          onSetKetcherId('wizard-test');
          onInit({ id: 'wizard-test', editor: mockMicroEditor });
        }}
      >
        Init micro
      </button>
      {togglerComponent}
    </>
  ),
}));
jest.mock(
  'ketcher-macromolecules',
  () => ({
    __esModule: true,
    default: ({
      onInit,
      togglerComponent,
    }: {
      onInit: (editor: unknown) => void;
      togglerComponent: React.ReactNode;
    }) => (
      <>
        <button
          data-testid="init-macro"
          onClick={() => onInit(mockMacroEditor)}
        >
          Init macro
        </button>
        {togglerComponent}
      </>
    ),
  }),
  { virtual: true },
);
jest.mock('./script/ui/views/toolbars/ModeControl', () => ({
  ModeControl: ({
    disabled,
    isPolymerEditor,
    toggle,
  }: {
    disabled: boolean;
    isPolymerEditor: boolean;
    toggle: (macro: boolean) => void;
  }) => (
    <button
      data-testid="mode-switch"
      disabled={disabled}
      onClick={() => toggle(!isPolymerEditor)}
    >
      {isPolymerEditor ? 'Macromolecules' : 'Molecules'}
    </button>
  ),
}));
jest.mock('./script/ui/views/components', () => ({
  LoadingCircles: () => null,
}));

const initialize = async () => {
  render(<Editor {...({} as ComponentProps<typeof Editor>)} />);
  fireEvent.click(screen.getByText('Init micro'));
  fireEvent.click(await screen.findByTestId('init-macro'));
  act(() => mockMacroEditor.events.switchToMacromoleculesMode.dispatch());
  jest.clearAllMocks();
};

describe('Editor monomer wizard mode bridge', () => {
  it('switches temporarily and restores only after the completion callback', async () => {
    await initialize();
    const request: MonomerCreationWizardRequest = { mode: 'create' };
    act(() =>
      mockMacroEditor.events.openMonomerCreationWizard.dispatch(request),
    );

    expect(
      mockMicroEditor.openMonomerCreationWizardFromMacro,
    ).toHaveBeenCalledWith(request, expect.any(Function));
    expect(screen.getAllByTestId('mode-switch')[0]).toBeDisabled();
    expect(screen.getAllByTestId('mode-switch')[0]).toHaveTextContent(
      'Molecules',
    );
    expect(mockMacroEditor.switchToMicromolecules).not.toHaveBeenCalled();

    act(() => mockMicroEditor.event.monomerWizardStateChange.dispatch(false));
    expect(screen.getAllByTestId('mode-switch')[0]).toBeDisabled();
    act(() => mockMacroEditor.events.switchToMacromoleculesMode.dispatch());
    expect(mockMacroEditor.switchToMacromolecules).not.toHaveBeenCalled();

    const finish =
      mockMicroEditor.openMonomerCreationWizardFromMacro.mock.calls[0][1];
    act(() => finish(true));
    expect(mockMacroEditor.finishMonomerWizardSession).toHaveBeenCalledWith(
      true,
    );
    expect(screen.getAllByTestId('mode-switch')[0]).not.toBeDisabled();
    expect(screen.getAllByTestId('mode-switch')[0]).toHaveTextContent(
      'Macromolecules',
    );
    expect(mockMacroEditor.switchToMacromolecules).not.toHaveBeenCalled();
  });

  it('restores macro mode after an opening error without converting the original canvas', async () => {
    await initialize();
    mockMicroEditor.openMonomerCreationWizardFromMacro.mockImplementationOnce(
      () => {
        throw new Error('Invalid selection');
      },
    );
    act(() =>
      mockMacroEditor.events.openMonomerCreationWizard.dispatch({
        mode: 'create',
      }),
    );
    expect(mockMacroEditor.finishMonomerWizardSession).toHaveBeenCalledWith(
      false,
    );
    expect(mockMicroEditor.errorHandler).toHaveBeenCalledWith(
      'Invalid selection',
    );
    expect(screen.getAllByTestId('mode-switch')[0]).not.toBeDisabled();
    expect(mockMacroEditor.switchToMicromolecules).not.toHaveBeenCalled();
  });

  it('disables the mode switch for an ordinary molecules wizard too', async () => {
    await initialize();
    act(() => mockMicroEditor.event.monomerWizardStateChange.dispatch(true));
    expect(screen.getAllByTestId('mode-switch')[0]).toBeDisabled();
    act(() => mockMicroEditor.event.monomerWizardStateChange.dispatch(false));
    expect(screen.getAllByTestId('mode-switch')[0]).not.toBeDisabled();
  });
});
