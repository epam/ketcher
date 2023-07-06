import { ChangeEvent } from 'react'

export interface IRnaEditorExpandedProps {
  name: string
  onCancel: () => void
  onChangeName: (event: ChangeEvent<HTMLInputElement>) => void
}
