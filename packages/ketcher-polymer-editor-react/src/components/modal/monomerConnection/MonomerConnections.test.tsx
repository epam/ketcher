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
    MonomerCaps: { R1: 'H', R2: 'H' },
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

function parseMonomerCaps(caps) {
  return caps.split(',').reduce((res, cap) => {
    const parts = cap.match(/\[(.*?)\](.*)/);
    if (parts) {
      res[parts[1]] = parts[2];
    }
    return res;
  }, {});
}

firstPeptide.monomerItem.props.MonomerCaps = parseMonomerCaps('[R1]H,[R2]H');
secondPeptide.monomerItem.props.MonomerCaps = parseMonomerCaps('[R1]O,[R2]O');

const mockProps = {
  onClose: jest.fn(),
  isModalOpen: true,
  firstMonomer: firstPeptide,
  secondMonomer: secondPeptide,
};

describe('MonomerConnections modal', () => {
  const renderMonomerConnection = () => {
    return render(
      <Provider store={mockStore}>
        {withThemeProvider(<MonomerConnection {...mockProps} />)}
      </Provider>,
    );
  };

  describe('Leaving group', () => {
    it('should be displayed as is by default', () => {
      renderMonomerConnection();
      expect(screen.getAllByTestId('leaving-group-value')[0]).toHaveTextContent(
        'H',
      );
    });
    it('should be displayed as OH when O is provided', () => {
      renderMonomerConnection();
      expect(screen.getAllByTestId('leaving-group-value')[2]).toHaveTextContent(
        'OH',
      );
    });
  });
});
