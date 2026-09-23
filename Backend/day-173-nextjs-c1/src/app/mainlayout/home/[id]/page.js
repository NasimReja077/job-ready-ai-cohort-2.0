import React from 'react'

const page = async ({ params })=> {
  // console.log(params) -> object
  let { id } = await params;
  return (
    <div>
      <h1>This is common page jisme dynamic id ayegi - {id}</h1>
    </div>
  )
}

export default page
