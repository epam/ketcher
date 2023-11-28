import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { Struct, Peptide } from 'ketcher-core';
import { MonomerConnection } from './MonomerConnections';
import { configureAppStore } from '../../../state/store';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(React, 'useEffect').mockImplementation(() => {});

const mockStore = configureAppStore({});
const monomerData = {
  label: 'Abc',
  struct: new Struct(),
  props: {
    MonomerNaturalAnalogCode: 'A',
    MonomerType: 'MONOMER',
    BranchMonomer: '',
    MonomerCaps: { R1: 'H' },
    MonomerCode: '',
    MonomerName: '',
    Name: 'First peptide',
  },
};

const firstPeptide = new Peptide(monomerData);
const secondPeptide = new Peptide({
  ...monomerData,
  props: { ...monomerData.props, Name: 'Second peptide' },
});

firstPeptide.attachmentPointsToBonds = { R1: null, R2: null };
firstPeptide.monomerItem.props.MonomerCaps = { R1: 'H', R2: 'H' };
secondPeptide.attachmentPointsToBonds = { R1: null, R2: null };
secondPeptide.monomerItem.props.MonomerCaps = { R1: 'O', R2: 'O' };

const mockProps = {
  onClose: jest.fn(),
  isModalOpen: true,
  firstMonomer: firstPeptide,
  secondMonomer: secondPeptide,
};

describe('MonomerConnections modal', () => {
  describe('Leaving group', () => {
    it('should be displayed as is by default', () => {
      render(
        <Provider store={mockStore}>
          {withThemeProvider(<MonomerConnection {...mockProps} />)}
        </Provider>,
      );
      expect(screen.getAllByTestId('leaving-group-value')[0]).toHaveTextContent(
        'H',
      );
    });
    it('should be displayed as OH when O is provided', () => {
      render(
        <Provider store={mockStore}>
          {withThemeProvider(<MonomerConnection {...mockProps} />)}
        </Provider>,
      );
      expect(screen.getAllByTestId('leaving-group-value')[2]).toHaveTextContent(
        'OH',
      );
    });
  });
});
