import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Save from '.';
import { renderWithMockContext } from './Save.test.utils';

describe('Save Dialog should be rendered correctly', () => {
  it('should render opened file format dropdown when the closed dropdown is clicked', async () => {
    // TODO suppressed after upgrade to react 19. Need to fix
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const view = renderWithMockContext(<Save />);

    await userEvent.click(screen.getByText('MDL Molfile V2000'));
    await screen.findByText('MDL Molfile V3000');

    expect(view).toMatchSnapshot();
  });
});
