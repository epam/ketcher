import { vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Struct, type SdfItem } from 'ketcher-core';
import i18n from 'src/i18n/i18n';
import { TemplatesList, type TemplatesListProps } from './TemplatesList';
import { ActionButton } from '../../ToolbarGroupItem/ActionButton';

describe('runtime template toolbar', () => {
  const template: SdfItem = {
    struct: Object.assign(new Struct(), { name: 'Water' }),
    props: { group: 'DB Templates' },
  };
  const status: TemplatesListProps['status'] = { 'template-0': {} };

  it('keeps templates beyond the eighth disabled when editing is not allowed', () => {
    const onAction = vi.fn();
    const templates = Array.from({ length: 10 }, (_, index) => ({
      ...template,
      struct: Object.assign(new Struct(), { name: `Template ${index + 1}` }),
    }));
    const disabledStatus: TemplatesListProps['status'] = Object.fromEntries(
      Array.from({ length: 8 }, (_, index) => [
        `template-${index}`,
        { disabled: true },
      ]),
    );
    render(
      <TemplatesList
        templates={templates}
        status={disabledStatus}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={onAction}
      />,
    );
    for (let index = 0; index < 10; index++) {
      const button = screen.getByTestId(`db-template-${index}`);
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(onAction).not.toHaveBeenCalled();
  });

  it('keeps additional template buttons hidden when the template action is hidden', () => {
    const templates = Array.from({ length: 10 }, () => template);
    const hiddenStatus: TemplatesListProps['status'] = Object.fromEntries(
      Array.from({ length: 8 }, (_, index) => [
        `template-${index}`,
        { hidden: true },
      ]),
    );
    render(
      <TemplatesList
        templates={templates}
        status={hiddenStatus}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('db-template-8')).not.toBeInTheDocument();
    expect(screen.queryByTestId('db-template-9')).not.toBeInTheDocument();
  });

  it('preserves an explicit status for an additional template', () => {
    const templates = Array.from({ length: 9 }, () => template);
    const status: TemplatesListProps['status'] = {
      'template-0': { disabled: true },
      'template-8': { disabled: false },
    };
    const onAction = vi.fn();
    render(
      <TemplatesList
        templates={templates}
        status={status}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={onAction}
      />,
    );
    const button = screen.getByTestId('db-template-8');
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not advertise the static shortcut for a database template', () => {
    const onAction = vi.fn();
    render(
      <TemplatesList
        templates={[template]}
        status={status}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={onAction}
      />,
    );

    const button = screen.getByTestId('db-template-0');
    expect(button).toHaveAttribute('title', 'Water');
    expect(
      within(button).getByText('', { selector: 'kbd' }),
    ).toBeEmptyDOMElement();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledWith({
      tool: 'template',
      opts: { struct: template.struct },
    });
  });

  it('hides shortcut labels for runtime buttons even when a binding is provided', () => {
    render(
      <ActionButton
        name="template-0"
        action={{
          title: 'Water',
          shortcut: 'F8',
          action: { tool: 'template', opts: { struct: template.struct } },
        }}
        showShortcut={false}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={vi.fn()}
      />,
    );

    const button = screen.getByTestId('template-0');
    expect(button).toHaveAttribute('title', 'Water');
    expect(
      within(button).getByText('', { selector: 'kbd' }),
    ).toBeEmptyDOMElement();
  });

  it('preserves database template names that match translation keys', () => {
    const name = 'common:button.cancel';
    const namedTemplate = {
      ...template,
      struct: Object.assign(new Struct(), { name }),
    };

    render(
      <TemplatesList
        templates={[namedTemplate]}
        status={status}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={vi.fn()}
      />,
    );

    expect(i18n.t(name)).toBe('Cancel');
    expect(screen.getByTestId('db-template-0')).toHaveAttribute('title', name);
  });

  it('keeps the built-in shortcut label when no database templates are present', () => {
    render(
      <TemplatesList
        templates={[]}
        status={status}
        disableableButtons={[]}
        indigoVerification={false}
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByTestId('template-0')).toHaveAttribute(
      'title',
      'Benzene (T)',
    );
  });
});
