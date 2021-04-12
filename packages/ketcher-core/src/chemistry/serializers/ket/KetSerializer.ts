import { Struct } from 'chemistry/entities'
import { Serializer } from './../serializers.types'

export class KetSerializer implements Serializer {
  deserialize(content: string): Struct {
    return (content as any) as Struct
  }

  serialize(struct: Struct): string {
    return struct.toString()
  }
}
