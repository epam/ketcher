export function arrowToGraph(arrowNode) {
  const coord = arrowNode.center
  return {
    type: 'arrow',
    location: [coord.x, coord.y, coord.z],
    prop: arrowNode.data,
    mode: arrowNode.mode
  }
}

export function plusToGraph(plusNode) {
  const coord = plusNode.center
  return {
    type: 'plus',
    location: [coord.x, coord.y, coord.z],
    prop: plusNode.data
  }
}
