import React from 'react'

const Layout = ({children}:{children: React.ReactNode}) => {
    return(
        <main className="auth">{children}</main>
    )
}
//一般在 return 里还可以放其他的公共组件比如 nav 但在这里 auth 页面你不想要


export default Layout;
