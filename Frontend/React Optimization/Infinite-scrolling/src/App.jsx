import axios from "axios";
import { useEffect, useState } from "react";


const App = ()=> {
  const [postData, setPostData] = useState([])
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(true)

  const fetchData = async()=>{
    // const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
    // const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=12&_page=2')
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts?_limit=12&_page=${page}`)
    const data = response.data
    // setPostData(data)
    setPostData(prev=>[...prev, ...data])
    // console.log(postData)
    setLoading(false)
  }
  useEffect(()=>{
    fetchData()
  },[page])

  console.log(postData)
  
  const handleScroll = async () =>{
    console.log("SrollHeight" + document.documentElement.scrollHeight)
    console.log("InnerHeight" + window.innerHeight)
    console.log("SrollTop" + document.documentElement.scrollTop)

    if(window.innerHeight + document.documentElement.scrollTop + 1>= document.documentElement.scrollHeight){
      setPage(prev=>prev+1)
      setLoading(true)
    }
  }

  useEffect(()=>{
    window.addEventListener("scroll", handleScroll)
    return ()=> window.removeEventListener("scroll", handleScroll)
  },[])
  return (
    <div className="w-full h-screen p-5 bg-black">
      <h1 className="text-center">Hey Infinite Scrolling</h1>
      <div className="w-full mt-4 flex items-center justify-center flex-wrap gap-4">
      {postData.map((item)=>(
        <div className="w-40 h-40 rounded-md bg-cyan-800">
          <h1 className="w-20 text-center">{item.title}</h1>
        </div>
      ))}
    </div>
    {loading && <p className="text-2xl text-red-800">Loadingg....</p>}
    </div>
  )
}

export default App

