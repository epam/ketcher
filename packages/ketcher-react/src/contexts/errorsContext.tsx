import React from 'react'

export interface IErrorsContext {
  errorHandler: (message: string) => void
}

const errorsContext = React.createContext({} as IErrorsContext)

export default errorsContext
