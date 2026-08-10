
const PaginationButton = ({ totalPost, postPerPage, setCurrentPage })=> {
     let pages = []

     for(let i=1; i<=Math.ceil(totalPost/postPerPage); i++){
          pages.push(i)
     }
  return (
    <div className='w-full flex gap-2 items-center justify-center m-10'>
      {pages.map((page) => (
          <button key={page} onClick={()=>setCurrentPage(page)} className='w-10 active:scale-95 h-10 rounded-md border'>{page}</button>
      ))}
    </div>
  )
}

export default PaginationButton
