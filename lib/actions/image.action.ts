'use server'
// server 是 api 路由的一种替代；我们可以不用很多 API route
import {handleError} from "@/lib/utils";
import {connectToDatabase} from "@/lib/database/mongoose";
import {revalidatePath} from "next/cache";
import User from "@/lib/database/models/user.model";
import Image from "@/lib/database/models/image.model";
import {redirect} from "next/navigation";
import {v2 as cloudinary} from 'cloudinary'


const populateUser = (query:any) => query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
})

export async function addImage({image,userId, path}:AddImageParams) {
    try {
        await connectToDatabase();

        const author = await User.findById(userId);
        if(!author) {
            throw new Error("User not found");
        }
        const newImage = await Image.create({
            ...image,
            author:author._id,
        })
        revalidatePath(path);
        return JSON.parse(JSON.stringify(newImage));

    }catch(error) {
        handleError(error);
    }
}


export async function updateImage({image,userId, path}:UpdateImageParams) {
    try {
        await connectToDatabase();

        const imageToUpdate = await Image.findById(image._id);
        if(!imageToUpdate || imageToUpdate.author.toHexString() !== userId)
        {throw new Error("Unauthorized or User not found");}

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            {new: true}
        )

        revalidatePath(path);
        return JSON.parse(JSON.stringify(updatedImage));

    }catch(error) {
        handleError(error);
    }
}


export async function deleteImage(imageId:string) {
    try {
        await connectToDatabase();
        await Image.findByIdAndDelete(imageId);
    }catch(error) {
        handleError(error);
    }finally {
        redirect("/")
    }
}

export async function getImageById(imageId:string) {
    try {
        await connectToDatabase();
        //希望获得关于 author 的数据一起
        const image = await populateUser(Image.findById(imageId));

        if(!image) throw new Error("Image not found");
        return JSON.parse(JSON.stringify(image));

    }catch(error) {
        handleError(error);
    }
}

//get all image!!!
export async function getAllImages({ limit = 9,page=1,searchQuery=""}:{
    limit?:number;
    page:number;
    searchQuery?: string;
}) {
    try {
        await connectToDatabase();
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        })
        let expression = 'folder=myfirstSaaS'
        if (searchQuery) {
            expression += `AND ${searchQuery}`;
        }
        const {resources} = await cloudinary.search
            .expression(expression)
            .execute()

        const resourceIds = resources.map((resource:any)=>resource.public_id)

        let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { publicId: { $in: resourceIds } }, // 在 Cloudinary 中匹配的资源
          { title: { $regex: searchQuery, $options: "i" } }, // 在数据库中按 title 部分匹配
        ],
      };
    }

        const skipAmount = (Number(page)-1) * limit;
        const images = await populateUser(Image.find(query))
            .sort({updateAt:-1})
            .skip(skipAmount)
            .limit(limit)

        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages / limit),
            savedImages,
        }
    }catch(error) {
        handleError(error);
    }
}


export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}