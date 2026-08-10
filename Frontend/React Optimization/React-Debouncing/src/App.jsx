// Debouncing 
/*
Debouncing is a technique that makes a function execute only after the user stops triggering it for a certain amount of time.

The most common React example is a search box.

Simple definition

Debouncing waits until the activity stops, then executes the function once.

For example, if debounce time is 500ms:

User types:

N       → timer starts
Na      → timer resets
Nas     → timer resets
Nasi    → timer resets
Nasim   → timer resets

User stops typing
        ↓
      500ms
        ↓
   API request

Instead of making 5 API requests, you make 1 request.
*/

// import { useEffect, useState } from "react"

// const  App =()=>{
//   const [search, setSearch] = useState("")
//   console.log(search)

//   useEffect(() =>{
//     const timer = setTimeout(() => {
//       console.log("API Calling...", search)
//     }, 3000)

//     return () => clearTimeout(timer)
//   }, [search])

//   return (
//    <div className="m-5">
//     <input className="bg-pink" onClick={(e)=>{
//       setSearch(e.target.value)
//     }} type="text" placeholder="serach"/>
//     </div>
//   )
// }

// export default App



// Throttling

import React from 'react'
import '../src/App.css'
const  App =()=>{
  let lastClicked = 0
  const OnclickedFn = ()=>{
    const now = Date.now()
    if(now-lastClicked>=2000){
      console.log("Api Calling", now)
      lastClicked = now
    }
    // console.log(now)
  }
  OnclickedFn()
  return (
    <div>
      <button onClick={OnclickedFn} className="btn">Click</button>
    </div>
  )
}

export default App