import { Struct } from 'chemistry'

export type Graph = {
  root: {
    nodes: {
      type: string
      location?: [number, number, number]
      prop?: any
      data?: any
    }[]
  }
  toString: () => string
}

export interface GraphManager {
  toGraph: (struct: Struct) => Graph
  fromGraph: (graph: Graph) => Struct
}
