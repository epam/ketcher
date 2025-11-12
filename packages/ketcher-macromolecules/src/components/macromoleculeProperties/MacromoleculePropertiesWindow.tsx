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

import { useAppDispatch, useAppSelector } from 'hooks';
import {
  MolarMeasurementUnit,
  selectEditor,
  selectIsMacromoleculesPropertiesWindowOpened,
  selectMacromoleculesProperties,
  selectOligonucleotidesMeasurementUnit,
  selectOligonucleotidesValue,
  selectUnipositiveIonsMeasurementUnit,
  selectUnipositiveIonsValue,
  setMacromoleculesPropertiesWindowVisibility,
  setOligonucleotidesMeasurementUnit,
  setUnipositiveIonsMeasurementUnit,
  setUnipositiveIonsValue,
  setOligonucleotidesValue,
} from 'state/common';
import styled from '@emotion/styled';
import _round from 'lodash/round';
import _map from 'lodash/map';
import { Tabs } from 'components/shared/Tabs';
import {
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  peptideNaturalAnalogues,
  rnaDnaNaturalAnalogues,
  SingleChainMacromoleculeProperties,
} from 'ketcher-core';
import { Icon } from 'ketcher-react';
import { DropDown } from 'components/shared/dropDown';
import { useRecalculateMacromoleculeProperties } from '../../hooks/useRecalculateMacromoleculeProperties';
import { debounce, isNumber } from 'lodash';
import * as d3 from 'd3';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { TextInputField } from 'components/shared/textInputField';

const OTHER_MONOMER_COUNT_NAME = 'Other';

const hasSpecificProperty = (
  macromoleculesProperties: SingleChainMacromoleculeProperties | undefined,
  property: 'nucleotides' | 'peptides',
) => {
  const specificProperty = macromoleculesProperties?.monomerCount?.[property];
  return specificProperty && Object.keys(specificProperty).length > 0;
};

const StyledWrapper = styled('div')<{ isActive?: boolean; hasError?: boolean }>(
  ({ hasError }) => ({
    width: '100%',
    height: hasError ? '124px' : '177px',
    position: 'relative',
    backgroundColor: 'white',
    padding: '2px 0',
    borderRadius: '8px 8px',
    overflow: 'hidden',
    boxShadow: '0px 2px 5px rgba(103, 104, 132, 0.15)',
  }),
);

const WindowControlsArea = styled('div')(() => ({
  display: 'flex',
}));

const WindowDragControl = styled('div')(() => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
}));

const StyledCloseIcon = styled(Icon)(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '12px',
  height: '12px',
  padding: '2px 6px',
  cursor: 'pointer',
}));

const Header = styled('div')(() => ({
  display: 'flex',
  height: '25px',
  alignItems: 'center',
  padding: '0 8px',
}));

const GrossFormula = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  fontWeight: '700',
  padding: '0 8px',
  color: '#585858',
}));

const MolecularMass = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  height: '24px',
  borderLeft: '1px solid #CAD3DD',
  color: '#585858',
}));

const MolecularMassAmount = styled('div')(() => ({
  fontSize: '14px',
  fontWeight: '700',
  padding: '0 8px',
}));

// TODO suppressed after upgrade to react 19. Need to fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const TabsWrapper = styled('div')(() => ({
  width: '100%',
  height: '100%',
  top: '-25px',
  position: 'relative',
}));

const TabContentWrapper = styled('div')(() => ({
  width: '100%',
  padding: '0 4px 4px',
}));

// TODO suppressed after upgrade to react 19. Need to fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const TabContentErrorWrapper = styled('div')(() => ({
  display: 'flex',
  width: '100%',
  height: '74px',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const TabContentErrorTitle = styled('div')(() => ({
  fontSize: '14px',
}));

const TabContentErrorDescription = styled('div')(() => ({
  fontSize: '12px',
}));

const BasicPropertiesWrapper = styled('div')(() => ({
  display: 'flex',
  padding: '4px 0px',
  height: '32px',
  gap: '12px',
}));

