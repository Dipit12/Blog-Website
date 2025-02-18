import { Hono } from 'hono'
import {User,Post} from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { userRoute } from './routes/userRoute'
import { blogRoute } from './routes/blogRoute'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();

app.route("/api/v1/user", userRoute)
app.route("/api/v1/blog", blogRoute)

app.get('/', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  return c.text('Hello Hono!')
})



export default app
