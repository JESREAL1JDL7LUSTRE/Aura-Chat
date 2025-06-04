import React from 'react'

const Friends = () => {
  return (
    <div className='p-4 bg-white shadow-md rounded-lg w-full max-w-xs'>
      Friends
      <p>List of friends will be displayed here.</p>
        <ul className="list-disc pl-5">
            <li>Friend 1</li>
            <li>Friend 2</li>
            <li>Friend 3</li>
        </ul>
    </div>
  )
}

export default Friends
