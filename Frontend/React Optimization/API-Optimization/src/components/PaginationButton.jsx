
const PaginationButton = ({ totalPost, postPerPage, setCurrentPage, currentPage })=> {
     let pages = []

     for(let i=1; i<=Math.ceil(totalPost/postPerPage); i++){
          pages.push(i)
     }
  return (
    <div className='w-full flex gap-2 items-center justify-center m-10'>
      {pages.map((page) => (
          <button key={page} onClick={()=>setCurrentPage(page)} className={`w-10 h-10 rounded-md border active:scale-95 ${currentPage === page ? 'bg-blue-500 text-white font-bold' : 'bg-white text-black hover:bg-gray-100'}`}>{page}</button>
      ))}
    </div>
  )
}

export default PaginationButton
