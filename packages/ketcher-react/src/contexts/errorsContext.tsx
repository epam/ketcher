import React from 'react'

export interface IErrorsContext {
  errorHandler: (message: string) => void
}

const errorsContext = React.createContext<IErrorsContext>({} as IErrorsContext)

export default errorsContext
