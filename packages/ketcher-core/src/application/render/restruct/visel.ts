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

// Visel is a shorthand for VISual ELement
// It corresponds to a visualization (i.e. set of paths) of an atom or a bond.
import { Box2Abs, Vec2 } from 'domain/entities'
import { RaphaelBaseElement } from 'raphael'

class Visel {
  public type: string | null // example - 'enhancedFlag'
  private paths: Array<RaphaelBaseElement>
  private boxes: Box2Abs[]
  public boundingBox: Box2Abs | null
  public exts: Box2Abs[]

  constructor(type: string) {
    this.type = type
    this.paths = []
    this.boxes = []
    this.boundingBox = null
    this.exts = []
  }

  add(path: RaphaelBaseElement, bb: Box2Abs | null, ext?: Box2Abs) {
    this.paths.push(path)
    if (bb) {
      this.boxes.push(bb)
      this.boundingBox =
        this.boundingBox == null ? bb : Box2Abs.union(this.boundingBox, bb)
    }
    if (ext) {
      this.exts.push(ext)
    }
  }

  clear() {
    this.paths = []
    this.boxes = []
    this.exts = []
    this.boundingBox = null
  }

  translate(...args: [Vec2] | [number, number]) {
    // NOTE: Do we need 'two scalar arguments' option? only Vec2 are being passed everywhere
    if (args.length > 2) {
      // TODO: replace to debug time assert
      throw new Error('One vector or two scalar arguments expected')
    }

    let x: number
    let y: number

    if (args.length === 1) {
      const vector = args[0] as Vec2
      x = vector.x
      y = vector.y
    }

    x = args[0] as number
    y = args[1] as number

    const delta = new Vec2(x, y)
    for (let i = 0; i < this.paths.length; ++i) {
      this.paths[i].translateAbs(x, y)
    }
    for (let j = 0; j < this.boxes.length; ++j) {
      this.boxes[j] = this.boxes[j].translate(delta)
    }
    if (this.boundingBox !== null) {
      this.boundingBox = this.boundingBox.translate(delta)
    }
  }
}

export default Visel
