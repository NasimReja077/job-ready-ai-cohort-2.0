import React from 'react'
import UserCard from '../components/UserCard'
// import Skeleton from '../components/Skeleton';

const Users = () => {

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

  const users = [
    {
      id: 101,
      name: "Nasim Reja",
      email: "nasim@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 102,
      name: "Rahul Das",
      email: "rahul@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 103,
      name: "Samole Roy",
      email: "roy@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
   <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3 bg-amber-200">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
        />
      ))}
    </div>
  )
}

export default Users



// React uses the key prop to match list items between renders. Get it wrong, and React can confuse which item is which — causing subtle bugs like input fields losing focus, wrong items animating, or state attaching to the wrong row.

// Bad vs Good
// // Bad — index changes when the list reorders
// key={index}

// // Good — stable, unique, tied to the actual data
// key={item.id}

/**
Why does React need key?

Suppose your users are:

1 → Nasim
2 → Rahul
3 → Arif

React creates:

User #1 → Nasim
User #2 → Rahul
User #3 → Arif

Now suppose Rahul is deleted:

1 → Nasim
3 → Arif

With proper keys:

key=1 → Nasim    ← unchanged
key=3 → Arif     ← unchanged

React knows exactly which item was removed.

Without proper keys, React has a harder time determining what changed and may perform unnecessary DOM/component work.




2. Why key={index} is not always good

You might see:

users.map((user, index) => (
  <UserCard key={index} user={user} />
))

This works for static lists, but can cause problems when the list changes.

For example:

Before:

index 0 → Nasim
index 1 → Rahul
index 2 → Arif

Delete Nasim:

After:

index 0 → Rahul
index 1 → Arif

React thinks:

index 0 → same component
index 1 → same component

But the actual users changed.

With IDs:

Before:

101 → Nasim
102 → Rahul
103 → Arif

After:

102 → Rahul
103 → Arif

React can accurately understand:

101 → removed
102 → unchanged
103 → unchanged
 */

