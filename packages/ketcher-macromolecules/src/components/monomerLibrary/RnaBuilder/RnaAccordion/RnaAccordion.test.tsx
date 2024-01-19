import { render, screen } from '@testing-library/react';
import { RnaAccordion } from 'components/monomerLibrary/RnaBuilder/RnaAccordion/RnaAccordion';
import { getMonomerUniqueKey } from 'state/library';
import { MonomerItemType, Struct } from 'ketcher-core';
import { MONOMER_TYPES } from '../../../../constants';

const duplicatePreset = jest.fn();
const editPreset = jest.fn();
describe('Test Rna Accordion component', () => {
  it('should render', () => {
    render(
      withThemeAndStoreProvider(
        <RnaAccordion
          libraryName={MONOMER_TYPES.RNA}
          duplicatePreset={duplicatePreset}
          editPreset={editPreset}
        />,
      ),
    );

    const rnaAccordion = screen.getByTestId('rna-accordion');

    expect(rnaAccordion).toMatchSnapshot();
  });

  it('should show number of items in section', () => {
    const monomerData = {
      label: '',
      struct: new Struct(),
      props: {
        Name: "1',2'-Di-Deoxy-Ribose",
        MonomerType: 'RNA',
        MonomerName: '12ddR',
        MonomerCode: '',
        MonomerNaturalAnalogCode: 'P',
        BranchMonomer: 'false',
        MonomerCaps: { R1: 'H' },
      },
    };
    render(
      withThemeAndStoreProvider(
        <RnaAccordion
          libraryName={MONOMER_TYPES.RNA}
          duplicatePreset={duplicatePreset}
          editPreset={editPreset}
        />,
        {
          library: {
            searchFilter: '',
            favorites: {},
            monomers: [monomerData],
          },
        },
      ),
    );
    const peptidesSummary = screen.getByTestId('summary-Phosphates');

    expect(peptidesSummary).toHaveTextContent('Phosphates (1)');

    const monomerCard = screen.getByTestId(
      getMonomerUniqueKey(monomerData as MonomerItemType),
    );
    expect(monomerCard).toBeVisible();
  });
});
