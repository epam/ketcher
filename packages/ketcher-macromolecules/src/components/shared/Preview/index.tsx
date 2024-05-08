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
import MonomerWithIDTAliasesPreview from 'components/shared/MonomerWithIDTAliasesPreview';
import { useAppSelector } from 'hooks';
import { KetMonomerClass } from 'ketcher-core';
import { selectShowPreview } from 'state/common';
import NucleotidePreview from '../NucleotidePreview';
import MonomerPreview from '../MonomerPreview';

export const Preview = () => {
  const preview = useAppSelector(selectShowPreview);

  if (preview?.nucleotide) {
    return <NucleotidePreview />;
  }

  const ketMonomerWithIDTAliasesClassSet = new Set<KetMonomerClass>([
    KetMonomerClass.Base,
    KetMonomerClass.CHEM,
    KetMonomerClass.Phosphate,
    KetMonomerClass.Sugar,
  ]);
  const monomerClass = preview?.monomer?.props.MonomerClass;
  if (ketMonomerWithIDTAliasesClassSet.has(monomerClass)) {
    return <MonomerWithIDTAliasesPreview />;
  }

  return <MonomerPreview className="polymer-library-preview" />;
};
