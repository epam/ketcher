import { screen, fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ConnectedEnhancedStereo from './enhancedStereo';

jest.mock('../../../views/components', () => ({
  Dialog: ({ children, result, valid, params }: any) => (
    <div data-testid="mock-dialog">
      {children}
      <button
        data-testid="apply-button"
        disabled={valid ? !valid() : false}
        onClick={() => params?.onOk?.(result?.())}
      >
        Apply
      </button>
      <button data-testid="cancel-button" onClick={() => params?.onCancel?.()}>
        Cancel
      </button>
    </div>
  ),
}));

function createMockStruct(
  atoms: Array<{ id: number; stereoLabel: string | null }>,
) {
  const atomsMap = new Map<number, { stereoLabel: string | null }>();
  atoms.forEach(({ id, stereoLabel }) => {
    atomsMap.set(id, { stereoLabel });
  });
  return { atoms: atomsMap };
}

function renderEnhancedStereo(
  struct: ReturnType<typeof createMockStruct>,
  init = { type: 'abs', andNumber: 1, orNumber: 1 },
) {
  const onOk = jest.fn();
  const onCancel = jest.fn();

  // TODO suppressed after upgrade to react 19. Need to fix
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const store = createStore(
    (state) => state,
    { editor: { struct: () => struct } },
  );

  const EnhancedStereo: any = ConnectedEnhancedStereo;
  const utils = render(
    <Provider store={store}>
      <EnhancedStereo init={init} onOk={onOk} onCancel={onCancel} />
    </Provider>,
  );

  return { ...utils, onOk, onCancel };
}

describe('EnhancedStereo dialog', () => {
  describe('initial rendering', () => {
    it('shows ABS, Create new AND Group, and Create new OR Group when no groups exist', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      renderEnhancedStereo(struct);

      expect(screen.getByTestId('abs-radio')).toBeInTheDocument();
      expect(
        screen.getByTestId('create-new-and-group-radio'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('create-new-or-group-radio'),
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId('add-to-and-group-radio'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('add-to-or-group-radio'),
      ).not.toBeInTheDocument();
    });

    it('checks ABS radio by default when init type is abs', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      renderEnhancedStereo(struct);

      const absRadio = screen.getByTestId('abs-radio') as HTMLInputElement;
      expect(absRadio.checked).toBe(true);

      const newAndRadio = screen.getByTestId(
        'create-new-and-group-radio',
      ) as HTMLInputElement;
      expect(newAndRadio.checked).toBe(false);

      const newOrRadio = screen.getByTestId(
        'create-new-or-group-radio',
      ) as HTMLInputElement;
      expect(newOrRadio.checked).toBe(false);
    });

    it('shows Add to AND option when AND groups exist in structure', () => {
      const struct = createMockStruct([
        { id: 0, stereoLabel: '&1' },
        { id: 1, stereoLabel: 'abs' },
      ]);
      renderEnhancedStereo(struct, {
        type: 'abs',
        andNumber: 1,
        orNumber: 1,
      });

      expect(
        screen.getByTestId('add-to-and-group-radio'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('add-to-or-group-radio'),
      ).not.toBeInTheDocument();
    });

    it('shows Add to OR option when OR groups exist in structure', () => {
      const struct = createMockStruct([
        { id: 0, stereoLabel: 'or1' },
        { id: 1, stereoLabel: 'abs' },
      ]);
      renderEnhancedStereo(struct, {
        type: 'abs',
        andNumber: 1,
        orNumber: 1,
      });

      expect(
        screen.queryByTestId('add-to-and-group-radio'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('add-to-or-group-radio'),
      ).toBeInTheDocument();
    });

    it('pre-selects Add to AND when init type is &', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: '&1' }]);
      renderEnhancedStereo(struct, {
        type: '&',
        andNumber: 1,
        orNumber: 1,
      });

      const addToAndRadio = screen.getByTestId(
        'add-to-and-group-radio',
      ) as HTMLInputElement;
      expect(addToAndRadio.checked).toBe(true);

      const absRadio = screen.getByTestId('abs-radio') as HTMLInputElement;
      expect(absRadio.checked).toBe(false);
    });
  });

  describe('radio selection', () => {
    it('updates checked state when clicking Create new AND Group', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      renderEnhancedStereo(struct);

      const newAndRadio = screen.getByTestId(
        'create-new-and-group-radio',
      ) as HTMLInputElement;
      fireEvent.click(newAndRadio);

      const updatedAndRadio = screen.getByTestId(
        'create-new-and-group-radio',
      ) as HTMLInputElement;
      expect(updatedAndRadio.checked).toBe(true);

      const absRadio = screen.getByTestId('abs-radio') as HTMLInputElement;
      expect(absRadio.checked).toBe(false);
    });

    it('updates checked state when clicking Create new OR Group', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      renderEnhancedStereo(struct);

      const newOrRadio = screen.getByTestId(
        'create-new-or-group-radio',
      ) as HTMLInputElement;
      fireEvent.click(newOrRadio);

      const updatedOrRadio = screen.getByTestId(
        'create-new-or-group-radio',
      ) as HTMLInputElement;
      expect(updatedOrRadio.checked).toBe(true);

      const absRadio = screen.getByTestId('abs-radio') as HTMLInputElement;
      expect(absRadio.checked).toBe(false);
    });

    it('allows switching back to ABS after selecting another option', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      renderEnhancedStereo(struct);

      fireEvent.click(screen.getByTestId('create-new-and-group-radio'));
      fireEvent.click(screen.getByTestId('abs-radio'));

      const absRadio = screen.getByTestId('abs-radio') as HTMLInputElement;
      expect(absRadio.checked).toBe(true);

      const newAndRadio = screen.getByTestId(
        'create-new-and-group-radio',
      ) as HTMLInputElement;
      expect(newAndRadio.checked).toBe(false);
    });
  });

  describe('Apply result', () => {
    it('returns abs type when ABS is selected', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      const { onOk } = renderEnhancedStereo(struct);

      fireEvent.click(screen.getByTestId('apply-button'));

      expect(onOk).toHaveBeenCalledWith({
        type: 'abs',
        andNumber: 1,
        orNumber: 1,
      });
    });

    it('returns AND type when Create new AND Group is selected', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      const { onOk } = renderEnhancedStereo(struct);

      fireEvent.click(screen.getByTestId('create-new-and-group-radio'));
      fireEvent.click(screen.getByTestId('apply-button'));

      expect(onOk).toHaveBeenCalledWith({
        type: '&1',
        andNumber: 1,
        orNumber: 1,
      });
    });

    it('returns OR type when Create new OR Group is selected', () => {
      const struct = createMockStruct([{ id: 0, stereoLabel: 'abs' }]);
      const { onOk } = renderEnhancedStereo(struct);

      fireEvent.click(screen.getByTestId('create-new-or-group-radio'));
      fireEvent.click(screen.getByTestId('apply-button'));

      expect(onOk).toHaveBeenCalledWith({
        type: 'or1',
        andNumber: 1,
        orNumber: 1,
      });
    });

    it('returns Add to AND type with correct group number', () => {
      const struct = createMockStruct([
        { id: 0, stereoLabel: '&1' },
        { id: 1, stereoLabel: 'abs' },
      ]);
      const { onOk } = renderEnhancedStereo(struct, {
        type: 'abs',
        andNumber: 1,
        orNumber: 1,
      });

      fireEvent.click(screen.getByTestId('add-to-and-group-radio'));
      fireEvent.click(screen.getByTestId('apply-button'));

      expect(onOk).toHaveBeenCalledWith({
        type: '&',
        andNumber: 1,
        orNumber: 1,
      });
    });
  });
});
