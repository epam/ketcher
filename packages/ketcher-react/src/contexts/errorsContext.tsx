import React from 'react'

const errorsContext = React.createContext((message: string) => alert(message))

export default errorsContext
