import React from 'react'
import { User } from '@clerk/nextjs/server'
import { ModeToggle } from '@/components/global/mode-toggle'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'


type Props = {
	user?: null | User
}

const Navigation = ({ user }: Props) => {
	return (
		<div className="p-4 flex items-center justify-between relative">
			<aside className='flex items-center gap-2'>
        {/* <Image /> logo*/} 
        <span className="text-xl font-bold"> AIctopus.</span>

      </aside>
      {/* navbar */}

      <aside className="flex gap-2 items-center">
        <Link
          href={'/agency'}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
		</div>
	)
}

export default Navigation
