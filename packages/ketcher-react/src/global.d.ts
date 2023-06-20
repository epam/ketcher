import { Ketcher } from 'ketcher-core'

declare global {
  export interface Window {
    ketcher?: Ketcher
  }
}
