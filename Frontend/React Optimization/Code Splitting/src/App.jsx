import React from 'react'
import { RouterProvider } from 'react-router'
import routerProvider from './router/router.jsx'

const App =()=> {
  return (
    <RouterProvider router={routerProvider} />
  )
}

export default App
