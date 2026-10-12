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

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tooltip } from './Tooltip';

const TITLE = 'Chain';

describe('Tooltip', () => {
  it('keeps the title attribute on the child while closed', () => {
    render(
      <Tooltip title={TITLE}>
        <button>btn</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('title', TITLE);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the tooltip on hover', async () => {
    render(
      <Tooltip title={TITLE}>
        <button>btn</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button');

    fireEvent.mouseOver(button);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(TITLE);
    expect(button).not.toHaveAttribute('title');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('falls back to the native title for disabled children', () => {
    render(
      <Tooltip title={TITLE}>
        <button disabled>btn</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('title', TITLE);
  });

  it('renders the child as is without a title', () => {
    render(
      <Tooltip>
        <button>btn</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button');

    fireEvent.mouseOver(button);

    expect(button).not.toHaveAttribute('title');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
