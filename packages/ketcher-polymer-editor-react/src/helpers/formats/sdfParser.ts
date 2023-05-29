import { SdfSerializer } from 'ketcher-core'
import monomersData from '../../data/monomers.sdf'

const serializer = new SdfSerializer()

export function parseSdf() {
  return serializer.deserialize(monomersData)
}
