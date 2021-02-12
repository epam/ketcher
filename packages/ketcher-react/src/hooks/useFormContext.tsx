import React from 'react'
import FormContext from './../contexts/formContext'

export function useFormContext() {
  return React.useContext(FormContext)
}
