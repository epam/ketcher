import React from 'react'
import FormContext from './../contexts/formContext'

export default function useFormContext() {
  return React.useContext(FormContext)
}
