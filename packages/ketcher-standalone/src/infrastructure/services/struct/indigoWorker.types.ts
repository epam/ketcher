export enum Command {
  Info = 'info',
  Convert = 'convert',
  Layout = 'layout',
  Clean = 'clean',
  Aromatize = 'aromatize',
  Dearomatize = 'dearomatize',
  CalculateCip = 'calculateCip',
  Automap = 'automap',
  Check = 'check',
  Calculate = 'calculate',
  Recognize = 'recognize'
}

export interface OutputMessage<T> {
  hasError?: boolean
  payload: T
  error?: string
}

export interface InputMessage<T> {
  type: Command
  args: T
}

export interface CleanCommandData {}
