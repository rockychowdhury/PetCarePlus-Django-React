import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export const PageLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

export default PageLayout
