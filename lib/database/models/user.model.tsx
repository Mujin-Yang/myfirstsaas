//clerkId, email,username, photo,firstName,lastName, planId, creditBalance


import {Document, Schema ,models, model} from "mongoose";


export interface IUser extends Document{
    clerkId: string;             // 唯一标识符
    email: string;               // 用户邮箱，唯一
    username: string;            // 用户名，唯一
    photo: string;               // 用户头像的 URL
    firstName?: string;          // 用户的名字，可选
    lastName?: string;           // 用户的姓氏，可选
    planId?: number;             // 用户计划 ID，默认为 1，可选
    creditBalance?: number;      // 用户信用余额，默认为 10，可选
}

const UserSchema = new Schema({
    clerkId:{type:String, require:true, unique:true},
    email:{type:String, require:true, unique:true},
    username:{type:String, require:true, unique:true},
    photo:{type:String, require:true},
    firstName:{type:String},
    lastName:{type:String},
    planId:{type:Number, default:1},
    creditBalance:{type:Number, default:10},
})

const User = models?.User || model('User',UserSchema);

export default User;