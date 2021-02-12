import React from 'react'
import SettingsContext from './../contexts/settingsContext'

export function useSettingsContext() {
  return React.useContext(SettingsContext)
}
