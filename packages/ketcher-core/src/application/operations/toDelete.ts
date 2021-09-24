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

// import {  Struct, Vec2 } from 'domain/entities'
// import { PerformOperationResult } from './operations.types'

// import { BaseOperation } from './baseOperation'

// export class CalcImplicitH extends BaseOperation {
//   atomIds: Array<number>

//   constructor(aids: Array<number>) {
//     super('STRUCT_CALC_IMPLICIT_H', 10)
//     this.atomIds = aids
//   }

//   execute(restruct: Restruct): PerformOperationResult {
//     const aIds = this.atomIds

//     restruct.molecule.setImplicitHydrogen(aIds)

//     const inverseOperation = new CalcImplicitH(this.atomIds)

//     {
//         inverseOperation,
//     }
//   }
// }

// export class CanvasLoad extends BaseOperation {
//   #struct: Struct

//   constructor(struct: Struct) {
//     super('STRUCT_LOAD')

//     this.#struct = struct
//   }

//   execute(restruct: Restruct) {
//     const oldStruct = restruct.molecule
//     restruct.clearVisels() // TODO: What is it?
//     restruct.render.setMolecule(this.data.struct)
//     this.data.struct = oldStruct
//   }

//   invert() {
//     const inverted = new CanvasLoad()
//     inverted.data = this.data
//     return inverted
//   }
// }

// class AlignDescriptors extends BaseOperation {
//   history: any

//   constructor() {
//     super('STRUCT_ALIGN_DESCRIPTORS')
//     this.history = {}
//   }

//   execute(struct: Struct): PerformOperationResult {
//     const struct = restruct.molecule
//     const sgroups: any[] = Array.from(struct.sgroups.values()).reverse()

//     const structBox: any = struct.getCoordBoundingBoxObj()
//     let alignPoint = new Vec2(structBox.max.x, structBox.min.y).add(
//       new Vec2(2.0, -1.0)
//     )

//     sgroups.forEach(sgroup => {
//       this.history[sgroup.id] = new Vec2(sgroup.pp)
//       alignPoint = alignPoint.add(new Vec2(0.0, 0.5))
//       sgroup.pp = alignPoint
//       struct.sgroups.set(sgroup.id, sgroup)
//       BaseOperation.invalidateItem(restruct, 'sgroupData', sgroup.id, 1)
//     })
//   }

//   invert() {
//     return new RestoreDescriptorsPosition(this.history)
//   }
// }

// class RestoreDescriptorsPosition extends BaseOperation {
//   history: any

//   constructor(history: any) {
//     super(OperationType.RESTORE_DESCRIPTORS_POSITION)
//     this.history = history
//   }

//   execute(restruct: Restruct) {
//     const struct = restruct.molecule
//     const sgroups: any[] = Array.from(struct.sgroups.values())

//     sgroups.forEach(sgroup => {
//       sgroup.pp = this.history[sgroup.id]
//       struct.sgroups.set(sgroup.id, sgroup)
//       BaseOperation.invalidateItem(restruct, 'sgroupData', sgroup.id, 1)
//     })
//   }

//   invert() {
//     return new AlignDescriptors()
//   }
// }
