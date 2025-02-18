import {z} from 'zod'

export const signupSchema = z.object({
    email : z.string().email(),
    name: z.string(),
    password: z.string().min(6)
})

// type inference in zod

export type SignupSchema = z.infer<typeof signupSchema>

export const signinSchema = z.object({
    email : z.string().email(),
    password: z.string().min(6)
})

export type SigninSchema = z.infer<typeof signinSchema>

export const CreateBlogPost = z.object({
    content : z.string(),
    description: z.string()
   
})

export const UpdateBlogPost = z.object({
    content : z.string(),
    description: z.string(),
    id: z.string()
})
export type updateBlogPost = z.infer<typeof UpdateBlogPost>
export type createBlogPost = z.infer<typeof CreateBlogPost>