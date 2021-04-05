import React from 'react'

export interface IAppContext {
  getKetcherInstance: () => any
}

const appContext = React.createContext<IAppContext>({} as IAppContext)

export default appContext
