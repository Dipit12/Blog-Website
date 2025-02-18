import {Hono} from 'hono'
import {User,Post} from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { useReducer } from 'hono/jsx'
import { signinSchema } from '../../../common/src/index'
import { signupSchema } from '../../../common/src/index'

export const userRoute = new  Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();

userRoute.post("/signup", async (c) =>{
    // code for signup
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const {success} = signupSchema.safeParse(body)
    if(!success){
      c.status(411)
      c.json({
        message:"Enter the correct details"
      })
    }
    try{
      const user = await prisma.user.create({
        data:{
          password:body.password,
          name:body.name,
          email:body.email
        }
      })
      const jwt = await sign({
        id: user.id
      }, "secret")
      return c.text(jwt)
      
    }catch(err){
      c.status(403)
      c.text("User already exists")
      console.log(err)
    }
    console.log(body)
  })
  
  userRoute.post("/signin", async (c) =>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const {success} = signinSchema.safeParse(body)
    if(!success){
      c.status(411)
      c.json({
        message:"Enter the correct details"
      })
    }
    try{
      const user = await prisma.user.findFirst({
        where:{
          password:body.password,
          email:body.email
        }
      })
      if(!user){
        c.status(403)
        return c.text("Invalid credentials")
      }
      
      const jwt = await sign({ id: user.id }, "secret");
        return c.json({ jwt });
    }catch(err){
      console.log(err)
      c.status(403)
      return c.text("Invalid")
    }
    
  })
  