/****************************************************************************
 * Copyright 2020 EPAM Systems
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
import jsonschema from 'jsonschema'

import structSchema from './schemes/moleculeSchema'
import rgroupSchema from './schemes/rgroupSchema'
import { plusSchema, arrowSchema } from './schemes/rxnSchemas'
import simpleObjectSchema from './schemes/simpleObjectSchema'
import graphSchema from './schemes/rootSchema'

export default function validate(graph) {
  const v = new jsonschema.Validator()
  v.addSchema(structSchema, '/Molecule')
  v.addSchema(rgroupSchema, '/RGroup')
  v.addSchema(arrowSchema, '/RxnArrow')
  v.addSchema(plusSchema, '/RxnPlus')
  v.addSchema(simpleObjectSchema, '/SimpleObject')

  const res = v.validate(graph, graphSchema)
  console.log(res)
}
