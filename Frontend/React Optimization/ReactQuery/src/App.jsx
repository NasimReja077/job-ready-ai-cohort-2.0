import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from './api/userApi.js'
import { lazy } from 'react'

const App = () => {

  const {data, isLoading, error} = useQuery({
    queryKey:["users"],
    queryFn:fetchUsers,
    // staleTime: 1000*60*0.3
    gcTime: 1000*60*0.3
  })
  console.log(data)

  if(isLoading){
    return <p>Loading.....</p>
  }

  if (error) return <p>Error: {error.message}</p>
  console.log(data)
  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>
          <h1>{user.title}</h1>
          <img loading="lazy" height={100} src={user.image} alt=''/>
        </div>
      ))}
    </div>
  )
}

export default App
