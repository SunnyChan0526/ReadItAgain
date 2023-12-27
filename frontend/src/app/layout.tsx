import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import riatheme from './theme'
import PrimarySearchAppBar from "./appbar";
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Read It Again',
  description: 'Website for selling used books.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={riatheme}>
          <nav>
            <PrimarySearchAppBar />
          </nav>
            {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
