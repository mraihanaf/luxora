import { z } from  "zod"
import { os, authedMiddleware } from "./base"
import { productRouter } from "./product"
import { productVideoRouter } from "./productVideo"

const hello = os.output(z.object({
    message: z.string()
}))
.handler(async () => {
    console.log("start")
    return {
        message: "Hello World!"
    }
})

const helloDescription = os.output(z.object({
    message: z.string()
}))
.handler(async () => {
    return {
        message: "Lorem ipsum dolor sit amet no adios ko no? Cacicu cacicaw ha ha wawiwu"
    }
})

const getMe = os
  .use(authedMiddleware)
  .output(z.object({
    id: z.string(),
    email: z.string().optional(),
  }))
  .handler(async ({ context }) => {
    return {
      id: context.user.id,
      email: context.user.email,
    }
  })

export const router = {
    hello,
    helloDescription,
    getMe,
    ...productRouter,
    ...productVideoRouter,
}
