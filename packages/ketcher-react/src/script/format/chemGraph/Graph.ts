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
