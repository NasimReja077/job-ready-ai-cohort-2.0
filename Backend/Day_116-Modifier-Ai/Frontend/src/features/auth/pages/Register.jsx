import React, { useState } from 'react'
import "../style/register.scss"
import FormGroup from '../components/FormGroup'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'

const Register = () => {
     const [ username, setUsername ] = useState("")
     const [ email, setEmail ] = useState("")
     const [ password, setPassword ] = useState("")

     const navigate = useNavigate()
     const { loading, handleRegister } = useAuth()

     async function handleSubmit(e) {
          e.preventDefault()
          await handleRegister({ username, password, email })

          navigate('/')
     }

     return(
          <main className="register-page">
               <h1>Registr</h1>
               <form onSubmit={handleSubmit}>
                    <FormGroup
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         label="Name" placeholdeer="Enter you name" />
                         
                    <FormGroup
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         label="Email" placeholdeer="Enter you email" />
                         
                    <FormGroup
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         label="Password" placeholdeer="Enter you password" /> 
               <button className='button' type='submit'>Register</button>
               </form>
               <p>Already have an account? <Link to="/login">Login here</Link></p>
          </main>
     )


}

export default Register;