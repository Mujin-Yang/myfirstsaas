import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.NEXT_PUBLIC_MONGODB_URI
//let isConnected = false;
// track the connection

//下是新增
//interface 是用于描述对象结构的工具，没有实际的实现代码。它只用来定义对象应包含哪些属性以及它们的类型。
// interface 非常轻量，可以用于多处定义对象的结构和类型。
interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;
//类型注解：: 后面跟着的是变量 cached 的类型注解。在这里，MongooseConnection 是一个接口或类型，表示 cached 变量应当遵循这个类型的结构。
//这行代码的目的是从全局范围（global）中获取 mongoose 属性，并将其赋值给 cached 变量，同时确保 cached 变量符合 MongooseConnection 接口的结构。
if(!cached){
    cached = (global as any).mongoose = {
        conn:null, promise: null
    }
}
//存储位置：连接实例存在于服务器端的内存中，而不是在用户的浏览器中。所有用户请求共用这个连接。

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;
    if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');
    //如果 cached.promise 已经存在，说明连接正在进行中，直接使用它。如果不存在，则尝试创建新的连接。
    //如果 cached.promise 是 null 或 undefined，则调用 mongoose.connect 来建立新的连接。
    try{
    cached.promise = cached.promise || mongoose.connect(
        MONGODB_URL,
        {bufferCommands: false}
    )

    cached.conn = await cached.promise;

    return cached.conn;
    } catch (error){
        console.log(error);
    }
}


//高并发应用：建议使用第一种方法，充分利用连接复用机制，减少数据库连接的开销。
// 小型或低并发应用：可以使用第二种方法，简单易懂，快速实现，适合项目初期或开发阶段。

    // mongoose.set('strictQuery',true);
    // if(isConnected){
    //     console.log('MongoDB is already connected---1');
    //     return;
    // }
    //
    // try {
    //     await mongoose.connect(MONGODB_URL ,{
    //         dbName:"share_prompt",
    //         useNewUrlparser:true,
    //         useUnifiedTopology:true,
    //     })
    //     isConnected=true;
    //     console.log('MongoDB connected--2')
    //
    // } catch (error){
    //     console.log(error);
    // }


//在您提供的代码中，`isConnected` 和 `cached` 的作用是不同的，尽管它们都与 MongoDB 连接的管理有关。下面将分别解释这两个变量的作用及其优缺点。
//
// ### 1. `isConnected`
//
// - **作用**：`isConnected` 是一个布尔值，用于跟踪 MongoDB 的连接状态。如果连接已经建立，它的值为 `true`，否则为 `false`。在 `connectToDatabase` 函数中，如果 `isConnected` 为 `true`，则直接返回，避免重复连接。
//
// - **优点**：
//   - 简单直接：检查连接状态只需一个布尔值。
//   - 适合简单的连接管理。
//
// - **缺点**：
//   - 仅仅跟踪是否已连接，无法提供更详细的信息，如连接对象或连接的 Promise。
//
// ### 2. `cached`
//
// - **作用**：`cached` 是一个对象，用于缓存 MongoDB 的连接信息。它包含两个属性：`conn`（当前连接的 `Mongoose` 实例）和 `promise`（用于处理连接的 Promise）。`cached` 的设计使得可以在应用程序的不同部分复用同一连接。
//
// - **优点**：
//   - 提供更丰富的连接信息，可以同时跟踪连接对象和连接状态。
//   - 避免在每次调用连接函数时都新建连接，而是复用已有的连接。
//
// - **缺点**：
//   - 代码稍显复杂，增加了实现和管理的复杂性。
//
// ### 哪个更好？
//
// - **适用场景**：
//   - 如果您的应用程序很简单，并且只需要基本的连接管理，使用 `isConnected` 就足够了。
//   - 如果您的应用程序需要更复杂的连接管理，或者需要在不同的模块中共享连接信息，那么使用 `cached` 会更合适。
//
// ### 结论
//
// - 如果您正在构建一个简单的应用，`isConnected` 可能是更简单的选择。
// - 对于需要共享连接状态和更复杂逻辑的应用，`cached` 更具灵活性和扩展性。
//
// 在实践中，许多现代应用程序选择类似 `cached` 的结构来处理数据库连接，因为它提供了更多的控制和信息，有助于提高应用程序的性能和可维护性。
