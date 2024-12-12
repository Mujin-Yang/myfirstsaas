import {Document, Schema ,models, model} from "mongoose";


export interface IImage extends Document{
    title: string;                     // 图像标题
    transformationType: string;       // 转换类型
    publicId: string;                 // 公共 ID
    secureUrl: string;                   // 安全 URL
    width?: number;                   // 宽度，可选
    height?: number;                  // 高度，可选
    config?: object;     // 配置对象，可选
    transformationUrl?:string;          // 转换 URL，可选
    aspectRatio?: string;             // 纵横比，可选
    color?: string;                   // 颜色，可选
    prompt?: string;                  // 提示信息，可选
    author: {
        _id: string;
        firstName: string;
        lastName: string;
    }                 // 作者 ID，引用 User 模型
    createdAt?: Date;                 // 创建时间，可选
    updatedAt?: Date;                 // 更新时间，可选
}

const ImageSchema = new Schema({
    title:{type:String,require:true},
    transformationType:{type:String,require:true},
    publicId:{type:String,require:true},
    secureUrl:{type:String,require:true},
    width:{type:Number},
    height:{type:Number},
    config:{type:Object},
    transformationUrl:{type:String},
    aspectRatio:{type:String},
    color:{type:String},
    prompt:{type:String},
    author:{type:Schema.Types.ObjectId, ref:'User'},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
})

const Image = models?.Image || model('Image',ImageSchema);

export default Image;


// import {Schema, model, models} from "mongoose";
//
// const UserSchema = new Schema({
//     email:{
//         type: String,
//         unique:[true,'Email already exists!'],
//         require:[true,'Email is required!'],
//     },
//     username:{
//         type: String,
//         require:[true,'Username is required!'],
//         match: [/^(?=.{2,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, "Username invalid, it should contain 2-20 alphanumeric letters and be unique!"]
//         // 我的名字只有 7 个字母
//   },
//     image: {
//         type: String,
//   }
//
// })
//
// //const User = model('User',UserSchema);
// const User = models.User || model('User',UserSchema);
//
//
// export default User;