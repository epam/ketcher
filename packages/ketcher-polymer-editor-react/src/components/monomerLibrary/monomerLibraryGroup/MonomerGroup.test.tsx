/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { render, screen, fireEvent } from '@testing-library/react';
import { Struct } from 'ketcher-core';

import { MonomerGroup } from './MonomerGroup';

describe('Monomer Group', () => {
  const mockGroupProps = {
    groupItems: [
      {
        label: 'R',
        props: {
          MonomerNaturalAnalogCode: 'R',
          MonomerName: 'RRMonomerName',
          Name: 'RRName',
          MonomerType: 'RNA',
        },
        struct: new Struct(),
      },
      {
        label: 'm',
        props: {
          MonomerNaturalAnalogCode: 'A',
          MonomerName: 'mAMonomerName',
          Name: 'mAName',
          MonomerType: 'CHEM',
        },
        struct: new Struct(),
      },
      {
        label: 'd',
        props: {
          MonomerNaturalAnalogCode: 'D',
          MonomerName: 'dDMonomerName',
          Name: 'dDName',
          MonomerType: 'RNA',
        },
        struct: new Struct(),
      },
      {
        label: 'ar',
        props: {
          MonomerNaturalAnalogCode: 'R',
          MonomerName: 'arRMonomerName',
          Name: 'arRName',
          MonomerType: 'RNA',
        },
        struct: new Struct(),
      },
      {
        label: 'Ld',
        props: {
          MonomerNaturalAnalogCode: 'L',
          MonomerName: 'LdLMonomerName',
          Name: 'LdLRName',
          MonomerType: 'CHEM',
        },
        struct: new Struct(),
      },
    ],
    groupTitle: 'Mock title',
  };
  const onItemClick = jest.fn();

  it('should render correct without title prop', () => {
    const view = render(
      withThemeAndStoreProvider(
        <MonomerGroup
          items={mockGroupProps.groupItems}
          onItemClick={onItemClick}
        />,
      ),
    );

    mockGroupProps.groupItems.forEach((item) => {
      const currentItem = screen.getByText(item.label);
      expect(currentItem).toBeInTheDocument();
    });

    expect(view).toMatchSnapshot();
  });
  it('should render correct with title prop', () => {
    const view = render(
      withThemeAndStoreProvider(
        <MonomerGroup
          items={mockGroupProps.groupItems}
          title={mockGroupProps.groupTitle}
          onItemClick={onItemClick}
        />,
      ),
    );

    const title = screen.getByText(mockGroupProps.groupTitle);
    expect(title).toBeInTheDocument();

    expect(view).toMatchSnapshot();
  });
  it('callback for monomer item should be called for group items', () => {
    render(
      withThemeAndStoreProvider(
        <MonomerGroup
          items={mockGroupProps.groupItems}
          title={mockGroupProps.groupTitle}
          onItemClick={onItemClick}
        />,
      ),
    );
    const item = screen.getByText('Ld');
    fireEvent.click(item);
    expect(onItemClick).toBeCalled();
  });
});
