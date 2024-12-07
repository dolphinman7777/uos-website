import React from 'react'
import Link from 'next/link'

interface NavigationProps {
  // Add any props if needed
}

export const Navigation: React.FC<NavigationProps> = () => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex space-x-4">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/terminal" className="nav-link">
            Terminal
          </Link>
          <Link href="/trust" className="nav-link">
            <span className="text-green-400">Trust</span> Analysis
          </Link>
          {/* Add other navigation links as needed */}
        </div>
      </div>
    </nav>
  )
}

export default Navigation 