import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Struct } from 'ketcher-core';
import TemplateTable, { type Template } from './TemplateTable';

jest.mock('components', () => ({
  Icon: () => null,
  MemoizedStructRender: () => <svg aria-label="Structure preview" />,
}));

const renderTemplate = (group = 'User Templates') => {
  const struct = new Struct();
  struct.name = 'Chair';
  const template: Template = {
    struct,
    props: { atomid: 0, bondid: 0, group, name: 'Chair' },
  };
  const onSelect = jest.fn();
  const onDelete = jest.fn();
  const onAttach = jest.fn();

  render(
    <TemplateTable
      templates={[template]}
      selected={null}
      onSelect={onSelect}
      onDelete={onDelete}
      onAttach={onAttach}
    />,
  );

  return { template, onSelect, onDelete, onAttach };
};

describe('Structure Library template buttons', () => {
  it.each([
    ['Rings', 2],
    ['User Templates', 3],
    ['Functional Groups', 1],
    ['Salts and Solvents', 1],
  ])('renders non-nested native buttons for %s', (group, buttonCount) => {
    renderTemplate(group);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(buttonCount);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
      expect(button.parentElement?.closest('button')).toBeNull();
    });
  });

  it.each(['Chair', 'Structure preview'])(
    'selects the template when clicking %s',
    async (target) => {
      const user = userEvent.setup();
      const { template, onSelect, onDelete, onAttach } = renderTemplate();

      await user.click(
        target === 'Chair'
          ? screen.getByText(target)
          : screen.getByLabelText(target),
      );

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(template);
      expect(onDelete).not.toHaveBeenCalled();
      expect(onAttach).not.toHaveBeenCalled();
    },
  );

  it('edits and deletes without selecting the template', async () => {
    const user = userEvent.setup();
    const { template, onSelect, onDelete, onAttach } = renderTemplate();

    await user.click(screen.getByTestId('edit-template-button'));
    expect(onAttach).toHaveBeenCalledTimes(1);
    expect(onAttach).toHaveBeenCalledWith(template);
    expect(onDelete).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('delete-template-button'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(template);
    expect(onAttach).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each(['{Enter}', ' '])(
    'supports tab navigation and independent activation with %s',
    async (key) => {
      const user = userEvent.setup();
      const { template, onSelect, onDelete, onAttach } = renderTemplate();

      await user.tab();
      expect(screen.getByRole('button', { name: /Chair$/ })).toHaveFocus();
      await user.keyboard(key);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(template);
      expect(onDelete).not.toHaveBeenCalled();
      expect(onAttach).not.toHaveBeenCalled();

      await user.tab();
      expect(screen.getByTestId('delete-template-button')).toHaveFocus();
      await user.keyboard(key);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(template);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onAttach).not.toHaveBeenCalled();

      await user.tab();
      expect(screen.getByTestId('edit-template-button')).toHaveFocus();
      await user.keyboard(key);
      expect(onAttach).toHaveBeenCalledTimes(1);
      expect(onAttach).toHaveBeenCalledWith(template);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledTimes(1);
    },
  );
});
