import { render, screen } from '@testing-library/react';
import BondAttachmentPoints from './BondAttachmentPoints';
import { PreparedAttachmentPointData } from 'components/preview/hooks/useAttachmentPoints';

describe('BondAttachmentPoints', () => {
  it('highlights the attachment point name when it is in the bond', () => {
    const attachmentPoints: PreparedAttachmentPointData[] = [
      { id: 'R1', label: 'OH', connected: true },
      { id: 'R2', label: 'H', connected: false },
    ];

    render(
      <div>
        {withThemeProvider(
          <BondAttachmentPoints
            attachmentPoints={attachmentPoints}
            attachmentPointInBond="R1"
          />,
        )}
      </div>,
    );

    const highlightedName = screen.getByText('R1');
    const nonHighlightedName = screen.getByText('R2');
    const leavingGroup = screen.getByText('OH');

    expect(highlightedName).toBeInTheDocument();
    expect(nonHighlightedName).toBeInTheDocument();
    expect(leavingGroup).toBeInTheDocument();
    expect(highlightedName).toHaveStyle('background-color: #CDF1FC');
    expect(nonHighlightedName).not.toHaveStyle('background-color: #CDF1FC');
  });
});
