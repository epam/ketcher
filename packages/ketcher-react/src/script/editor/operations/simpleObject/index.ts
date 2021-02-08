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
import { SimpleObjectDelete } from './simpleObjectDelete'
import { SimpleObjectAdd } from './simpleObjectAdd'
import Base from '../base'
import { SimpleObjectMove } from './simpleObjectMove'
import { SimpleObjectResize } from './simpleObjectResize'

class SimpleObjectAddImpl extends SimpleObjectAdd {
  invert(): Base {
    //@ts-ignore
    return new SimpleObjectDelete(this.data.id)
  }
}

class SimpleObjectDeleteImpl extends SimpleObjectDelete {
  invert(): Base {
    return new SimpleObjectAdd(
      this.data.pos,
      this.data.mode,
      this.data.toCircle
    )
  }
}

class SimpleObjectMoveImpl extends SimpleObjectMove {
  invert(): Base {
    const move = new SimpleObjectMove(
      this.data.id,
      this.data.d,
      this.data.noinvalidate
    )
    //todo why this is needed?
    move.data = this.data
    return move
  }
}

class SimpleObjectResizeImpl extends SimpleObjectResize {
  invert(): Base {
    return new SimpleObjectResize(
      this.data.id,
      this.data.d,
      this.data.current,
      this.data.anchor,
      this.data.noinvalidate,
      this.data.toCircle
    )
  }
}

export {
  SimpleObjectAddImpl as SimpleObjectAdd,
  SimpleObjectDeleteImpl as SimpleObjectDelete,
  SimpleObjectMoveImpl as SimpleObjectMove,
  SimpleObjectResizeImpl as SimpleObjectResize
}
