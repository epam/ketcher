import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ButtonGroup from './ToggleButtonGroup';
import classes from './ToggleButtonGroup.module.less';

describe('ButtonGroup', () => {
  const buttons = [
    { label: 'Label 1', value: '1' },
    { label: 'Label 2', value: '2' },
    { label: '', value: '3' },
  ];
  const onClickMock = jest.fn();
  const defaultValue = '2';

  beforeEach(() => {
    onClickMock.mockClear();
  });

  test('should render buttons with correct labels', () => {
    render(
      <ButtonGroup
        buttons={buttons}
        onClick={onClickMock}
        defaultValue={defaultValue}
      />,
    );

    buttons.forEach(({ label }) => {
      const buttonElement = screen.getByText(label || 'none');
      expect(buttonElement).toBeInTheDocument();
    });
  });

  test('should call onClick function when a button is clicked', () => {
    render(
      <ButtonGroup
        buttons={buttons}
        onClick={onClickMock}
        defaultValue={defaultValue}
      />,
    );

    buttons.forEach(({ value }) => {
      const buttonElement = screen.getByText(
        value !== '3' ? `Label ${value}` : 'none',
      );
      fireEvent.click(buttonElement);
      expect(onClickMock).toHaveBeenCalledWith(value);
    });
  });

  test('applies selected class based on defaultValue and toggles on click', async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup
        buttons={buttons}
        onClick={onClickMock}
        defaultValue={'2'}
      />,
    );

    const btn1 = screen.getByRole('button', { name: 'Label 1' });
    const btn2 = screen.getByRole('button', { name: 'Label 2' });

    expect(btn2).toHaveClass(classes.selected);
    expect(btn1).not.toHaveClass(classes.selected);

    await user.click(btn1);

    expect(onClickMock).toHaveBeenCalledWith('1');
    expect(btn1).toHaveClass(classes.selected);
    expect(btn2).not.toHaveClass(classes.selected);
  });

  test('generates correct data-testid when title is provided', () => {
    const title = 'test-group';
    render(
      <ButtonGroup
        buttons={buttons}
        onClick={onClickMock}
        defaultValue={defaultValue}
        title={title}
      />,
    );

    for (const { label } of buttons) {
      const expected = `${title}-${label}-option`;
      expect(screen.getByTestId(expected)).toBeInTheDocument();
    }
  });

  describe('button rendering', () => {
    test('renders both numeric and text buttons correctly', () => {
      const mixed = [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ];
      render(
        <ButtonGroup
          buttons={mixed}
          onClick={onClickMock}
          defaultValue={'A'}
        />,
      );

      expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    });

    test('handles numeric labels with special formatting', () => {
      const onlyNums = [
        { label: ' -3 ', value: '-3' },
        { label: '0', value: '0' },
        { label: '3.14', value: '3.14' },
        { label: '2', value: '2' },
      ];
      render(
        <ButtonGroup
          buttons={onlyNums}
          onClick={onClickMock}
          defaultValue={'0'}
        />,
      );

      expect(screen.getByRole('button', { name: '-3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3.14' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    test('handles empty labels by displaying "none"', () => {
      const withEmptyLabel = [
        { label: 'Alpha', value: 'Alpha' },
        { label: 'Beta', value: 'Beta' },
        { label: '', value: 'empty' },
      ];
      render(
        <ButtonGroup
          buttons={withEmptyLabel}
          onClick={onClickMock}
          defaultValue={'Alpha'}
        />,
      );

      expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Beta' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'none' })).toBeInTheDocument();
    });
  });

  test('handles mixed numeric and text labels correctly', () => {
    const mixed = [
      { label: ' -3 ', value: '-3' },
      { label: '3.14', value: '3.14' },
      { label: 'X2', value: 'X2' },
    ];
    render(
      <ButtonGroup buttons={mixed} onClick={onClickMock} defaultValue={'-3'} />,
    );

    expect(screen.getByRole('button', { name: '-3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3.14' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'X2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '-3' })).toHaveClass(
      classes.selected,
    );
  });
});
