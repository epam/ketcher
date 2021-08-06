import { RxnArrow, RxnPlus, Struct } from 'domain/entities'

export function rxnToStruct(graphItem: any, struct: Struct): Struct {
  if (graphItem.type === 'arrow') {
    struct.rxnArrows.add(new RxnArrow(graphItem.data))
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
