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
import { Struct } from '../entities'

export class SaltsAndSolventsProvider {
  // eslint-disable-next-line no-use-before-define
  private static instance: SaltsAndSolventsProvider
  saltsAndSolventsList: Struct[]
  constructor() {
    this.saltsAndSolventsList = []
  }

  public static getInstance(): SaltsAndSolventsProvider {
    if (!SaltsAndSolventsProvider.instance) {
      SaltsAndSolventsProvider.instance = new SaltsAndSolventsProvider()
    }
    return SaltsAndSolventsProvider.instance
  }

  public getSaltsAndSolventsList() {
    return this.saltsAndSolventsList
  }

  public setSaltsAndSolventsList(list: Struct[]): void {
    this.saltsAndSolventsList = list
  }
}
