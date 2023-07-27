import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Save from '.';
import { renderWithMockStore } from './mockStore';

describe('Save Dialog should be rendered correctly', () => {
  it('should render opened file format dropdown when the closed dropdown is clicked', async () => {
    const view = renderWithMockStore(<Save />);

    userEvent.click(screen.getByText('MDL Molfile V2000'));

    await screen.findByText('MDL Molfile V3000');

    expect(view).toMatchSnapshot();
  });
});
