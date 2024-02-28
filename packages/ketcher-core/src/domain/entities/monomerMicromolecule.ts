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
import { SGroup } from 'domain/entities/sgroup';
import { Struct } from 'domain/entities/struct';
import assert from 'assert';

export class MonomerMicromolecule extends SGroup {
  constructor(type: string, public monomer) {
    super(type);
    this.data.absolute = false;
    this.data.attached = false;
  }

  public override getContractedPosition(struct: Struct) {
    assert(this.pp);
    const sgroupContractedPosition = super.getContractedPosition(struct);
    return { position: this.pp, atomId: sgroupContractedPosition.atomId };
  }

  public static clone(monomerMicromolecule: MonomerMicromolecule) {
    const monomerMicromoleculeClone = new MonomerMicromolecule(
      monomerMicromolecule.type,
      monomerMicromolecule.monomer,
    );
    monomerMicromoleculeClone.pp = monomerMicromolecule.pp;
    monomerMicromoleculeClone.atoms = monomerMicromolecule.atoms;

    return monomerMicromoleculeClone;
  }
}
