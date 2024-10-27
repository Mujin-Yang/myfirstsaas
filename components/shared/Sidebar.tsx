'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {SignedIn, SignedOut, UserButton} from "@clerk/nextjs";
import {navLinks} from "@/constants";
import {usePathname} from "next/navigation";
import { Button } from "@/components/ui/button"


const Sidebar = () => {
    const pathname = usePathname();
    return(
        <aside className="sidebar">
            <div className="flex size-full flex-col gap-4">
                <Link href="/" className="sidebar-logo">
                    <Image src="/assets/images/logo-text.svg" alt="logo" width={180} height={28}></Image>
                </Link>

            {/*接下来是建立更多跳转链接，但是不想一个个link 怎么办？
            建立 constants 目录
            这样可以把数据放在其他地方，在这里只用关注 jsx*/}

            <nav className="sidebar-nav">
                {/*要确保只有登陆才出现这个东西，所以要用 signin，里面的代码只有 signin 后才出现*/}
                <SignedIn>
                    <ul className="sidebar-nav_elements">
                        {/*这里通过 silce 切片，分为上下两组*/}
                        {navLinks.slice(0,6).map((link) => {
                            {/*先判断我们是不是在这个 link 上？*/
                            }
                            const isActive = link.route === pathname
                            return (
                                <li key={link.route}
                                    className={`sidebar-nav_element group ${isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'}`}>
                                    {/*这里特别特别特别坑，一定要用 ```````` 不是‘’‘’‘’
                                    在 React 中，key 属性是用于唯一标识列表中的每个元素。它帮助 React 更高效地跟踪哪些元素发生了变化、添加或删除，从而提高渲染性能。具体来说：

性能优化：React 使用 key 来比较前后状态的差异。如果没有唯一的 key，React 可能会重新渲染整个列表，而使用 key 可以只更新变化的元素，减少不必要的重渲染。

减少错误：在没有 key 的情况下，React 可能会因为不清楚哪个元素被更改、添加或删除，而导致渲染错误或应用状态异常。

唯一性：每个 key 必须在当前列表内唯一。一般使用 id 或唯一的标识符来作为 key 值。*/}
                                    <Link href={link.route} className="sidebar-link">
                                        <Image
                                            src={link.icon}
                                            alt="logo"
                                            width={24}
                                            height={24}
                                            className={`${isActive && 'brightness-200'}`}
                                        />
                                        {link.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                    <ul className="sidebar-nav_elements">
                         {navLinks.slice(6).map((link) => {
                            {/*先判断我们是不是在这个 link 上？*/
                            }
                            const isActive = link.route === pathname
                            return (
                                <li key={link.route}
                                    className={`sidebar-nav_element group ${isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'}`}>
                                    {/*这里特别特别特别坑，一定要用 ```````` 不是‘’‘’‘’
                                    在 React 中，key 属性是用于唯一标识列表中的每个元素。它帮助 React 更高效地跟踪哪些元素发生了变化、添加或删除，从而提高渲染性能。具体来说：

性能优化：React 使用 key 来比较前后状态的差异。如果没有唯一的 key，React 可能会重新渲染整个列表，而使用 key 可以只更新变化的元素，减少不必要的重渲染。

减少错误：在没有 key 的情况下，React 可能会因为不清楚哪个元素被更改、添加或删除，而导致渲染错误或应用状态异常。

唯一性：每个 key 必须在当前列表内唯一。一般使用 id 或唯一的标识符来作为 key 值。*/}
                                    <Link href={link.route} className="sidebar-link">
                                        <Image
                                            src={link.icon}
                                            alt="logo"
                                            width={24}
                                            height={24}
                                            className={`${isActive && 'brightness-200'}`}
                                        />
                                        {link.label}
                                    </Link>
                                </li>
                            )
                        })}
                        <li className="flex-center cursor-pointer gap-2 p-4">
                            <UserButton showName>

                            </UserButton>
                        </li>
                    </ul>


                </SignedIn>

                <SignedOut>
                    <Button asChild className="button bg-purple-gradient bg-cover">
                        <Link href="/sign-in">Login</Link>
                    </Button>
                </SignedOut>
            </nav>
            </div>



        </aside>
    )
}

export default Sidebar;