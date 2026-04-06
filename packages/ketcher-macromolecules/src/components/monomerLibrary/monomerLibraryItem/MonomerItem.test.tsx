import { render, screen, fireEvent } from '@testing-library/react';
import { MonomerItemType, Struct } from 'ketcher-core';
import { MonomerItem } from './MonomerItem';

describe('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn();
    const monomer: MonomerItemType = {
      label: 'for test',
      props: {
        BranchMonomer: 'false',
        MonomerCaps: { R1: 'H' },
        MonomerCode: '',
        MonomerName: 'Cya',
        MonomerNaturalAnalogCode: 'A',
        MonomerType: 'PEPTIDE',
        Name: '3-sulfoalanine',
      },
      struct: new Struct(),
    };
    render(
      withThemeAndStoreProvider(
        <MonomerItem key={1} item={monomer} onClick={monomerItemHandleClick} />,
      ),
    );

    const div = screen.getByText(monomer.label);
    fireEvent.click(div);

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1);
  });

  it('calls onStarClick when favorite star is clicked', () => {
    const onStarClick = jest.fn();
    const monomer: MonomerItemType = {
      label: 'for test',
      props: {
        BranchMonomer: 'false',
        MonomerCaps: { R1: 'H' },
        MonomerCode: '',
        MonomerName: 'Cya',
        MonomerNaturalAnalogCode: 'A',
        MonomerType: 'PEPTIDE',
        Name: '3-sulfoalanine',
      },
      struct: new Struct(),
    };
    render(
      withThemeAndStoreProvider(
        <MonomerItem key={1} item={monomer} onStarClick={onStarClick} />,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Toggle favorite' }));

    expect(onStarClick).toHaveBeenCalledTimes(1);
  });
});
