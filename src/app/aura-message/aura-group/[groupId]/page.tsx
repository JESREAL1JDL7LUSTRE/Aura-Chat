import React from 'react'


export default async function groupId(params: Promise<{ groupId: string }>) {
  const { groupId } = await params;
  return (
    <div>
      group {groupId}
    </div>
  )
}

