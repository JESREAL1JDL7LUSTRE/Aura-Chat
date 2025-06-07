"use client"
import { useSession } from "next-auth/react"
import React from 'react'

const Friends = () => {
  const { status } = useSession()
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
      {status === "authenticated" ? (
      <div className='p-4 bg-white shadow-md rounded-lg w-full max-w-xs'>
        Friends
        <p>List of friends will be displayed here.</p>
          <ul className="list-disc pl-5">
              <li>Friend 1</li>
              <li>Friend 2</li>
              <li>Friend 3</li>
          </ul>
      </div>
      ) : (
        <></>
      )}
    </div>
  )
}

export default Friends
