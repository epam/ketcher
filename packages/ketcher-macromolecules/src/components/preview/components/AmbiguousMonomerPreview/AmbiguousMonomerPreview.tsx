import { useAppSelector } from 'hooks';
import { AmbiguousMonomerPreviewState, selectShowPreview } from 'state/common';
import { useMemo } from 'react';
import styled from '@emotion/styled';
import {
  Container,
  Content,
  ContentLine,
  Header,
  RatioBar,
} from './AmbiguousMonomerPreview.styles';

interface Props {
  className?: string;
}

const AmbiguousMonomerPreview = ({ className }: Props) => {
  const preview = useAppSelector(
    selectShowPreview,
  ) as AmbiguousMonomerPreviewState;

  const { monomer, style } = preview;

  const isAlternatives = monomer.subtype === 'alternatives';

  const ContainerDynamic = useMemo(() => {
    if (!style) {
      return styled(Container)``;
    }

    return styled(Container)`
      top: ${style?.top || ''};
      left: ${style?.left || ''};
      right: ${style?.right || ''};
    `;
  }, [style]);

  const header = isAlternatives ? 'Alternatives' : 'Mixed';

  const aminoAcidFallback = monomer.label === 'X' ? 'Any amino acid' : null;
  const baseFallback = monomer.label === 'N' ? 'Any base' : null;
  const fallback = aminoAcidFallback || baseFallback;

  const { monomers, options } = monomer;

  const previewData: { monomerName: string; ratio?: number }[] = useMemo(() => {
    if (fallback) {
      return [];
    }

    return monomers.map((monomer) => {
      const option = options.find(
        (option) => option.templateId === monomer.monomerItem.props.id,
      );
      return {
        monomerName: monomer.monomerItem.props.Name,
        ratio: option?.ratio,
      };
    });
  }, [fallback, monomers, options]);

  const preparedPreviewData = useMemo(() => {
    const sortedData = previewData.sort((a, b) => {
      if (isAlternatives) {
        return a.monomerName.localeCompare(b.monomerName);
      } else {
        if (!a.ratio || !b.ratio) {
          return 0;
        }
        return b.ratio - a.ratio;
      }
    });

    return sortedData.slice(0, 5);
  }, [previewData, isAlternatives]);

  return (
    <ContainerDynamic
      className={className}
      data-testid="polymer-library-preview"
    >
      <Header>{header}</Header>
      <Content>
        {fallback ??
          preparedPreviewData.map((entry) => (
            <ContentLine key={entry.monomerName}>
              {entry.ratio && (
                <RatioBar ratio={entry.ratio}>{entry.ratio}%</RatioBar>
              )}
              {entry.monomerName}
            </ContentLine>
          ))}
      </Content>
    </ContainerDynamic>
  );
};

const StyledPreview = styled(AmbiguousMonomerPreview)`
  z-index: 5;
  position: absolute;
  transform: translate(-50%, 0);
`;

export default StyledPreview;
