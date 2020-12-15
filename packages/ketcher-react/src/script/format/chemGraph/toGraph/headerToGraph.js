import rootSchema from '../../schemes/rootSchema'
import { ifDef } from '../../utils'

export function headerToGraph(struct) {
  const header = {}

  const headerSchema = rootSchema.header.properties
  ifDef(header, 'moleculeName', struct.name, headerSchema.moleculeName.default)
  ifDef(header, 'creatorProgram', null, headerSchema.moleculeName.default)
  ifDef(header, 'comment', null, headerSchema.moleculeName.default)

  return Object.keys(header).length !== 0 ? header : null
}
