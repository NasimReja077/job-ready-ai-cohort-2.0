import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/themeProvider'
import './globals.css'
import React from 'react'

const layout = ({ children })=> {
  return (
    <html suppressHydrationWarning lang="en" className="h-full antialiased">
      <body className="h-screen gap-5 flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <div className="px-8 flex-1">{children}</div>
          </ThemeProvider>
      </body>
    </html>
  )
}

export default layout
