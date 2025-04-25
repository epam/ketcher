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
  selectMonomers,
  selectOligonucleotidesMeasurementUnit,
  selectSelectionChainsCollection,
  selectUnipositiveIonsMeasurementUnit,
  setMacromoleculesProperties,
  setMacromoleculesPropertiesWindowVisibility,
  setOligonucleotidesMeasurementUnit,
  setUnipositiveIonsMeasurementUnit,
} from 'state/common';
import styled from '@emotion/styled';
import _round from 'lodash/round';
import _map from 'lodash/map';
import { Tabs } from 'components/shared/Tabs';
import { FC, useEffect, useState } from 'react';
import {
  BaseMonomer,
  ChainsCollection,
  KetSerializer,
  SingleChainMacromoleculeProperties,
  Struct,
  StructService,
} from 'ketcher-core';
import { Icon, IndigoProvider } from 'ketcher-react';
import { DropDown } from 'components/shared/dropDown';
import { DrawingEntity } from 'ketcher-core/dist/domain/entities/DrawingEntity';
import { useRecalculateMacromoleculeProperties } from '../../hooks/useRecalculateMacromoleculeProperties';
import { isNumber } from 'lodash';
import { selectCurrentTabIndex } from 'state/library';

function hasNucleotideSpecificProperties(
  macromoleculesProperties: SingleChainMacromoleculeProperties,
) {
  return (
    macromoleculesProperties?.monomerCount?.nucleotides &&
    Object.keys(macromoleculesProperties.monomerCount.nucleotides).length > 0
  );
}

function hasPeptideSpecificProperties(
  macromoleculesProperties: SingleChainMacromoleculeProperties,
) {
  return !hasNucleotideSpecificProperties(macromoleculesProperties);
}

const StyledWrapper = styled('div')<{ isActive?: boolean; hasError?: boolean }>(
  ({ theme, isActive, hasError }) => ({
    width: '100%',
    height: hasError ? '124px' : '177px',
    position: 'relative',
    bottom: hasError ? '124px' : '177px',
    backgroundColor: 'white',
    padding: '2px 0',
    borderRadius: '8px 8px 0 0',
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

const GrossFormula = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  fontWeight: '700',
  padding: '0 8px',
  color: '#585858',
}));

const MolecularMass = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '24px',
  borderLeft: '1px solid #CAD3DD',
  color: '#585858',
}));

const MolecularMassAmount = styled('div')(({ theme }) => ({
  fontSize: '14px',
  fontWeight: '700',
  padding: '0 8px',
}));

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
  gap: '2px 0',
}));

const HydrophobicityChartWrapper = styled('div')(() => ({
  display: 'flex',
  padding: '4px 0px',
  height: '32px',
  gap: '12px',
}));

const RnaBasicPropertiesWrapper = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const StyledBasicProperty = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0 0 0 6px',
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

const BasicPropertyDropdown = styled(DropDown)(() => ({
  padding: '0 0 0 5px',
}));

const StyledMonomersCountPanel = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '4px 6px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '6px',
  height: '89px',
  alignContent: 'flex-start',
}));

