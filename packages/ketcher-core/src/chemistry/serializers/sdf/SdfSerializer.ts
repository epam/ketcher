import { Struct } from 'chemistry/entities'
import { Serializer } from './../serializers.types'
import { SdfSerializerOptions } from './sdf.types'

export class SdfSerializer implements Serializer {
  static DefaultOptions: SdfSerializerOptions = {}

  readonly options: SdfSerializerOptions

  constructor(options?: SdfSerializerOptions) {
    this.options = { ...SdfSerializer.DefaultOptions, ...options }
  }

  deserialize(content: string): Struct {
    return (content as any) as Struct
  }

  serialize(struct: Struct): string {
    return struct.toString()
  }
}
