import type React from "react"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.className}>
      <head>
        <title>ឧបករណ៍បង្កើតម៉ូដែល 3D</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { 
              background: radial-gradient(ellipse at center, #0f0f0f 0%, #000000 100%);
              margin: 0;
              padding: 0;
            }
          `,
          }}
        />
      </head>
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}

export const metadata = {
  generator: "v0.dev",
}
