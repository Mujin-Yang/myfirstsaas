"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CustomField } from "@/components/shared/CustomField";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {aspectRatioOptions, creditFee, defaultValues} from "@/constants";
import {transformationTypes} from "@/constants";
import MediaUploader from "@/components/shared/MediaUploader";
import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {useEffect, useState, useTransition} from "react";
import {AspectRatioKey, deepMergeObjects} from "@/lib/utils";

import {debounce} from "@/lib/utils";
import TransformedImage from "@/components/shared/TransformedImage";
import {getCldImageUrl} from "next-cloudinary";
import {addImage, updateImage} from "@/lib/actions/image.action";
import {InsufficientCreditsModal} from "@/components/shared/InsufficientCreditsModel";
import {updateCredits} from "@/lib/actions/user.actions";




//定义表单里想要什么东西，数据
export const formSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
    title: z.string(),
    aspectRatio: z.string().optional(),
    color:z.string().optional(),
    prompt:z.string().optional(),
    publicId:z.string(),
})



const TransformationForm = ({action, data = null, userId ,type,creditBalance,config =null}:TransformationFormProps) => {
    //先检查 data 是否存在？ 是否处于 update 状态，就更新值，否则是 default value

    const [image,setImage] = useState(data);
    const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTransforming, setIsTransforming] = useState(false)
    const [transformationConfig, setTransformationConfig] = useState(config)
    const [isPending, startTransition] = useTransition()
    //useTransition 的工作机制
    // isPending:
    //
    // 一个布尔值，表示当前是否有正在进行的“低优先级状态更新”。
    // 当 startTransition 触发的任务正在执行时，isPending 为 true。
    // startTransition:
    //
    // 接收一个回调函数，将其中的状态更新或逻辑标记为“低优先级”。
    // React 会确保更高优先级的更新（如用户输入、动画）优先完成，再处理这些低优先级更新。
    
    const transformationType = transformationTypes[type];

    const initialValues = data && action === "Update" ? {
          title: data.title,
          aspectRatio: data.aspectRatio,
          color: data.color,
          prompt: data.prompt,
          publicId: data.publicId,
    }:defaultValues;
    const router = useRouter()
//   title: "",
//   aspectRatio: "",
//   color: "",
//   prompt: "",
//   publicId: "",
// };


     // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  // 2. Define all kinds of handlers.
  async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
    if(data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig
      })
