export function fromRlabel(rg) {
  const res = []
  let rgi
  let val
  for (rgi = 0; rgi < 32; rgi++) {
    if (rg & (1 << rgi)) {
      val = rgi + 1
      res.push(val) // push the string
    }
  }
  return res
}

export function toRlabel(values) {
  let res = 0
  values.forEach(val => {
    const rgi = val - 1
    res |= 1 << rgi
  })
  return res
}
