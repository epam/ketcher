export const isGenericGroup = (group) => {
  const cyclicGroups = [
    'Acyclic',
    'Cyclic',
    'Acyclic Carbo',
    'Cyclic Carbo',
    'Acyclic Hetero',
    'Cyclic Hetero'
  ]
  return cyclicGroups.includes(group)
}
