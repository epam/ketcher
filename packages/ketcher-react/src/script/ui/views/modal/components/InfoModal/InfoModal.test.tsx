import { screen } from '@testing-library/react';
import InfoModal from './InfoModal';
import { shortcut } from './constants';
import { renderWithMockStore } from './InfoModal.test.utils';

describe('InfoModal should be rendered correctly', () => {
  it('should render default error message for Cut and Copy actions', () => {
    const props = 'Cut';
    const defaultErrorText = `This action is unavailable via menu. Instead, use shortcut to ${props}.`;
    const view = renderWithMockStore(<InfoModal message={props} />);

    expect(view).toMatchSnapshot();
    expect(screen.getByText(defaultErrorText)).toBeInTheDocument();
  });

  it('should render Paste shortcut message if Paste message dispatched to props', () => {
    const props = 'Paste';
    const view = renderWithMockStore(<InfoModal message={props} />);
    expect(view).toMatchSnapshot();
    expect(screen.getByText(shortcut.hotKey)).toBeInTheDocument();
  });
});
