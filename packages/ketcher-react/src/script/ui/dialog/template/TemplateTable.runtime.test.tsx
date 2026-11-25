import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import TemplateTable, { type Template } from './TemplateTable';

vi.mock('components', () => ({
  Icon: () => null,
  MemoizedStructRender: () => null,
}));

describe('runtime salts and solvents template titles', () => {
  it.each([undefined, ''])(
    'shows the runtime display name when abbreviation is %p',
    (abbreviation) => {
      const template: Template = {
        struct: Object.assign(new Struct(), { name: 'Water' }),
        props: {
          group: 'Salts and Solvents',
          atomid: 0,
          bondid: 0,
          name: 'Water',
          abbreviation,
        },
      };
      render(
        <TemplateTable
          templates={[template]}
          selected={null}
          onSelect={vi.fn()}
        />,
      );
      expect(screen.getByText('Water')).toBeInTheDocument();
    },
  );

  it('preserves a built-in abbreviation while showing the full display name in the tooltip', () => {
    const template: Template = {
      struct: Object.assign(new Struct(), { name: 'Sodium chloride' }),
      props: {
        group: 'Salts and Solvents',
        atomid: 0,
        bondid: 0,
        name: 'Sodium chloride',
        abbreviation: 'NaCl',
      },
    };
    render(
      <TemplateTable
        templates={[template]}
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('NaCl')).toBeInTheDocument();
    expect(screen.getByTitle('Sodium chloride')).toBeInTheDocument();
  });

  it.each([undefined, ''])(
    'falls back to the structure name when metadata is %p',
    (name) => {
      const template: Template = {
        struct: Object.assign(new Struct(), { name: 'Water' }),
        props: {
          group: 'Salts and Solvents',
          atomid: 0,
          bondid: 0,
          name: name as string,
        },
      };

      render(
        <TemplateTable
          templates={[template]}
          selected={null}
          onSelect={vi.fn()}
        />,
      );

      expect(screen.getByTitle('Water')).toBeInTheDocument();
      expect(screen.getByText('Water')).toBeInTheDocument();
    },
  );
});
