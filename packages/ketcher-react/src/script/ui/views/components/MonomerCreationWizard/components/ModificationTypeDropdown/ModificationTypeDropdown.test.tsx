import { render, screen } from '@testing-library/react';
import { resetEditorInstance } from 'ketcher-core';
import ModificationTypeDropdown from './ModificationTypeDropdown';

describe('ModificationTypeDropdown', () => {
  beforeEach(() => {
    resetEditorInstance();
  });

  afterEach(() => {
    resetEditorInstance();
  });

  it('renders without modification options when the macromolecules editor is unavailable', () => {
    render(
      <ModificationTypeDropdown
        naturalAnalogue="A"
        value={null}
        onChange={jest.fn()}
        testId="modification-type"
      />,
    );

    expect(screen.getByTestId('modification-type')).toBeInTheDocument();
  });
});
