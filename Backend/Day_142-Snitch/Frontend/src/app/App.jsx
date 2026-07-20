// import { useState } from "react"
import { RouterProvider } from "react-router"
import { routes } from "./app.routes"

const App = () => {
  return (
    <>
      <h1>Hello world</h1>
      <RouterProvider router={routes}/>
    </>
  )
}

export default App