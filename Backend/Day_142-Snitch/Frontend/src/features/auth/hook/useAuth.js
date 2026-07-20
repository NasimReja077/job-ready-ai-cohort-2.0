import { setError, setLoading, setUser } from "../state/auth.slice"
import { register, login } from "../service/auth.api"
import { useDispatch } from "react-redux"

export const useAuth = () => {
     const dispatchh = useDispatch()

     async function handleRegister({ email, contact, password, fullname, isSeller = false }){
          const data = await register({ email, contact, password, fullname, isSeller })
          dispatchEvent(setUser(data.user))
          dispatchh(setUser(data.user))
     }

     async function handleLogin({ email, password }){
          const data = await login({ email, password })
          dispatchh(setUser(data.user))
     }

     return { handleRegister, handleLogin }
}