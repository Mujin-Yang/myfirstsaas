import React from 'react'
import Sidebar from '@/components/shared/Sidebar'
import MobileNav from "@/components/shared/MobileNav";
import {Toaster} from "@/components/ui/toaster";

const Layout = ({children}:{children: React.ReactNode}) => {
    return(
        <main className="root">
            {/* sidebar */}
            <Sidebar/>


            {/* mobileNav */}
            <MobileNav />


            <div className="root-container">
                <div className="wrapper">
                      {children}
                </div>
                <Toaster/>
            </div>
        </main>
    )
}
//一般在 return 里还可以放其他的公共组件比如 nav 但在这里 auth 页面你不想要


export default Layout
