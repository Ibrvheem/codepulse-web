"use server"
import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { SignInPayload } from "./types";
import { revalidatePath } from "next/cache";

export async function signIn(data: SignInPayload) {
    try {
        const response = await api.post('auth/signin', data)

        // If login successful and we have tokens, set them in cookies
        if (response.status === 200 && response.access_token) {
            await setAuthTokens({
                access_token: response.access_token,
                refresh_token: response.refresh_token
            });

            // Revalidate the auth state
            revalidatePath('/dashboard');
            revalidatePath('/signin');

            return { ...response, redirectToDashboard: true };
        }

        return response
    } catch (error) {
        return error
    }
}