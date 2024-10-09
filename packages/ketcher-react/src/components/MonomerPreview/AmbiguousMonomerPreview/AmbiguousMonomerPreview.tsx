import { useMemo } from 'react';
import styled from '@emotion/styled';
import {
  Container,
  Content,
  ContentLine,
  Header,
  RatioBar,
} from './AmbiguousMonomerPreview.styles';
import { AmbiguousMonomerPreviewState } from './types';

interface Props {
  className?: string;
  preview: AmbiguousMonomerPreviewState;
}

const UnstyledAmbiguousMonomerPreview = ({ className, preview }: Props) => {
  const { monomer, presetMonomers, style } = preview;

  const isAlternatives = monomer.subtype === 'alternatives';

  const ContainerDynamic = useMemo(() => {
    if (!style) {
      return styled(Container)``;
    }

    return styled(Container)`
      top: ${style?.top || ''};
      left: ${style?.left || ''};
      right: ${style?.right || ''};
      transform: ${style.transform || ''};
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

      let monomerName: string;
      if (presetMonomers) {
        const [sugar, , phosphate] = presetMonomers;
        const sugarName = sugar?.label ?? '';
        const phosphateName = phosphate?.label ?? '';
        monomerName = `${sugarName}(${monomer.label})${phosphateName}`;
      } else {
        monomerName = monomer.monomerItem.props.Name;
      }

      return {
        monomerName,
        ratio: option?.ratio,
      };
    });
  }, [fallback, monomers, presetMonomers, options]);

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
    if (!isAlternatives) {
      const overallRatio = sortedData.reduce(
        (acc, item) => acc + (item.ratio || 1),
        0,
      );

      sortedData.forEach((entry) => {
        entry.ratio = Math.round(((entry.ratio || 1) / overallRatio) * 100);
      });
    }

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

export const AmbiguousMonomerPreview = styled(UnstyledAmbiguousMonomerPreview)`
  z-index: 5;
  position: absolute;
`;
