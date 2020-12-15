import React from 'react'
import SettingsContext from './../contexts/settingsContext'

export default function useSettingsContext() {
  return React.useContext(SettingsContext)
}
