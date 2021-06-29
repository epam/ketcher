import { KetSerializer } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { StructFormatter } from './structFormatter.types'

export class GraphFormatter implements StructFormatter {
  constructor(private readonly serializer: KetSerializer) {}

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const graph = this.serializer.serialize(struct)
    return graph
  }

  async getStructureFromStringAsync(content: string): Promise<Struct> {
    return this.serializer.deserialize(content)
  }
}