const PeptidePropertiesBottomPart = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '0 2px',
}));

const HydrophobicityChartWrapper = styled('div')(() => ({
  height: '90px',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '5px',
}));

const RnaBasicPropertiesWrapper = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const PeptideBasicPropertiesWrapper = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
}));

const StyledBasicProperty = styled('div')<{ disabled?: boolean }>(
  ({ disabled }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0 0 0 6px',
    pointerEvents: disabled ? 'none' : 'auto',
    opacity: disabled ? 0.5 : 1,
  }),
);

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: '220px',
    padding: '12px',
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0 1px 5px 0 #CCCCCC',
    fontSize: 11,
  },
}));

// TODO suppressed after upgrade to react 19. Need to fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const HydrophobicityHintHeader = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#585858',
  borderBottom: '1px solid #585858',
  paddingBottom: '8px',
  marginBottom: '8px',
}));

const BasicPropertyName = styled('div')(() => ({
  fontSize: '10px',
  paddingRight: '5px',
  whiteSpace: 'nowrap',
}));

const BasicPropertyValue = styled('div')(() => ({
  fontSize: '14px',
  fontWeight: '700',
}));

const PropertyHintIcon = styled(Icon)(() => ({
  width: '20px',
  height: '20px',
}));

const PropertyHintIconWrapper = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}));

// TODO suppressed after upgrade to react 19. Need to fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const BasicPropertyDropdown = styled(DropDown)(() => ({
  position: 'relative',
  padding: '0 0 0 5px',
  zIndex: 1, // needed because tabs below are shifted up and overlaps the dropdown element to match the design
}));

const inputClassName = 'text-input-field-input';

// TODO suppressed after upgrade to react 19. Need to fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const BasicPropertyInput = styled(TextInputField)(() => ({
  margin: 0,

  [`.${inputClassName}`]: {
    width: '60px',
    '::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    MozAppearance: 'textfield',
  },
}));

const StyledMonomersCountPanel = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '4px 6px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '6px',
  height: '90px',
  alignContent: 'flex-start',
}));

const StyledMonomersCountPanelItem = styled('div')<{
  monomerShortName: string;
  isPeptide?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  position: relative;
  justify-content: space-between;
  background-color: #eff2f5;
  padding: 4px 6px;
  font-weight: 500;
  font-size: 12px;
  border-radius: 2px;
  min-width: 50px;
  flex: 1;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 15px;
    height: 2px;
    background: ${({ theme, monomerShortName, isPeptide }) => {
      const colorsMap = isPeptide
        ? theme.ketcher.peptide.color
        : theme.ketcher.monomer.color;

      return (
        colorsMap[monomerShortName]?.regular ||
        theme.ketcher.monomer.color.default.regular
      );
    }};
    border-radius: 0 0 0 2px;
  }
