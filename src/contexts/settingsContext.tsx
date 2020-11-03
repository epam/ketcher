import React from 'react'

export interface ISettingsContext {
  staticResourcesUrl: string
}

const settingsContext = React.createContext<ISettingsContext>(
  {} as ISettingsContext
)

export default settingsContext