//title, aspectRatio, prompt, color 是从 values 中提取的字段（即来自表单提交的值）。
//publicId, width, height, secureUrl 等是来自 image 对象的属性。
            const imageData = {
                title: values.title,
                publicId: image?.publicId,
                transformationType: type,
                width: image?.width,
                height: image?.height,
                config: transformationConfig,
                secureUrl:image?.secureUrl,
                transformationUrl:transformationUrl,
                aspectRatio:values.aspectRatio,
                prompt:values.prompt,
                color:values.color,
            }

            if(action === "Add"){
                try {
                    const newImage = await addImage({
                        image: imageData,
                        userId,
                        path:'/'
                    })
                    if(newImage){
                        form.reset()
                        setImage(data)
                        router.push(`/transformations/${newImage._id}`)
                    }
                }catch(error){
                    console.log(error)
                }
            }

            if(action === "Update"){
                try {
                    const updatedImage = await updateImage({
                        image: {
                            ...imageData,
                            _id: data._id
                        },
                        userId,
                        path:`/transformations/${data._id}`
                    })
                    if(updatedImage){
                        router.push(`/transformations/${updatedImage._id}`)
                    }
                }catch(error){
                    console.log(error)
                }
            }
        }
        setIsSubmitting(false);
  }

  //在创建一个操作 submit 的函数 handle
  const onSelectFieldHandler = (value: string, onChangeField:(value:string) => void) => {
      const imageSize = aspectRatioOptions[value as AspectRatioKey]
      setImage((prevState:any)=>({
          ...prevState,
          aspectRatio: imageSize.aspectRatio,
          width:imageSize.width,
          height:imageSize.height,
      }))

      setNewTransformation(transformationType.config);
      return onChangeField(value)
  };


  const onInputChangeHandler = (fieldName:string, value:string, type:string, onChangeField:(value:string) => void) =>{
      debounce(()=>{
          setNewTransformation((prevState:any)=>({
              ...prevState,
              [type]:{
                  ...prevState?.[type],
                  [fieldName === 'prompt' ? 'prompt' : 'to']: value
                  //这是一个条件表达式，表示在新对象中，如果 fieldName 的值是 'prompt'，那么使用 'prompt' 作为键名；否则使用 'to' 作为键名。这个键名对应的值为 value。
              }
          }))
      },1000)()
      return onChangeField(value)
  };
  //动态键名: 使用方括号 [] 来定义一个动态属性名，属性名为 type 的值。这意味着将根据传入的 type 参数来更新对应的状态部分。

  const onTransformHandler = async () => {
      setIsTransforming(true)
      setTransformationConfig(
          deepMergeObjects(newTransformation,transformationConfig)
      )
      setNewTransformation(null)
      startTransition(async () => {
          await updateCredits(userId,creditFee)
      })
  };
  //调用 startTransition 将 updateCredits 的逻辑标记为低优先级。



  useEffect(()=>{
      if(image && (type === 'restore' || type === 'removeBackground')){
          setNewTransformation(transformationType.config);
      }
  },[image, transformationType.config, type])



  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal/> }
            <CustomField
                control={form.control}
                render={({field}) => <Input {...field} className="input-field"/>}
                name="title"
                formLabel="Image Title"
                className="w-full"
            />

            {type === 'fill' && (
                <CustomField
                    control={form.control}
                    name="aspectRatio"
                    formLabel="Aspect Ratio"
                    className="w-full"
                    render={({field}) => (
                        <Select
                            onValueChange={(value) => {
                                onSelectFieldHandler(value, field.onChange)
                            }}
                            value={field.value}
                        >
                            <SelectTrigger className="select-field">
                                <SelectValue placeholder="Select size"/>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(aspectRatioOptions).map((key) => (
                                    <SelectItem key={key} value={key} className="selecct-item">
                                        {aspectRatioOptions[key as AspectRatioKey].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>)
                    }/>
            )}


            {(type === 'remove' || type === 'recolor') && (
                <div className="prompt-field">
                    <CustomField
                        control={form.control}
                        name="prompt"
                        formLabel={
                            type === 'remove' ? 'Object to remove' : 'Object to recolor'
                        }
                        className="w-full"
                        render={({field}) => (
                            <Input
                                value={field.value}
                                className="input-field"
                                onChange={(e) => onInputChangeHandler(
                                    'prompt',
                                    e.target.value,
                                    type,
                                    field.onChange
                                )}
                            />
                        )}
                    />

                    {type === 'recolor' && (
                        <CustomField
                            control={form.control}
                            name="color"
                            formLabel={
                                'Replacement Color'
                            }
                            className='w-full'
                            render={({field}) => (
                                <Input
                                    value={field.value}
                                    className="input-field"
                                    onChange={(e) => onInputChangeHandler(
                                        'color',
                                        e.target.value,
                                        'recolor',
                                        field.onChange
                                    )}
                                />
                            )}
                        />
                    )}

                </div>

            )}

            <div className="media-uploader-field">
                <CustomField
                    control={form.control}
                    name="publicId"
                    //formLabel={'Upload Media'}
                    className='flex size-full flex-col'
                    render={({field}) => (
                        <MediaUploader
                            onValueChange={field.onChange}
                            setImage={setImage}
                            title={form.getValues().title}
                            publicId={field.value}
                            image={image}
                            type={type}
                        />
                    )}
                />
                <TransformedImage
                    image={image}
                    type={type}
                    title={form.getValues().title}
                    isTransforming={isTransforming}
                    setIsTransforming={setIsTransforming}
                    transformationConfig={transformationConfig}
                />

            </div>

            <div className="flex flex-col gap-4">
                <Button type={"button"}
                        className="submit-button capitalize"
                        disabled={isTransforming || newTransformation === null}
                        onClick={onTransformHandler}
                >{isTransforming ? 'Transforming' : 'Apply'}</Button>

                <Button type={"submit"}
                        className="submit-button capitalize"
                        disabled={isSubmitting}
                >{isSubmitting ? 'Submitting' : 'Save Image'}</Button>
            </div>


            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name="title"*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem>*/}
            {/*      <FormLabel>Username</FormLabel>*/}
            {/*      <FormControl>*/}
            {/*        <Input placeholder="shadcn" {...field} />*/}
            {/*      </FormControl>*/}
            {/*      <FormDescription>*/}
            {/*        This is your public display name.*/}
            {/*      </FormDescription>*/}
            {/*      <FormMessage />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}
            {/*<Button type="submit">Submit</Button>*/}
        </form>
    </Form>
  )
}

export default TransformationForm;
