import React from 'react'

export interface IErrorsContext {
  errorHandler: () => any
}

const errorsContext = React.createContext<IErrorsContext>({} as IErrorsContext)

export default errorsContext
