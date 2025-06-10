import React from 'react'

export default async function userId(params: Promise<{ userId: string }>) {
  const { userId } = await params;
  
  return (
    <div>
      usertouser {userId}
    </div>
  )
}

