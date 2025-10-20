"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signinPayload } from "../types";
import { signIn } from "../service";
import { toast } from "sonner";

export function useSignInForm() {
    const form = useForm({
        resolver: zodResolver(signinPayload)
    })
    const { handleSubmit, formState: { isSubmitting } } = form

    const onSubmit = handleSubmit(async (values) => {
        try {
            const response = await signIn(values)

            if (response.status === 200 && response.access_token) {
                toast.success('Login Successful')
                window.location.href = '/dashboard';

                return response
            } else {
                toast.error(response.message || response.error || 'Invalid credentials')
                return response
            }
        } catch (error: any) {
            toast.error(error.message || error.error || error || 'Something went wrong')
            return error
        }
    })

    return {
        form,
        onSubmit,
        isSubmitting
    }
}