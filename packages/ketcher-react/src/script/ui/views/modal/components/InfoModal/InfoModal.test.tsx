import InfoModal from './InfoModal';
import { shortcut } from './constants';
import { renderWithMockStore } from './mockStore';

describe('InfoModal should be rendered correctly', () => {
  it('should render default error message for Cut and Copy actions', () => {
    const props = 'Cut';
    const defaultErrorText = `This action is unavailable via menu. Instead, use shortcut to ${props}.`;
    const { container, getByText } = renderWithMockStore(
      <InfoModal message={props} />,
    );

    expect(container.firstChild).toMatchSnapshot();
    expect(getByText(defaultErrorText)).toBeInTheDocument();
  });

  it('should render Paste shortcut message if Paste message dispatched to props', () => {
    const props = 'Paste';
    const { container, getByText } = renderWithMockStore(
      <InfoModal message={props} />,
    );
    expect(container.firstChild).toMatchSnapshot();
    expect(getByText(shortcut.hotKey)).toBeInTheDocument();
  });
});