`;

const StyledMonomersCountPanelItemName = styled('div')(() => ({
  fontWeight: '700',
}));

interface BasicPropertyProps {
  name: string;
  value?: string | number;
  hint?: string | ReactNode;
  options?: string[];
  selectedOption?: string;
  disabled?: boolean;
  testId?: string;
  onChangeOption?: (option: string) => void;
  onChangeValue?: (value: number) => void;
}

interface MonomersCountPanelProps {
  monomerCount: Record<string, number>;
  isPeptide?: boolean;
}

const MonomersCountPanel = (props: MonomersCountPanelProps) => {
  const naturalAnaloguesArray = props.isPeptide
    ? peptideNaturalAnalogues
    : rnaDnaNaturalAnalogues;
  const countsEntries: [string, number][] = naturalAnaloguesArray.map(
    (peptideNaturalAnalogues) => [
      peptideNaturalAnalogues,
      props.monomerCount[peptideNaturalAnalogues] || 0,
    ],
  );

  countsEntries.push([
    OTHER_MONOMER_COUNT_NAME,
    props.monomerCount[OTHER_MONOMER_COUNT_NAME] || 0,
  ]);
  countsEntries.sort((a, b) => {
    return a[0] === OTHER_MONOMER_COUNT_NAME ? 1 : a[0].localeCompare(b[0]);
  });

  return (
    <StyledMonomersCountPanel>
      {_map(countsEntries, ([monomerShortName, count]) => {
        return (
          <StyledMonomersCountPanelItem
            monomerShortName={monomerShortName}
            data-testid={monomerShortName + '-option'}
            isPeptide={props.isPeptide}
            disabled={count === 0}
            key={monomerShortName}
          >
            <StyledMonomersCountPanelItemName>
              {monomerShortName}
            </StyledMonomersCountPanelItemName>
            <div>{count}</div>
          </StyledMonomersCountPanelItem>
        );
      })}
    </StyledMonomersCountPanel>
  );
};

const BasicProperty = (props: BasicPropertyProps) => {
  return (
    <StyledBasicProperty data-testid={props.testId} disabled={props.disabled}>
      <>
        <BasicPropertyName>
          {props.name}
          {props.value !== undefined && ':'}
        </BasicPropertyName>
        {props.onChangeValue ? (
          <BasicPropertyInput
            value={props.value ?? ''}
            id={`macromolecule-property-${props.name}`}
            data-testid={`${props.testId}-input`}
            type="number"
            min={0}
            inputClassName={inputClassName}
            onChange={(value) => props?.onChangeValue?.(Number(value))}
          />
        ) : (
          <BasicPropertyValue data-testid={props.testId + '-value'}>
            {props.value}
          </BasicPropertyValue>
        )}
        {props.hint && (
          // TODO suppressed after upgrade to react 19. Need to fix
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <StyledTooltip title={props.hint}>
            <PropertyHintIconWrapper>
              <PropertyHintIcon
                name="about"
                dataTestId={props.name + '-info'}
              />
            </PropertyHintIconWrapper>
          </StyledTooltip>
        )}
        {props.options && props.selectedOption && props.onChangeOption && (
          <BasicPropertyDropdown
            options={props.options.map((option) => ({
              id: option,
              label: option,
            }))}
            testId={props.testId + '-selector'}
            currentSelection={props.selectedOption}
            selectionHandler={props.onChangeOption}
          />
        )}
      </>
    </StyledBasicProperty>
  );
};

const GrossFormulaPart = ({ part }) => {
  const match = part.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return part;

  const [_, element, count] = match;
  return (
    <span>
      {element}
      <sub>{count}</sub>{' '}
    </span>
  );
};

interface PeptidePropertiesProps {
  macromoleculesProperties: SingleChainMacromoleculeProperties;
  isError: boolean;
}

type DnaRnaPropertiesProps = PeptidePropertiesProps;

interface HydrophobicityChartProps {
  data: number[];
}

const StyledHydrophobicityChartSvg = styled('svg')(() => ({
  width: '100%',
  height: '100%',
}));

function lttb(xs, ys, threshold) {
  // Largest Triangle Three Buckets algorithm
  const dataLength = xs.length;

  if (threshold >= dataLength || threshold === 0) {
    return { xs, ys };
  }

  const sampledXs = [xs[0]];
  const sampledYs = [ys[0]];

  const every = (dataLength - 2) / (threshold - 2);
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * every) + 1;
    const rangeEnd = Math.floor((i + 2) * every) + 1;

    // avg point in next bucket
    const avgRangeStart = rangeStart;
    const avgRangeEnd = rangeEnd;
    let avgX = 0;
    let avgY = 0;

    const rangeLength = avgRangeEnd - avgRangeStart;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += xs[j];
      avgY += ys[j];
    }
    avgX /= rangeLength;
    avgY /= rangeLength;

    // range for this bucket
    const rangeOffs = Math.floor(i * every) + 1;
    const rangeTo = Math.floor((i + 1) * every) + 1;

    let maxArea = -1;
    let nextA = rangeOffs;

    for (let j = rangeOffs; j < rangeTo; j++) {
      // triangle area
      const area = Math.abs(
        (xs[a] - avgX) * (ys[j] - ys[a]) - (xs[a] - xs[j]) * (avgY - ys[a]),
      );
      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }

    sampledXs.push(xs[nextA]);
    sampledYs.push(ys[nextA]);
    a = nextA;
  }

  sampledXs.push(xs[dataLength - 1]);
  sampledYs.push(ys[dataLength - 1]);

  return { xs: sampledXs, ys: sampledYs };
}

const getNumberOfTicks = (_width: number) => {
  if (_width > 360) {
    return 5;
  } else if (_width > 300) {
    return 4;
  } else if (_width > 240) {
    return 3;
  }
  return 2;
};

const roundToMinNiceNumber = (number: number) => {
  if (number < 1) {
    return 0;
  } else if (number < 2) {
    return 1;
  } else if (number < 3) {
    return 2;
  } else if (number < 5) {
    return 3;
  } else if (number < 10) {
    return 5;
  } else if (number < 100) {
    return Math.floor(number / 10) * 10;
  } else if (number < 1000) {
    return Math.floor(number / 50) * 50;
  }
  return Math.floor(number / 100) * 100;
};

const HydrophobicityChart = (props: HydrophobicityChartProps) => {
  const { data: initialData } = props;
  const data = lttb(
    initialData.map((_item, index) => index + 1),
    initialData,
    100,
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.xs.length || !svgRef.current) return;

    const width = svgRef.current.width.baseVal.value;
    const height = svgRef.current.height.baseVal.value;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };

    d3.select(svgRef.current).selectAll('*').remove();

    const xScale = d3
      .scaleLinear()
      .domain([0, data.xs.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<number>()
      .x((_d, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveLinear);

    const svgContainer = d3.select(svgRef.current);
    const maximumNumberOfTicks = getNumberOfTicks(width);
    const distanceBetweenTicksForMaximumNumberOfTicks = roundToMinNiceNumber(
      initialData.length / maximumNumberOfTicks,
    );
    let finalDistanceBetweenTicks = distanceBetweenTicksForMaximumNumberOfTicks;
    let tickValues: number[];

    if (distanceBetweenTicksForMaximumNumberOfTicks >= 1) {
      let numberOfTicksWithMaximumCoverage = -Infinity;
      let distanceBetweenTicksWithMaximumCoverage = -Infinity;
      let maximumCoverage = -Infinity;

      for (let i = 2; i <= maximumNumberOfTicks; i++) {
        const numberOfTicks = i;
        const distanceBetweenTicks = roundToMinNiceNumber(
          initialData.length / numberOfTicks,
        );
        const coverage = Number(
          (distanceBetweenTicks * (numberOfTicks / initialData.length)).toFixed(
            2,
          ),
        );

        if (
          coverage > maximumCoverage ||
          (coverage === maximumCoverage &&
            numberOfTicks > numberOfTicksWithMaximumCoverage)
        ) {
          numberOfTicksWithMaximumCoverage = numberOfTicks;
          maximumCoverage = coverage;
          distanceBetweenTicksWithMaximumCoverage = distanceBetweenTicks;
        }
      }

      tickValues = Array.from(
        { length: numberOfTicksWithMaximumCoverage },
        (_, i) =>
          data.xs.findLastIndex(
            (xDataItem) =>
              xDataItem <= (i + 1) * distanceBetweenTicksWithMaximumCoverage &&
              xDataItem > i * distanceBetweenTicksWithMaximumCoverage,
          ),
      );
      finalDistanceBetweenTicks = distanceBetweenTicksWithMaximumCoverage;
    } else {
      tickValues = [
        ...Array(Math.min(maximumNumberOfTicks, data.xs.length)).keys(),
      ];
      finalDistanceBetweenTicks = 1;
    }

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat((_, i) => ((i + 1) * finalDistanceBetweenTicks).toString());

    svgContainer
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call((g) => g.select('.domain').remove()) // remove baseline
      .call((g) =>
        g.selectAll('line').attr('stroke', '#CAD3DD').attr('y1', -height),
      )
      .call((g) => g.selectAll('text').attr('font-size', '8px'));

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([0, 0.5, 1])
      .tickFormat(d3.format('.1f'));

    svgContainer
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) => {
        g.selectAll('line').each((value, index, lines) => {
          if (value === 0.5) {
            d3.select(lines[index])
              .attr('x1', width)
              .attr('stroke', '#CAD3DD')
              .attr('stroke-dasharray', 2);
          } else {
            d3.select(lines[index]).remove();
          }
        });
      })
      .call((g) => g.selectAll('text').attr('font-size', '8px'));

    svgContainer
      .append('path')
      .datum(data.ys)
      .attr('fill', 'none')
      .attr('stroke', '#167782')
      .attr('stroke-width', 1)
      .attr('d', line);
  }, [initialData, containerWidth]);

  // rerender the chart when the size of container changes
  const resizeObserver = new ResizeObserver(
    debounce((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width !== containerWidth) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    }, 100),
  );

  useEffect(() => {
    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [svgRef, containerWidth]);

  return (
    <StyledHydrophobicityChartSvg
      data-testid="Hydrophobicity-Chart"
      ref={svgRef}
    ></StyledHydrophobicityChartSvg>
  );
};

const PeptideProperties = (props: PeptidePropertiesProps) => {
  return props.isError ? (
    <TabContentErrorWrapper>
      <TabContentErrorTitle>No Data Available</TabContentErrorTitle>
      <TabContentErrorDescription>
        Select monomer, chain or part of a chain
      </TabContentErrorDescription>
    </TabContentErrorWrapper>
  ) : (
    <TabContentWrapper>
      <PeptideBasicPropertiesWrapper>
        <BasicPropertiesWrapper>
          <BasicProperty
            name="Isoelectric Point"
            testId="Isoelectric Point"
            value={
              isNumber(props.macromoleculesProperties.pKa)
                ? _round(props.macromoleculesProperties.pKa, 2)
                : '–'
            }
            hint="The isoelectric point is calculated as the median of all pKa values for the structure."
          />
          <BasicProperty
            name="Extinction Coef.(1/Mcm)"
            testId="Extinction Coefficient"
            value={
              isNumber(props.macromoleculesProperties.extinctionCoefficient)
                ? _round(props.macromoleculesProperties.extinctionCoefficient)
                : '–'
            }
            hint={
              <div>
                The extinction coefficient for wavelength of 280nm is calculated
                using the method from{' '}
                <i>Gill, S.C. and von Hippel, P.H. (1989).</i> Natural analogue
                is used in place of a modified amino acid.
              </div>
            }
          ></BasicProperty>
        </BasicPropertiesWrapper>
        <BasicProperty
          name="Hydrophobicity"
          testId="Hydrophobicity"
          hint={
            <div>
              <HydrophobicityHintHeader>
                <div>y = Hydrophobicity score</div>
                <div>x = Position of the amino acid residue</div>
              </HydrophobicityHintHeader>
              The hydrophobicity is calculated using the method from{' '}
              <i>Black S.D. and Mould D.R. (1991).</i> Natural analogue is used
              in place of a modified amino acid.
            </div>
          }
        />
      </PeptideBasicPropertiesWrapper>
      <PeptidePropertiesBottomPart>
        {props.macromoleculesProperties.monomerCount.peptides && (
          <MonomersCountPanel
            monomerCount={props.macromoleculesProperties.monomerCount.peptides}
            isPeptide
          />
        )}
        <HydrophobicityChartWrapper>
          {props.macromoleculesProperties.hydrophobicity && (
            <HydrophobicityChart
              data={props.macromoleculesProperties.hydrophobicity}
            />
          )}
        </HydrophobicityChartWrapper>
      </PeptidePropertiesBottomPart>
    </TabContentWrapper>
  );
};

const containOnlyPartOfNumber = (value: number) => {
  return !/[^0.,]/.test(String(value));
};

const RnaProperties = (props: DnaRnaPropertiesProps) => {
  const dispatch = useAppDispatch();
  const unipositiveIonsMeasurementUnit = useAppSelector(
    selectUnipositiveIonsMeasurementUnit,
  );
  const oligonucleotidesMeasurementUnit = useAppSelector(
    selectOligonucleotidesMeasurementUnit,
  );
  const unipositiveIonsValue = useAppSelector(selectUnipositiveIonsValue);
  const oligonucleotidesValue = useAppSelector(selectOligonucleotidesValue);

  const onChangeUnipositiveIonsMeasurementUnit = (option: string) => {
    dispatch(setUnipositiveIonsMeasurementUnit(option as MolarMeasurementUnit));
  };

  const onChangeOligonucleotidesMeasurementUnit = (option: string) => {
    dispatch(
      setOligonucleotidesMeasurementUnit(option as MolarMeasurementUnit),
    );
  };

  const onChangeUnipositiveIonsValue = (value: number) => {
    dispatch(setUnipositiveIonsValue(value.toString()));
  };

  const onChangeOligonucleotidesValue = (value: number) => {
    dispatch(setOligonucleotidesValue(value.toString()));
  };

  return props.isError ? (
    <TabContentErrorWrapper>
      <TabContentErrorTitle>No Data Available</TabContentErrorTitle>
      <TabContentErrorDescription>
        Select a nucleotide/nucleoside, chain or part of a chain containing
        nucleotides/nucleosides
      </TabContentErrorDescription>
    </TabContentErrorWrapper>
  ) : (
    <TabContentWrapper>
      <RnaBasicPropertiesWrapper>
        {isNumber(props.macromoleculesProperties.Tm) ? (
          <BasicProperty
            name="Melting Temp. (°C)"
            value={_round(props.macromoleculesProperties.Tm, 1)}
            testId="Melting-Temperature"
            hint={
              <div>
                The melting temperature is calculated using the method from{' '}
                <i>Khandelwal G. and Bhyravabhotla J. (2010).</i> Natural
                analogue is used in place of a modified base.
              </div>
            }
          />
        ) : (
          <div></div>
        )}
        <BasicPropertiesWrapper>
          <BasicProperty
            name="[Unipositive Ions]"
            value={unipositiveIonsValue}
            options={['nM', 'μM', 'mM']}
            testId="Unipositive Ions"
            selectedOption={unipositiveIonsMeasurementUnit}
            disabled={
              !isNumber(props.macromoleculesProperties.Tm) &&
              !containOnlyPartOfNumber(unipositiveIonsValue)
            }
            onChangeOption={onChangeUnipositiveIonsMeasurementUnit}
            onChangeValue={onChangeUnipositiveIonsValue}
          />
          <BasicProperty
            name="[Oligonucleotides]"
            value={oligonucleotidesValue}
            options={['nM', 'μM', 'mM']}
            testId="Oligonucleotides"
            selectedOption={oligonucleotidesMeasurementUnit}
            disabled={
              !isNumber(props.macromoleculesProperties.Tm) &&
              !containOnlyPartOfNumber(oligonucleotidesValue)
            }
            onChangeOption={onChangeOligonucleotidesMeasurementUnit}
            onChangeValue={onChangeOligonucleotidesValue}
          />
        </BasicPropertiesWrapper>
      </RnaBasicPropertiesWrapper>
      {props.macromoleculesProperties.monomerCount.nucleotides && (
        <MonomersCountPanel
          monomerCount={props.macromoleculesProperties.monomerCount.nucleotides}
        />
      )}
    </TabContentWrapper>
  );
};

enum PROPERTIES_TABS {
  PEPTIDES = 0,
  RNA = 1,
  NO_TAB = -1,
}

enum MassMeasurementUnit {
  Da = 'Da',
  kDa = 'kDa',
  MDa = 'MDa',
}

const massMeasurementUnitToNumber = {
  [MassMeasurementUnit.Da]: 1,
  [MassMeasurementUnit.kDa]: 1000,
  [MassMeasurementUnit.MDa]: 1000000,
};

const calculateMassMeasurementUnit = (mass?: number) => {
  if (!isNumber(mass)) {
    return MassMeasurementUnit.Da;
  }

  if (mass < 1000) {
    return MassMeasurementUnit.Da;
  }

  if (mass < 1000000) {
    return MassMeasurementUnit.kDa;
  }

  return MassMeasurementUnit.MDa;
};

let selectEntitiesHandler: () => void;

export const MacromoleculePropertiesWindow = () => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);
  const macromoleculesProperties = useAppSelector(
    selectMacromoleculesProperties,
  );
  const unipositiveIonsMeasurementUnit = useAppSelector(
    selectUnipositiveIonsMeasurementUnit,
  );
  const oligonucleotidesMeasurementUnit = useAppSelector(
    selectOligonucleotidesMeasurementUnit,
  );
  const unipositiveIonsValue = useAppSelector(selectUnipositiveIonsValue);
  const oligonucleotidesValue = useAppSelector(selectOligonucleotidesValue);

  const firstMacromoleculesProperties:
    | SingleChainMacromoleculeProperties
    | undefined = macromoleculesProperties?.[0];

  const [selectedTabIndex, setSelectedTabIndex] = useState(
    PROPERTIES_TABS.PEPTIDES,
  );
  const [massMeasurementUnit, setMassMeasurementUnit] = useState(
    calculateMassMeasurementUnit(firstMacromoleculesProperties?.mass),
  );

  const isMacromoleculesPropertiesWindowOpened = useAppSelector(
    selectIsMacromoleculesPropertiesWindowOpened,
  );
  const recalculateMacromoleculeProperties =
    useRecalculateMacromoleculeProperties();
  const skipDataFetch = !isMacromoleculesPropertiesWindowOpened;
  const recalculateMacromoleculePropertiesRef = useRef<
    (shouldSkip?: boolean) => void
  >(recalculateMacromoleculeProperties);
  const debouncedRecalculateMacromoleculeProperties = useCallback(
    debounce((shouldSkip?: boolean) => {
      recalculateMacromoleculePropertiesRef.current(shouldSkip);
    }, 500),
    [],
  );

  useEffect(() => {
    recalculateMacromoleculePropertiesRef.current = (shouldSkip?: boolean) => {
      recalculateMacromoleculeProperties(shouldSkip);
    };
  }, [recalculateMacromoleculeProperties]);

  useEffect(() => {
    if (
      selectEntitiesHandler &&
      editor?.events.selectEntities.hasHandler(selectEntitiesHandler)
    ) {
      editor?.events.selectEntities.remove(selectEntitiesHandler);
    }

    selectEntitiesHandler = () => {
      debouncedRecalculateMacromoleculeProperties(skipDataFetch);
    };

    editor?.events.selectEntities.add(selectEntitiesHandler);

    return () => {
      editor?.events.selectEntities.remove(selectEntitiesHandler);
    };
  }, [debouncedRecalculateMacromoleculeProperties, editor, skipDataFetch]);

  useEffect(() => {
    debouncedRecalculateMacromoleculeProperties(skipDataFetch);
  }, [
    unipositiveIonsMeasurementUnit,
    oligonucleotidesMeasurementUnit,
    unipositiveIonsValue,
    oligonucleotidesValue,
    skipDataFetch,
    debouncedRecalculateMacromoleculeProperties,
  ]);

  useEffect(() => {
    setSelectedTabIndex(
      hasSpecificProperty(firstMacromoleculesProperties, 'nucleotides')
        ? PROPERTIES_TABS.RNA
        : PROPERTIES_TABS.PEPTIDES,
    );
    setMassMeasurementUnit(
      calculateMassMeasurementUnit(firstMacromoleculesProperties?.mass),
    );
  }, [firstMacromoleculesProperties]);

  const onTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
  };

  const closeWindow = () => {
    dispatch(setMacromoleculesPropertiesWindowVisibility(false));
  };

  const onMassMeasurementUnitChange = (option: string) => {
    setMassMeasurementUnit(option as MassMeasurementUnit);
  };

  const hasCommonError =
    !firstMacromoleculesProperties || macromoleculesProperties.length > 1;
  const hasPeptidesTabError =
    hasCommonError ||
    !hasSpecificProperty(firstMacromoleculesProperties, 'peptides');
  const hasNucleotidesTabError =
    hasCommonError ||
    !hasSpecificProperty(firstMacromoleculesProperties, 'nucleotides');

  const grossFormula = useMemo(() => {
    if (!firstMacromoleculesProperties?.grossFormula) {
      return null;
    }

    return (
      <GrossFormula data-testid="Gross-formula">
        {firstMacromoleculesProperties?.grossFormula
          .split(' ')
          .map((atomNameWithAmount) => (
            <GrossFormulaPart
              part={atomNameWithAmount}
              key={atomNameWithAmount}
            />
          ))}
      </GrossFormula>
    );
  }, [firstMacromoleculesProperties?.grossFormula]);

  const molecularMassValue = useMemo(() => {
    if (!firstMacromoleculesProperties?.mass) {
      return null;
    }

    return (
      <>
        <MolecularMassAmount data-testid="Molecular-Mass-Value">
          {_round(
            firstMacromoleculesProperties?.mass /
              massMeasurementUnitToNumber[massMeasurementUnit],
            3,
          )}
        </MolecularMassAmount>{' '}
      </>
    );
  }, [firstMacromoleculesProperties?.mass, massMeasurementUnit]);

  return isMacromoleculesPropertiesWindowOpened ? (
    <StyledWrapper
      hasError={
        (selectedTabIndex === PROPERTIES_TABS.PEPTIDES &&
          hasPeptidesTabError) ||
        (selectedTabIndex === PROPERTIES_TABS.RNA && hasNucleotidesTabError)
      }
    >
      <WindowControlsArea>
        <WindowDragControl>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 6H14" stroke="#333333" />
            <path d="M2 10H14" stroke="#333333" />
          </svg>
        </WindowDragControl>
        <StyledCloseIcon
          name="close"
          onClick={closeWindow}
          dataTestId="macromolecule-properties-close"
        />
      </WindowControlsArea>
      <Header>
        {grossFormula}
        {molecularMassValue && (
          <MolecularMass>
            {molecularMassValue}
            <BasicPropertyDropdown
              testId="Molecular Mass Unit"
              options={[
                MassMeasurementUnit.Da,
                MassMeasurementUnit.kDa,
                MassMeasurementUnit.MDa,
              ].map((unit) => ({
                id: unit,
                label: unit,
              }))}
              currentSelection={massMeasurementUnit}
              selectionHandler={onMassMeasurementUnitChange}
            />
          </MolecularMass>
        )}
      </Header>
      <TabsWrapper>
        <Tabs
          selectedTabIndex={selectedTabIndex}
          onChange={onTabChange}
          isLayoutToRight
          tabs={[
            {
              caption: 'Peptides',
              testId: 'peptides-properties-tab',
              component: PeptideProperties,
              props: {
                macromoleculesProperties: firstMacromoleculesProperties,
                isError: hasPeptidesTabError,
              },
            },
            {
              caption: 'RNA/DNA',
              component: RnaProperties,
              testId: 'rna-properties-tab',
              props: {
                macromoleculesProperties: firstMacromoleculesProperties,
                isError: hasNucleotidesTabError,
              },
            },
          ]}
        />
      </TabsWrapper>
    </StyledWrapper>
  ) : null;
};
