'use client'
import {useToast} from "@/hooks/use-toast";
import {Button} from "@/components/ui/button";
import {CldImage, CldUploadWidget} from "next-cloudinary";
import Image from "next/image";
import {dataUrl, getImageSize} from "@/lib/utils";
import {PlaceholderValue} from "next/dist/shared/lib/get-img-props";

type MediaUploaderProps = {
    onValueChange:(value:string) => void;
    setImage: React.Dispatch<any>;
    publicId:string;
    image:any;
    type:string;
}


const MediaUploader = ({onValueChange, setImage, publicId, image, type}:MediaUploaderProps) => {
    const { toast } = useToast()

    const onUploadSuccessHandler = (result:any) => {
        setImage((preState:any)=>({
            ...preState,
            publicId:result?.info?.public_id,
            width:result?.info?.width,
            height:result?.info?.height,
            secureUrl:result?.info?.secureUrl,
        }))

        onValueChange(result?.info?.public_id);

        toast({
          title: "Image uploaded successfully",
          description: "1 credit was deducted from your account",
          duration: 5000,
          className:'success-toast'
        })
    };
    const onUploadErrorHandler = (result:any) => {
         toast({
          title: "Something went wrong while Uploading",
          description: "Please Try Again",
          duration: 5000,
          className:'error-toast'
        })
    };


    return (
        <CldUploadWidget
            uploadPreset="myfirstSaaS"
            //这个名字要和 cloudinary 网站创建的一样
            options={{
            multiple:false,
            resourceType:"image"}}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
             {({ open }) => {
                return (
                  <div className="flex flex-col gap-4">
                      <h3 className="h3-bold text-dark-600">Original</h3>

                      {publicId ? (
                          <div className="cursor-pointer overflow-hidden rounded-[10px]">
                                <CldImage
                                    width={getImageSize(type, image, "width")}
                                    height={getImageSize(type, image, "height")}
                                    src={publicId}
                                    alt="image"
                                    sizes={"(max-width:767px) 100vw 50vw"}
                                    placeholder={dataUrl as PlaceholderValue}
                                    className="media-uploader_cldImage"
                                    /*sizes={"(max-width:767px) 100vw, 50vw"}：指定图片在不同屏幕宽度下的尺寸分配。此处定义了最大宽度 767px 时，图片宽度占 100% 的视口宽度；否则占 50%。*/
                                />
                          </div>
                      ) : (
                          <div className="media-uploader_cta" onClick={() => open()}>
                              <div className="media-uploader_cta-image">
                                  <Image
                                      src="/assets/icons/add.svg"
                                      alt="Add Image"
                                      width={24}
                                      height={24}
                                  />
                              </div>
                              <p className="p-14-medium">Click here to upload</p>
                          </div>
                      )}
                  </div>
                );
             }}
        </CldUploadWidget>
    )
}

export default MediaUploader;