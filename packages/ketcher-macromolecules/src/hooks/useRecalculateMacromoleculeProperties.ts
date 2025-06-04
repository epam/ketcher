import { IndigoProvider } from 'ketcher-react';
import {
  KetcherLogger,
  SingleChainMacromoleculeProperties,
  StructService,
} from 'ketcher-core';
import { molarMeasurementUnitToNumber } from 'state/common';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

type MacromoleculePropertiesParams = {
  serializedKet: string;
  unipositiveIonsValue: number;
  unipositiveIonsMeasurementUnit: string;
  oligonucleotidesValue: number;
  oligonucleotidesMeasurementUnit: string;
};

export const macromoleculePropertiesApi = createApi({
  reducerPath: 'macromoleculePropertiesApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getMacromoleculeProperties: builder.query<
      SingleChainMacromoleculeProperties[] | null,
      MacromoleculePropertiesParams
    >({
      queryFn: async (params) => {
        try {
          const {
            serializedKet,
            unipositiveIonsValue,
            unipositiveIonsMeasurementUnit,
            oligonucleotidesValue,
            oligonucleotidesMeasurementUnit,
          } = params;

          const indigo = IndigoProvider.getIndigo() as StructService;

          const response = await indigo.calculateMacromoleculeProperties(
            { struct: serializedKet },
            {
              upc:
                unipositiveIonsValue /
                molarMeasurementUnitToNumber[unipositiveIonsMeasurementUnit],
              nac:
                oligonucleotidesValue /
                molarMeasurementUnitToNumber[oligonucleotidesMeasurementUnit],
            },
          );

          if (response.properties) {
            const macromoleculeProperties = JSON.parse(response.properties);
            return { data: macromoleculeProperties };
          }

          return {
            data: null,
          };
        } catch (e) {
          KetcherLogger.error(
            'Error occurred while fetching macromolecule properties:',
            e,
          );

          return {
            error: {
              status: 'CUSTOM_ERROR',
              data: e,
            },
          };
        }
      },
    }),
  }),
});

export const { useGetMacromoleculePropertiesQuery } =
  macromoleculePropertiesApi;
