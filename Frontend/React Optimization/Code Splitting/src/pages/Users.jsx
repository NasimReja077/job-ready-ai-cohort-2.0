import React from 'react'
import UserCard from '../components/UserCard'
// import Skeleton from '../components/Skeleton';

function Users() {

  //  const loading = true;

  // if (loading) {
  //   return (
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  //       {Array.from({ length: 6 }).map((_, index) => (
  //         <Skeleton key={index} />
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <div>
      <UserCard/>
    </div>
  )
}

export default Users
