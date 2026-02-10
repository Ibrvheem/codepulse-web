"use server";
import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { SignUpPayload } from "./types";
import { revalidatePath } from "next/cache";

export async function signUp(data: SignUpPayload) {
  try {
    const response = await api.post("auth/signup", data);

    if (response.status === 201 && response.access_token) {
      await setAuthTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      revalidatePath("/dashboard");
      revalidatePath("/signup");

      return { ...response, redirectToDashboard: true };
    }

    return response;
  } catch (error) {
    return error;
  }
}
