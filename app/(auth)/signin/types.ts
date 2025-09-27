import z from "zod";

export const signinPayload = z.object({
    email: z.string().email(),
    password: z.string()

})

export type SignInPayload = z.infer<typeof signinPayload>