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
export const genericsTree = {
  atom: {
    any: {
      labels: ['A', 'AH']
    },
    'no-carbon': {
      labels: ['Q', 'QH']
    },
    metal: {
      labels: ['M', 'MH']
    },
    halogen: {
      labels: ['X', 'XH']
    }
  },
  group: {
    labels: ['G', 'GH', 'G*', 'GH*'],
    acyclic: {
      labels: ['ACY', 'ACH'],
      carbo: {
        labels: ['ABC', 'ABH'],
        alkynyl: {
          labels: ['AYL', 'AYH']
        },
        alkyl: {
          labels: ['ALK', 'ALH']
        },
        alkenyl: {
          labels: ['AEL', 'AEH']
        }
      },
      hetero: {
        labels: ['AHC', 'AHH'],
        alkoxy: {
          labels: ['AOX', 'AOH']
        }
      }
    },
    cyclic: {
      labels: ['CYC', 'CYH'],
      'no-carbon': {
        labels: ['CXX', 'CXH']
      },
      carbo: {
        labels: ['CBC', 'CBH'],
        aryl: {
          labels: ['ARY', 'ARH']
        },
        cycloalkyl: {
          labels: ['CAL', 'CAH']
        },
        cycloalkenyl: {
          labels: ['CEL', 'CEH']
        }
      },
      hetero: {
        labels: ['CHC', 'CHH'],
        aryl: {
          labels: ['HAR', 'HAH']
        }
      }
    }
  },
  special: {
    labels: ['H+', 'D', 'T', 'R', 'Pol']
  }
}
