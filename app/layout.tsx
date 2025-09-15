import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {  ClerkProvider } from '@clerk/nextjs'
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "LeadHub",
  description: "LeadHub helps real estate agents and businesses manage, track, and nurture buyer leads. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={inter.className}
          >
          <Toaster/>
          <Header/>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