const StyledMonomersCountPanelItem = styled('div')<{
  monomerShortName: string;
  isPeptide?: boolean;
}>`
  display: flex;
  position: relative;
  justify-content: space-between;
  //width: 74px;
  background-color: #eff2f5;
  padding: 4px 6px;
  font-weight: 500;
  font-size: 12px;
  border-radius: 2px;
  min-width: 50px;
  flex: 1;

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
  value: string | number;
  hint?: string;
  options?: string[];
  selectedOption?: string;
  onChangeOption?: (option: string) => void;
}

interface MonomersCountPanelProps {
  monomerCount: Record<string, number>;
  isPeptide?: boolean;
}

const MonomersCountPanel = (props: MonomersCountPanelProps) => {
  return (
    <StyledMonomersCountPanel>
      {_map(props.monomerCount, (count, monomerShortName) => {
        return (
          <StyledMonomersCountPanelItem
            monomerShortName={monomerShortName}
            isPeptide={props.isPeptide}
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
    <StyledBasicProperty>
      <BasicPropertyName>{props.name}:</BasicPropertyName>
      <BasicPropertyValue>{props.value}</BasicPropertyValue>
      {props.hint && (
        <PropertyHintIconWrapper title={props.hint}>
          <PropertyHintIcon name="about" />
        </PropertyHintIconWrapper>
      )}
      {props.options && props.selectedOption && props.onChangeOption && (
        <BasicPropertyDropdown
          options={props.options.map((option) => ({
            id: option,
            label: option,
          }))}
          currentSelection={props.selectedOption}
          selectionHandler={props.onChangeOption}
        />
      )}
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
      <BasicPropertiesWrapper>
        <BasicProperty
          name="Isoelectric Point"
          value={_round(props.macromoleculesProperties.pKa, 2)}
          hint="The isoelectric point is calculated as the median of all pKa values for the structure."
        />
        <BasicProperty
          name="Extinction Coef.(1/Mcm)"
          value={_round(props.macromoleculesProperties.extinctionCoefficient)}
          hint="The extinction coefficient for wavelength of 280nm is calculated using the method from Gill, S.C. and von Hippel, P.H. (1989). Only amino acid natural analogues are used in the calculation."
        ></BasicProperty>
      </BasicPropertiesWrapper>
      <PeptidePropertiesBottomPart>
        <MonomersCountPanel
          monomerCount={props.macromoleculesProperties.monomerCount.peptides}
          isPeptide
        />
      </PeptidePropertiesBottomPart>
    </TabContentWrapper>
  );
};

const RnaProperties = (props: DnaRnaPropertiesProps) => {
  const dispatch = useAppDispatch();
  const unipositiveIonsMeasurementUnit = useAppSelector(
    selectUnipositiveIonsMeasurementUnit,
  );
  const oligonucleotidesMeasurementUnit = useAppSelector(
    selectOligonucleotidesMeasurementUnit,
  );

  const onChangeUnipositiveIonsMeasurementUnit = (option: string) => {
    dispatch(setUnipositiveIonsMeasurementUnit(option as MolarMeasurementUnit));
  };

  const onChangeOligonucleotidesMeasurementUnit = (option: string) => {
    dispatch(
      setOligonucleotidesMeasurementUnit(option as MolarMeasurementUnit),
    );
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
            name="Melting temperature"
            value={_round(props.macromoleculesProperties.Tm, 1)}
            hint="The melting temperature is calculated using the method from Khandelwal G. and Bhyravabhotla J. (2010). Only base natural analogues are used in the calculation."
          />
        ) : (
          <div></div>
        )}
        <BasicPropertiesWrapper>
          <BasicProperty
            name="[Unipositive Ions]"
            value={140}
            options={['nM', 'μM', 'mM']}
            selectedOption={unipositiveIonsMeasurementUnit}
            onChangeOption={onChangeUnipositiveIonsMeasurementUnit}
          />
          <BasicProperty
            name="[Oligonucleotides]"
            value={200}
            options={['nM', 'μM', 'mM']}
            selectedOption={oligonucleotidesMeasurementUnit}
            onChangeOption={onChangeOligonucleotidesMeasurementUnit}
          />
        </BasicPropertiesWrapper>
      </RnaBasicPropertiesWrapper>
      <MonomersCountPanel
        monomerCount={props.macromoleculesProperties.monomerCount.nucleotides}
      />
    </TabContentWrapper>
  );
};

enum PROPERTIES_TABS {
  PEPTIDES = 0,
  RNA = 1,
  NO_TAB = -1,
}

export const MacromoleculePropertiesWindow = () => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);
  const macromoleculesProperties = useAppSelector(
    selectMacromoleculesProperties,
  );
  const firstMacromoleculesProperties = macromoleculesProperties?.[0];
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    PROPERTIES_TABS.PEPTIDES,
  );
  const isMacromoleculesPropertiesWindowOpened = useAppSelector(
    selectIsMacromoleculesPropertiesWindowOpened,
  );
  const recalculateMacromoleculeProperties =
    useRecalculateMacromoleculeProperties();
  const monomers = useAppSelector(selectMonomers);

  useEffect(() => {
    const selectEntitiesHandler = async (selectedEntities: DrawingEntity[]) => {
      await recalculateMacromoleculeProperties();
    };

    editor?.events.selectEntities.add(selectEntitiesHandler);

    return () => {
      editor?.events.selectEntities.remove(selectEntitiesHandler);
    };
  }, [editor]);

  useEffect(() => {
    setSelectedTabIndex(
      hasNucleotideSpecificProperties(firstMacromoleculesProperties)
        ? PROPERTIES_TABS.RNA
        : PROPERTIES_TABS.PEPTIDES,
    );
  }, [firstMacromoleculesProperties]);

  const onTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
  };

  const closeWindow = () => {
    dispatch(setMacromoleculesPropertiesWindowVisibility(false));
  };

  const hasPeptidesTabError =
    !firstMacromoleculesProperties ||
    !hasPeptideSpecificProperties(firstMacromoleculesProperties) ||
    macromoleculesProperties.length > 2;

  const hasNucleotidesTabError =
    !firstMacromoleculesProperties ||
    !hasNucleotideSpecificProperties(firstMacromoleculesProperties) ||
    macromoleculesProperties.length > 2;

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
        <StyledCloseIcon name="close" onClick={closeWindow} />
      </WindowControlsArea>
      <Header>
        {firstMacromoleculesProperties && (
          <>
            <GrossFormula>
              {firstMacromoleculesProperties?.grossFormula
                .split(' ')
                .map((atomNameWithAmount, i) => {
                  return (
                    <GrossFormulaPart
                      part={atomNameWithAmount}
                      key={i}
                    ></GrossFormulaPart>
                  );
                })}
            </GrossFormula>
            <MolecularMass>
              <MolecularMassAmount>
                {_round(
                  firstMacromoleculesProperties?.mass < 1000
                    ? firstMacromoleculesProperties?.mass
                    : firstMacromoleculesProperties?.mass < 1000000
                    ? firstMacromoleculesProperties?.mass / 1000
                    : firstMacromoleculesProperties?.mass / 1000000,
                  3,
                )}
              </MolecularMassAmount>{' '}
              {firstMacromoleculesProperties?.mass < 1000
                ? 'Da'
                : firstMacromoleculesProperties?.mass < 1000000
                ? 'kDa'
                : 'MDa'}
            </MolecularMass>
          </>
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
