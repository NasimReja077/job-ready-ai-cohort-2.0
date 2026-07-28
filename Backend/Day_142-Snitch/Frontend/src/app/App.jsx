// import { useState } from "react"
import { RouterProvider } from "react-router"
import { routes } from "./app.routes"
import { useSelector } from "react-redux"
import { useAuth } from "../features/auth/hook/useAuth.js"
import { useEffect } from "react"

const App = () => {

  const { handleGetMe } = useAuth()

  const user = useSelector(state => state.auth.user)

  console.log(user)

  useEffect(() =>{
    handleGetMe()
  }, [handleGetMe])
  
  return (
    <>
      <RouterProvider router={routes}/>
    </>
  )
}

export default App