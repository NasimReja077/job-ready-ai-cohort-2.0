import React, { useState } from 'react'
// import About from './componets/About'
import About1 from './componets/About1'

const  App =()=>{
  console.log('App rendering')
  const [count, setCount] = useState(0)
  const [user, setUser] = useState({
    name: "Nasim",
    id: 1
    
  })
  return (
    <div className='p-5'>
      <h1>Count-{count}</h1>
      <button className='py-y px-8 rounded-md bg-blue' onClick={()=>setCount(count+1)}>Increment</button>
      <button onClick={()=>setUser({...user, name="Samuale"})}>User Click</button>
      {/* <About/> */}
      {/* <About1/> */}
      <About1 user={user}/>
    </div>
  )
}

export default App

