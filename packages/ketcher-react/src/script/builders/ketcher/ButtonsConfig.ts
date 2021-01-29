import { ButtonConfig } from './ButtonConfig'
import { ButtonName } from './ButtonName'

export type ButtonsConfig = {
  [buttonName in ButtonName]: ButtonConfig
}
