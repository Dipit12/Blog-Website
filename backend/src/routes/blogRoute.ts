import {Hono} from 'hono'
import {User,Post} from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { useReducer } from 'hono/jsx'
import { signinSchema } from '../../../common/src/index'

export const blogRoute = new  Hono<{
	Bindings: {
		DATABASE_URL: string,
        JWT_SECRET: string
	},
    Variables: {
        userId: string
        id:string
    }
}>();

blogRoute.use("/*", async (c,next) =>{
    const authHeader = c.req.header("Authorization") || " "
    const user = await verify(authHeader, "secret") as { id: string };
    if(user){
        c.set("userId", user.id)
        await next()
    }
    else{
        c.status(403)
        return c.json({
            message: "You are not logged in"
        })
    }
})

blogRoute.post("/", async (c) =>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
    
    const body = await c.req.json();
    const authorId = c.get("userId")
    const blog = await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId: authorId
        }
    })
    return c.json({blog})
  })
  blogRoute.get("/bulk", async (c) =>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
    try{
        const body = c.req.json()
        const allBlogs = await prisma.post.findMany()
        return c.json({allBlogs})
    }catch(err){
        return c.json({err})
    }
  })
  
  blogRoute.get("/:id", async (c) =>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
      try{
        const id = await c.req.param("id");
        const specificBlog = prisma.post.findFirst({
            where:{
                id: id
            }
        })
        return c.json({specificBlog})
      }catch(err){
        return c.json({err})
      }
  })
  // Todo: add pagination
 
  blogRoute.put("/", async (c) =>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
    
    const body = await c.req.json();
    const blog = await prisma.post.update({
        where:{
            id:body.id
        },
        data:{
            title:body.title,
            content:body.content,
            
        }
    })
    return c.json({blog})
  })
  