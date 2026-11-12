import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureAppStore } from 'state';
import { closeModal, openModal } from 'state/modal';
import { ModalContainer } from './ModalContainer';

// The test is about the editor flag, not about what a dialog renders
jest.mock('./modalComponentList', () => ({
  modalComponentList: { delete: () => null },
}));

describe('ModalContainer', () => {
  it('tells the editor whether a dialog is open, so it ignores pastes behind it', () => {
    const editor = { setIsModalOpen: jest.fn() };
    const store = configureAppStore({ editor: { editor } });

    render(
      <Provider store={store}>
        <ModalContainer />
      </Provider>,
    );

    act(() => {
      store.dispatch(openModal('delete'));
    });
    expect(editor.setIsModalOpen).toHaveBeenLastCalledWith(true);

    act(() => {
      store.dispatch(closeModal());
    });
    expect(editor.setIsModalOpen).toHaveBeenLastCalledWith(false);
  });
});
