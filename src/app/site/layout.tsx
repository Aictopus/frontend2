import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import Navigation from '@/components/site/navigation'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider>
			<div className="h-full">
				<Navigation />
				{children}
			</div>
		</ClerkProvider>
	)
}

export default AuthLayout
