import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export const PageLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default PageLayout
