//主要用于定义全局环境，字体、title、用户登陆


import type { Metadata } from "next";
import { IBM_Plex_Sans } from 'next/font/google';
import { cn } from "@/lib/utils";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";


const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex'
});

export const metadata: Metadata = {
  title: "MyFirstSaaS",
  description: "AI-powered image generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl='/' appearance={{
        variables:{ colorPrimary: '#624cf5'}
    }}>
        <html lang="en">
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
        <main>{children}</main>
        </body>
        </html>
    </ClerkProvider>

      //为什么要在全局 layout 弄，因为需要在所有地方考虑用户的数据，什么地方能 access 什么地方不能
  );
}
