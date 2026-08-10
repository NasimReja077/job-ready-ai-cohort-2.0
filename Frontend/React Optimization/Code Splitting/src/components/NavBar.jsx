
import React, { useState } from 'react'
import { NavLink } from 'react-router'

const NavBar = () => {
  const [value, setValue] = useState('')

  return (
    <div>
      <div className='w-full flex items-center justify-between px-8 py-2 text-white'>
        <div className='flex items-center gap-3'>
          <span className='inline-block w-6 h-6 rounded-full bg-white/30' />
          <h1>Gamelist</h1>
        </div>
        <div className='flex items-center gap-5'>
          <NavLink className='text-lg font-bold' to='/'>Home</NavLink>
          <NavLink className='text-lg font-bold' to='/product'>Product</NavLink>
          <NavLink className='text-lg font-bold' to='/users'>Users</NavLink>
          <NavLink className='text-lg font-bold' to='/contact'>Contact</NavLink>
        </div>
        <div className='flex items-center gap-3'>
          <div className='bg-[#111111] flex rounded-md px-4 w-60 items-center gap-2'>
            <input
              value={value}
              type='text'
              placeholder='Search games...'
              onChange={(e) => setValue(e.target.value)}
              className='bg-neutral-900 text-white px-4 py-2 rounded w-full'
            />
          </div>
          <span className='text-sm'>User</span>
        </div>
      </div>
      <div className='w-full border-[1px] mt-2 border-zinc-500'></div>
    </div>
  )
}

export default NavBar;


