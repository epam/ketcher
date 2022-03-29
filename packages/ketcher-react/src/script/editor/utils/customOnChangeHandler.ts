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

import { OperationType } from 'ketcher-core'

type Position = {
  x: number
  y: number
}

type ArrowPosition = [Position, Position]

type Data = {
  operation: any
  id?: number
  label?: string
  position?: Position | ArrowPosition
  attribute?: any
  from?: any
  to?: any
  atomId?: any
  fragId?: any
  sGroupId?: any
  type?: any
  mode?: any
}

export function customOnChangeHandler(action, handler) {
  const data: Data[] = []

  action.operations.reverse().forEach((operation) => {
    const op = operation._inverted
    switch (op.type) {
      case OperationType.ATOM_ADD:
      case OperationType.ATOM_DELETE:
        data.push({
          operation: op.type,
          id: op.data.aid,
          label: op.data.atom.label ? op.data.atom.label : '',
          position: {
            x: +op.data.pos.x.toFixed(2),
            y: +op.data.pos.y.toFixed(2)
          }
        })
        break

      case OperationType.ATOM_ATTR:
        data.push({
          operation: operation.type,
          id: operation.data.aid,
          attribute: operation.data.attribute,
          from: operation.data.value,
          to: operation.data2.value
        })
        break

      case OperationType.ATOM_MOVE:
        data.push({
          operation: op.type,
          id: op.data.aid,
          position: {
            x: +op.data.d.x.toFixed(2),
            y: +op.data.d.y.toFixed(2)
          }
        })
        break

      case OperationType.BOND_ADD:
      case OperationType.BOND_DELETE:
        data.push({
          operation: op.type,
          id: op.data.bid
        })
        break

      case OperationType.FRAGMENT_ADD:
      case OperationType.FRAGMENT_DELETE:
        data.push({
          operation: op.type,
          id: op.frid
        })
        break

      case OperationType.FRAGMENT_ADD_STEREO_ATOM:
      case OperationType.FRAGMENT_DELETE_STEREO_ATOM:
        data.push({
          operation: op.type,
          atomId: op.data.aid,
          fragId: op.data.frid
        })
        break

      case OperationType.S_GROUP_ATOM_ADD:
      case OperationType.S_GROUP_ATOM_REMOVE:
        data.push({
          operation: op.type,
          atomId: op.data.aid,
          sGroupId: op.data.sgid
        })
        break

      case OperationType.S_GROUP_CREATE:
      case OperationType.S_GROUP_DELETE:
        data.push({
          operation: op.type,
          type: op.data.type,
          sGroupId: op.data.sgid
        })
        break

      case OperationType.RXN_ARROW_ADD:
      case OperationType.RXN_ARROW_DELETE:
        data.push({
          operation: op.type,
          id: op.data.id,
          mode: op.data.mode,
          position: op.data.pos.map((pos) => ({
            x: +pos.x.toFixed(2),
            y: +pos.y.toFixed(2)
          }))
        })
        break

      case OperationType.RXN_ARROW_RESIZE:
        data.push({
          operation: op.type,
          id: op.data.id
        })
        break

      case OperationType.RXN_ARROW_MOVE:
        data.push({
          operation: op.type,
          id: op.data.id,
          position: {
            x: +op.data.d.x.toFixed(2),
            y: +op.data.d.y.toFixed(2)
          }
        })
        break

      case OperationType.R_GROUP_FRAGMENT:
        data.push({
          operation: operation.type,
          id: op.frid
        })
        break

      case OperationType.SIMPLE_OBJECT_ADD:
      case OperationType.SIMPLE_OBJECT_DELETE:
        data.push({
          operation: op.type,
          id: op.data.id,
          mode: op.data.mode
        })
        break

      case OperationType.SIMPLE_OBJECT_RESIZE:
        data.push({
          operation: op.type,
          id: op.data.id
        })
        break

      case OperationType.SIMPLE_OBJECT_MOVE:
        data.push({
          operation: operation.type,
          id: operation.data.id,
          position: {
            x: +operation.data.d.x.toFixed(2),
            y: +operation.data.d.y.toFixed(2)
          }
        })
        break

      default:
        data.push({
          operation: op.type
        })
    }
  })

  return handler(data)
}
