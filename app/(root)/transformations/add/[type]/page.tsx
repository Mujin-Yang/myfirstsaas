import React from 'react'
import Header from "@/components/shared/Header";
import {transformationTypes} from "@/constants";
import TransformationForm from "@/components/shared/TransformationForm";
import {auth} from "@clerk/nextjs/server";
import {getUserById} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";


//在 Next.js 中，当你定义一个页面组件（如 AddTransformationsPage）时，Next.js 会自动为这个组件提供 props。这些 props 通常来自于路由参数、查询参数或页面初始化时的数据获取（例如 getStaticProps 或 getServerSideProps）。


const AddTransformationsPage = async ({ params }: {params: Promise<any>}) => {
   //解构赋值：({params:{type}}) 是对传入的 props 进行解构赋值。这意味着它期望 props 中有一个名为 params 的对象，而该对象中又有一个名为 type 的属性。这种写法使得从 props 中提取需要的属性更加简洁。
    // 类型注释：:SearchParamProps 是对 props 的类型定义，表示该组件期望的 props 的结构符合 SearchParamProps 类型。这有助于 TypeScript 在编译时检查类型，减少运行时错误。
    //结果：最终，你可以直接使用 type 变量，它的值就是 params 中的 type 属性的值。

    // const  userID = async () => {
    //      const { userId }: { userId: string | null } = await auth();
    //      return userId;
    // }
    // 等待获取 params

    //具体来说，params 会根据文件路径来解析 URL 中的动态部分。

    const { userId } = await auth(); // 使用 await 等待 auth() 的结果
    const { type } = await params;
    if(!userId) redirect('/sign-in');
    const user = await getUserById(userId);

    const transformation = transformationTypes[type as TransformationTypeKey];
 //当你传入的 type 为 "restore" 时，transformationTypes[type] 将返回：
    //{
    //   type: "restore",
    //   title: "Restore Image",
    //   subTitle: "Refine images by removing noise and imperfections",
    //   config: { restore: true },
    //   icon: "image.svg",
    // }



    return(
        <>
        <Header
            title={transformation.title}
            subtitle={transformation.subTitle}/>

        <section className="mt-10">
        <TransformationForm
            action="Add"
            userId={user._id}
            /*需要来自 database 的 id 而不是 clerk*/
            type={transformation.type as TransformationTypeKey}
            //如果没有 as TransformationTypeKey，TypeScript 将无法确保 transformation.type 的类型符合 TransformationTypeKey 的定义。这可能导致几个问题，具体取决于上下文和 TypeScript 的类型推断能力：
            //
            // 1. 类型推断不准确
            // 类型不明确：如果 transformation.type 的类型在 TypeScript 中不明确，TypeScript 可能会推断出一个较宽泛的类型，比如 string。这会使得在使用 type 属性时失去类型安全性，因为它可能接受任何字符串，而不仅仅是 TransformationTypeKey 中的值。
            // 2. 编译错误
            // 不兼容的类型：如果你在一个期望 TransformationTypeKey 类型的地方使用 transformation.type，而 TypeScript 没有将其识别为这个类型，可能会导致编译错误。例如，假设有一个组件接受 type 属性，只允许 'restore' | 'transform' | 'filter' 作为值，未使用类型断言时，TypeScript 可能会报错，因为它认为 transformation.type 可能是其他任何字符串。
            creditBalance={user.creditBalance}
        />
        </section>
        </>
    )
}

export default AddTransformationsPage;
