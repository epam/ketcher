import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import DataSGroupPreview from './DataSGroupPreview';
import { configureAppStore } from 'state';
import { showPreview } from 'state/common';
import { PreviewType } from 'state/types';

jest.mock('ketcher-react', () => ({
  SGroupDataRender: ({
    sGroupData,
    'data-testid': testId,
  }: {
    sGroupData: string | null;
    'data-testid'?: string;
  }) => <div data-testid={testId}>{sGroupData}</div>,
}));

describe('DataSGroupPreview', () => {
  it('renders fieldName=fieldValue for a Data S-group', () => {
    const store = configureAppStore();
    const fakeTarget = document.createElement('div');
    document.body.appendChild(fakeTarget);

    store.dispatch(
      showPreview({
        type: PreviewType.DataSGroup,
        fieldName: 'TestField',
        fieldValue: 'TestValue',
        target: fakeTarget,
      }),
    );

    render(
      <Provider store={store}>
        <DataSGroupPreview />
      </Provider>,
    );

    expect(screen.getByTestId('data-sgroup-preview')).toBeInTheDocument();
    expect(screen.getByText('TestField=TestValue')).toBeInTheDocument();

    document.body.removeChild(fakeTarget);
  });

  it('renders nothing when preview is not a DataSGroup type', () => {
    const store = configureAppStore();

    render(
      <Provider store={store}>
        <DataSGroupPreview />
      </Provider>,
    );

    expect(screen.queryByTestId('data-sgroup-preview')).not.toBeInTheDocument();
  });
});
