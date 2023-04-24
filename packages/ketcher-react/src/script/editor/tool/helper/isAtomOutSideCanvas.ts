import { Atom } from 'ketcher-core'

export function hasAtomsOutsideCanvas(atoms: Atom[], render, scale: number) {
  return atoms.some((atom) => {
    const canvasSize = render.sz
    const { offset } = render.options
    const xSize = atom.pp.x * scale
    const ySize = atom.pp.y * scale
    return (
      xSize > canvasSize.x ||
      xSize + offset.x < 0 ||
      ySize > canvasSize.y ||
      ySize + offset.y < 0
    )
  })
}
