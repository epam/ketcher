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
  selectEditor,
  selectIsMacromoleculesPropertiesWindowOpened,
  selectMacromoleculesProperties,
} from 'state/common';
import styled from '@emotion/styled';
import _round from 'lodash/round';
import _map from 'lodash/map';
import { Tabs } from 'components/shared/Tabs';
import { FC } from 'react';
import { SingleChainMacromoleculeProperties } from 'ketcher-core';
import { Icon } from 'ketcher-react';

const StyledWrapper = styled('div')<{ isActive?: boolean }>(
  ({ theme, isActive }) => ({
    width: '100%',
    height: '177px',
    position: 'relative',
    bottom: '177px',
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

const WindowCloseControl = styled('div')(() => ({
  flex: 0,
  padding: '0 8px',
}));

const Header = styled('div')(() => ({
  display: 'flex',
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

const BasicPropertiesWrapper = styled('div')(() => ({
  display: 'flex',
  padding: '4px 8px',
  gap: '24px',
}));

const StyledBasicProperty = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const BasicPropertyName = styled('div')(() => ({
  fontSize: '10px',
  paddingRight: '5px',
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

const StyledMonomersCountPanel = styled('div')(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px 6px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '6px',
}));

const StyledMonomersCountPanelItem = styled('div')<{
  monomerShortName: string;
  isPeptide?: boolean;
}>`
  display: flex;
  position: relative;
  justify-content: space-between;
  width: 74px;
  background-color: #eff2f5;
  padding: 4px 6px;
  font-weight: 500;
  font-size: 12px;
  border-radius: 2px;

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
}

type DnaRnaPropertiesProps = PeptidePropertiesProps;

const PeptideProperties = (props: PeptidePropertiesProps) => {
  return (
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
      <MonomersCountPanel
        monomerCount={props.macromoleculesProperties.monomerCount.peptides}
        isPeptide
      />
    </TabContentWrapper>
  );
};

const RnaProperties = () => {
  return <TabContentWrapper>Rna/Dna Properties</TabContentWrapper>;
};

export const MacromoleculePropertiesWindow = () => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);
  const isMacromoleculesPropertiesWindowOpened = useAppSelector(
    selectIsMacromoleculesPropertiesWindowOpened,
  );
  const macromoleculesProperties = useAppSelector(
    selectMacromoleculesProperties,
  );

  return isMacromoleculesPropertiesWindowOpened ? (
    <StyledWrapper>
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
        <WindowCloseControl>
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.71281 4.01204L7.97644 7.27566L7.2521 8L3.98847 4.73638L0.747391 7.97695L0.0230518 7.25261L3.26414 4.01204L0 0.747903L0.724339 0.023564L3.98847 3.2877L7.27566 0L8 0.724339L4.71281 4.01204Z"
              fill="#333333"
            />
          </svg>
        </WindowCloseControl>
      </WindowControlsArea>
      <Header>
        <GrossFormula>
          {macromoleculesProperties?.grossFormula
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
              macromoleculesProperties?.mass < 1
                ? macromoleculesProperties?.mass * 1000
                : macromoleculesProperties?.mass < 1000
                ? macromoleculesProperties?.mass
                : macromoleculesProperties?.mass / 1000,
              3,
            )}
          </MolecularMassAmount>{' '}
          {macromoleculesProperties?.mass < 1
            ? 'Da'
            : macromoleculesProperties?.mass < 1000
            ? 'kDa'
            : 'MDa'}
        </MolecularMass>
      </Header>
      <TabsWrapper>
        <Tabs
          isLayoutToRight
          tabs={[
            {
              caption: 'Peptides',
              component: PeptideProperties,
              props: {
                macromoleculesProperties,
              },
            },
            {
              caption: 'RNA/DNA',
              component: RnaProperties,
              props: {
                macromoleculesProperties,
              },
            },
          ]}
        />
      </TabsWrapper>
    </StyledWrapper>
  ) : null;
};
