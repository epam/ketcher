import { RxnArrow, RxnPlus, Struct } from 'domain/entities'

import { Vec2 } from 'utils'

export function rxnToStruct(graphItem: any, struct: Struct): Struct {
  if (graphItem.type === 'arrow') {
    struct.rxnArrows.add(
      new RxnArrow(
        new Vec2(
          graphItem.location[0],
          graphItem.location[1],
          graphItem.location[2]
        ),
        graphItem.mode
      )
    )
  } else {
    struct.rxnPluses.add(
      new RxnPlus({
        pp: {
          x: graphItem.location[0],
          y: graphItem.location[1],
          z: graphItem.location[2]
        }
      })
    )
  }
  return struct
}
