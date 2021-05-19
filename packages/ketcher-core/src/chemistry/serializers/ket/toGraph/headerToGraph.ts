import { Struct } from 'chemistry/entities'
import { ifDef } from 'utils'

export function headerToGraph(struct: Struct): any {
  const header = {}

  ifDef(header, 'moleculeName', struct.name, '')
  ifDef(header, 'creatorProgram', null, '')
  ifDef(header, 'comment', null, '')

  return Object.keys(header).length !== 0 ? header : null
}
